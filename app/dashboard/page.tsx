"use client"

import { Navbar } from '@/app/components/Navbar'
import { IPInput } from '@/app/components/IPInput'
import { IPDataTable } from '@/app/components/IPDataTable'
import { StatisticalSummary } from '@/app/components/StatisticalSummary'
import { IPVisualizations } from '@/app/components/IPVisualizations'
import { ExportOptions } from '@/app/components/ExportOptions'
import { PreviousSearches } from '@/app/components/PreviousSearches'
import { Progress } from "@/components/ui/progress"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from 'react'
import { IPData } from "@/app/types/ip"

interface SavedSearch {
  id: string
  userId: string
  timestamp: string
  results: IPData[]
}

const transformResults = (data: any[]): IPData[] => {
  return data.map(item => ({
    ip: item.ip,
    ipInfo: {
      country: item.country || 'Unknown',
      region: item.region || 'Unknown',
      city: item.city || 'Unknown',
      isp: item.isp || 'Unknown',
      org: item.org || 'Unknown',
      as: item.as || 'Unknown',
      lat: item.lat || 0,
      lon: item.lon || 0
    },
    reputation: item.reputation
  }))
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser()
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

    setResults(analysisResults)
    saveSearch(analysisResults.map(r => r.ip), analysisResults)
    setProgress(100)
    setAnalyzing(false)
  }

  const saveSearch = (ips: string[], results: IPData[]) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      userId: '',
      timestamp: Date.now().toString(),
      results
    }
    const updatedSearches = [newSearch, ...searches].slice(0, 10)
    setSearches(updatedSearches)
    localStorage.setItem('ip-analyzer-searches', JSON.stringify(updatedSearches))
  }

  const loadPreviousSearch = (results: IPData[]) => {
    setResults(results)
  }

  const handleResults = (data: any[]) => {
    setResults(transformResults(data))
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-6 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-8">
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