"use client"

import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { IPInput } from './components/IPInput'
import { IPDataTable } from './components/IPDataTable'
import { StatisticalSummary } from './components/StatisticalSummary'
import { IPVisualizations } from './components/IPVisualizations'
import { ExportOptions } from './components/ExportOptions'
import { PreviousSearches } from './components/PreviousSearches'
import { Progress } from "@/components/ui/progress"
import { Toaster } from "@/components/ui/toaster"
import { WorldMap } from './components/WorldMap'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

interface IPData {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  org: string
  as: string
  lat?: number
  lon?: number
}

interface SavedSearch {
  timestamp: number
  ips: string[]
  results: IPData[]
}

// Cache for IP lookups
const ipCache = new Map<string, IPData>()

export default function Home() {
  const [results, setResults] = useState<IPData[]>([])
  const [progress, setProgress] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [batchSize, setBatchSize] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)

  // Load previous searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('ip-analyzer-searches')
    if (saved) {
      setSearches(JSON.parse(saved))
    }
  }, [])

  const saveSearch = (ips: string[], results: IPData[]) => {
    const newSearch: SavedSearch = {
      timestamp: Date.now(),
      ips,
      results
    }
    const updatedSearches = [newSearch, ...searches].slice(0, 10)
    setSearches(updatedSearches)
    localStorage.setItem('ip-analyzer-searches', JSON.stringify(updatedSearches))
  }

  const handleAnalyze = async (analysisResults: IPData[]) => {
    setAnalyzing(true)
    setProgress(0)
    setBatchSize(analysisResults.length)
    setProcessedCount(0)

    const batchSize = 10
    for (let i = 0; i < analysisResults.length; i += batchSize) {
      const batch = analysisResults.slice(i, i + batchSize)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setProcessedCount(prev => prev + batch.length)
      setProgress(Math.round((i + batch.length) / analysisResults.length * 100))
    }

    // Cache the results
    analysisResults.forEach(result => {
      ipCache.set(result.ip, result)
    })

    setResults(analysisResults)
    saveSearch(analysisResults.map(r => r.ip), analysisResults)
    setProgress(100)
    setAnalyzing(false)
  }

  const loadPreviousSearch = (results: IPData[]) => {
    setResults(results)
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-8">
        <Hero />
        <div className="mb-6">
          <div className="flex justify-end mb-4">
            <PreviousSearches onLoad={loadPreviousSearch} />
          </div>
          <IPInput onAnalyze={handleAnalyze} />
        </div>
        
        {analyzing && (
          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing IP Addresses</AlertTitle>
            <AlertDescription>
              Analyzed {processedCount} of {batchSize} IP addresses ({progress}% complete)
            </AlertDescription>
            <Progress value={progress} className="mt-2" />
          </Alert>
        )}
        
        {results.length > 0 && (
          <div className="space-y-6">
            <StatisticalSummary data={results} />
            <WorldMap data={results} />
            <IPVisualizations data={results} />
            <div className="flex justify-end">
              <ExportOptions data={results} />
            </div>
            <IPDataTable data={results} />
          </div>
        )}
      </main>
      <Toaster />
    </div>
  )
}

