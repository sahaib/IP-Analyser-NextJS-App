"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { IPData } from "@/app/types/ip"

interface SavedSearch {
  id: string
  userId: string
  timestamp: string
  results: IPData[]
}

export function PreviousSearches({ onLoad }: { onLoad: (results: IPData[]) => void }) {
  const [searches, setSearches] = useState<SavedSearch[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('ip-analyzer-searches')
    if (saved) {
      setSearches(JSON.parse(saved))
    }
  }, [])

  const saveSearch = (results: IPData[]) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      userId: '',
      timestamp: new Date().toISOString(),
      results
    }
    const updatedSearches = [newSearch, ...searches].slice(0, 10)
    setSearches(updatedSearches)
    localStorage.setItem('ip-analyzer-searches', JSON.stringify(updatedSearches))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          Previous Searches
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Previous Searches</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-4">
            {searches.map((search, index) => (
              <div
                key={search.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => onLoad(search.results)}
              >
                <div className="font-medium">
                  {new Date(search.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {search.results.length} IP addresses analyzed
                </div>
              </div>
            ))}
            {searches.length === 0 && (
              <div className="text-center text-muted-foreground">
                No previous searches found
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

