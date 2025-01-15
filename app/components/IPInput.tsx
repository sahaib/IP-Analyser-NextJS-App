"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { isValidIP } from '@/app/utils/ipValidation'
import { AlertCircle } from 'lucide-react'
import { IPData } from "@/app/types/ip"

export function IPInput({ onAnalyze }: { onAnalyze: (results: IPData[]) => void | Promise<void> }) {
  const [ipList, setIpList] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [invalidIPs, setInvalidIPs] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const ips = ipList.split('\n').map(ip => ip.trim()).filter(ip => ip)
    const invalid = ips.filter(ip => !isValidIP(ip))
    setInvalidIPs(invalid)
  }, [ipList])

  const handleAnalyze = async () => {
    const ips = ipList.split('\n').map(ip => ip.trim()).filter(ip => ip)
    
    if (ips.length === 0) {
      toast({
        title: "No IP addresses entered",
        description: "Please enter at least one IP address.",
        variant: "destructive",
      })
      return
    }

    if (ips.length > 1000) {
      toast({
        title: "Too many IP addresses",
        description: "Please enter no more than 1000 IP addresses.",
        variant: "destructive",
      })
      return
    }

    if (invalidIPs.length > 0) {
      toast({
        title: "Invalid IP addresses detected",
        description: `Please correct the following IP addresses: ${invalidIPs.join(', ')}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ips }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze IP addresses')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      onAnalyze(data.results)
    } catch (error) {
      console.error('Error analyzing IP addresses:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze IP addresses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setIpList(content)
      }
      reader.readAsText(file)
    }
  }

  const sampleIPs = [
    "8.8.8.8",
    "1.1.1.1",
    "208.67.222.222",
    "9.9.9.9",
    "64.6.64.6"
  ].join('\n')

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <Label htmlFor="ip-input">Enter IP Addresses (one per line)</Label>
        <Textarea
          id="ip-input"
          placeholder="Enter IP addresses here..."
          value={ipList}
          onChange={(e) => setIpList(e.target.value)}
          rows={10}
          className={invalidIPs.length > 0 ? 'border-red-500' : ''}
        />
        {invalidIPs.length > 0 && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {invalidIPs.length} invalid IP address(es) detected
          </p>
        )}
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleAnalyze} disabled={isLoading || invalidIPs.length > 0}>
          {isLoading ? 'Analyzing...' : 'Analyze IPs'}
        </Button>
        <Button variant="outline" onClick={() => setIpList(sampleIPs)}>
          Load Sample IPs
        </Button>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".txt,.csv"
            onChange={handleFileUpload}
          />
          <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
            Upload File
          </Button>
        </div>
      </div>
    </div>
  )
}

