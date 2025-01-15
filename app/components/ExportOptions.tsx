"use client"

import { Button } from "@/components/ui/button"
import { Download, Copy, Printer } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface IPData {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  org: string
  as: string
}

export function ExportOptions({ data }: { data: IPData[] }) {
  const { toast } = useToast()

  const exportToCSV = () => {
    const headers = ['IP Address', 'Country', 'Region', 'City', 'ISP', 'Organization', 'AS']
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.ip,
        item.country,
        item.region,
        item.city,
        item.isp,
        item.org,
        item.as
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'ip_analysis.csv'
    link.click()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'ip_analysis.json'
    link.click()
  }

  const copyToClipboard = async () => {
    const text = data.map(item => 
      `${item.ip}\t${item.country}\t${item.region}\t${item.city}\t${item.isp}\t${item.org}\t${item.as}`
    ).join('\n')
    
    await navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The IP analysis data has been copied to your clipboard.",
    })
  }

  const printData = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>IP Analysis Report</title>
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <h1>IP Analysis Report</h1>
            <table>
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Country</th>
                  <th>Region</th>
                  <th>City</th>
                  <th>ISP</th>
                  <th>Organization</th>
                  <th>AS</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr>
                    <td>${item.ip}</td>
                    <td>${item.country}</td>
                    <td>${item.region}</td>
                    <td>${item.city}</td>
                    <td>${item.isp}</td>
                    <td>${item.org}</td>
                    <td>${item.as}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportToCSV}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={exportToJSON}>
        <Download className="mr-2 h-4 w-4" />
        Export JSON
      </Button>
      <Button variant="outline" onClick={copyToClipboard}>
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
      <Button variant="outline" onClick={printData}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
    </div>
  )
}

