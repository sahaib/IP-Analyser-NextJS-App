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

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser()
  const [results, setResults] = useState<IPData[]>([])
  const [progress, setProgress] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [batchSize, setBatchSize] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('ip-analyzer-searches')
    if (saved) {
      setSearches(JSON.parse(saved))
    }
  }, [])

  const loadPreviousSearch = (results: IPData[]) => {
    setResults(results)
  }

  const handleAnalyze = async (results: IPData[]) => {
    setAnalyzing(true)
    setProgress(0)
    setBatchSize(results.length)
    setProcessedCount(0)

    const batchSize = 10
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessedCount(prev => prev + batch.length)
      setProgress(Math.round((i + batch.length) / results.length * 100))
    }

    setResults(results)
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      userId: '',
      timestamp: new Date().toISOString(),
      results
    }
    const updatedSearches = [newSearch, ...searches].slice(0, 10)
    setSearches(updatedSearches)
    localStorage.setItem('ip-analyzer-searches', JSON.stringify(updatedSearches))
    setProgress(100)
    setAnalyzing(false)
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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Welcome to IP Analyzer</h1>
            <p className="mt-4 text-lg text-muted-foreground">Please sign in to continue</p>
          </div>
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

