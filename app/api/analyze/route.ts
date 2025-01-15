import { NextResponse } from 'next/server'
import axios from 'axios'
import { isValidIP } from '@/app/utils/ipValidation'
import { Redis } from '@upstash/redis'
import { auth } from '@clerk/nextjs/server'

const IP_API_ENDPOINT = 'http://ip-api.com/json'
const CLAUDE_API_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const RATE_LIMIT = 1000 // Maximum IPs per request
const CLAUDE_RATE_LIMIT = 10 // Maximum Claude API calls per minute
const CLAUDE_WINDOW = 60 // 1 minute window
const TIMEOUT = 30000; // 30 seconds timeout
const BATCH_SIZE = 5; // Process 5 IPs at a time

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

async function validateTempToken(userId: string, token: string): Promise<boolean> {
  const tokenKey = `token:${userId}:${token}`
  const isValid = await redis.get(tokenKey)
  if (isValid) {
    await redis.del(tokenKey) // One-time use token
    return true
  }
  return false
}

async function checkClaudeRateLimit(userId: string): Promise<boolean> {
  const key = `claude:${userId}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, CLAUDE_WINDOW)
  }
  return count <= CLAUDE_RATE_LIMIT
}

interface IPInfo {
  country: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  as: string;
  lat?: number;
  lon?: number;
}

async function getIPInfo(ip: string): Promise<IPInfo | null> {
  try {
    // Using basic endpoint without fields parameter for maximum compatibility
    const response = await axios.get(`${IP_API_ENDPOINT}/${ip}`);
    
    // Add debug logging
    console.log(`IP API Response for ${ip}:`, response.data);
    
    if (response.data.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        region: response.data.regionName || 'Unknown',
        city: response.data.city || 'Unknown',
        isp: response.data.isp || 'Unknown',
        org: response.data.org || 'Unknown',
        as: response.data.as || 'Unknown',
        lat: response.data.lat,
        lon: response.data.lon
      };
    }
    console.error(`IP API error for ${ip}:`, response.data);
    return null;
  } catch (error) {
    console.error(`Error getting IP info for ${ip}:`, error);
    return null;
  }
}

async function analyzeIPWithClaude(ip: string, userId: string) {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      return null
    }

    // Check Claude API rate limit
    const withinLimit = await checkClaudeRateLimit(userId)
    if (!withinLimit) {
      throw new Error('Claude API rate limit exceeded')
    }

    const prompt = `Analyze the IP address ${ip} for potential security threats and reputation. Consider the following aspects:

1. Known malicious activities
2. Presence in threat intelligence databases
3. Historical security incidents
4. Network behavior patterns
5. Association with spam or abuse
6. Hosting provider reputation
7. Geographic risk factors
8. Recent security reports

Provide a comprehensive analysis in the following JSON format:
{
  "status": "clean|suspicious|malicious",
  "confidence_score": 0-100,
  "risk_factors": ["list of specific risk factors"],
  "recent_activities": ["list of recent suspicious activities"],
  "threat_categories": ["types of threats associated"],
  "first_seen": "date first seen in threat reports",
  "last_reported": "date of most recent report",
  "sources": ["list of intelligence sources"],
  "details": "brief summary of findings",
  "recommendations": ["list of recommended actions"]
}

Base your analysis on known threat intelligence sources and security databases. If information is not available, use null for those fields.`

    const response = await axios.post(
      CLAUDE_API_ENDPOINT,
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: prompt
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    )

    const analysisText = response.data.content[0].text
    const analysis = JSON.parse(analysisText)

    return {
      status: analysis.status,
      confidence_score: analysis.confidence_score,
      sources: analysis.sources,
      last_reported: analysis.last_reported,
      details: analysis.details,
      risk_factors: analysis.risk_factors,
      threat_categories: analysis.threat_categories,
      recommendations: analysis.recommendations
    }
  } catch (error) {
    console.error(`Error analyzing IP ${ip} with Claude:`, error)
    return null
  }
}

interface IPAnalysisResult {
  ipInfo: IPInfo | null;
  reputation: Awaited<ReturnType<typeof analyzeIPWithClaude>>;
}

async function analyzeIP(ip: string, userId: string): Promise<IPAnalysisResult> {
  const [ipInfo, reputation] = await Promise.all([
    getIPInfo(ip),
    analyzeIPWithClaude(ip, userId)
  ]);

  return {
    ipInfo,
    reputation
  };
}

export async function POST(req: Request) {
  try {
    const { ips } = await req.json();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User not authenticated' },
        { status: 401 }
      );
    }

    if (!Array.isArray(ips) || ips.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request - ips must be a non-empty array' },
        { status: 400 }
      );
    }

    const results = [];
    for (let i = 0; i < ips.length; i += BATCH_SIZE) {
      const batch = ips.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(ip => {
        return Promise.race([
          analyzeIP(ip, userId).then(result => ({ ip, ...result, status: 'success' })),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analysis timeout')), TIMEOUT)
          )
        ]).catch(error => ({
          ip,
          error: error.message,
          status: 'error'
        }));
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

