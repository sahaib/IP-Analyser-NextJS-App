"use client"

import { Button } from "@/components/ui/button"
import { Download, Copy, Printer } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { IPData } from "@/app/types/ip"

export function ExportOptions({ data }: { data: IPData[] }) {
  const { toast } = useToast()

  const exportToCSV = () => {
    const headers = [
      'IP Address',
      'Reputation Status',
      'Confidence Score',
      'Last Reported',
      'Sources',
      'Details',
      'Risk Factors',
      'Threat Categories',
      'Recommendations',
      'Country',
      'Region',
      'City',
      'ISP',
      'Organization',
      'AS',
      'Latitude',
      'Longitude'
    ]
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.ip,
        item.reputation?.status || 'unknown',
        item.reputation?.confidence_score || '',
        item.reputation?.last_reported || '',
        (item.reputation?.sources || []).join(';'),
        item.reputation?.details || '',
        (item.reputation?.risk_factors || []).join(';'),
        (item.reputation?.threat_categories || []).join(';'),
        (item.reputation?.recommendations || []).join(';'),
        item.ipInfo?.country || 'Unknown',
        item.ipInfo?.region || 'Unknown',
        item.ipInfo?.city || 'Unknown',
        item.ipInfo?.isp || 'Unknown',
        item.ipInfo?.org || 'Unknown',
        item.ipInfo?.as || 'Unknown',
        item.ipInfo?.lat || '',
        item.ipInfo?.lon || ''
      ].map(value => `"${value}"`).join(','))
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
      `${item.ip}\t${item.reputation?.status || 'unknown'}\t${item.reputation?.confidence_score || ''}\t${item.ipInfo?.country || 'Unknown'}\t${item.ipInfo?.region || 'Unknown'}\t${item.ipInfo?.city || 'Unknown'}\t${item.ipInfo?.isp || 'Unknown'}\t${item.ipInfo?.org || 'Unknown'}\t${item.ipInfo?.as || 'Unknown'}`
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
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .reputation-clean { color: green; }
              .reputation-suspicious { color: orange; }
              .reputation-malicious { color: red; }
              .details-section { margin-top: 10px; font-size: 0.9em; }
              .risk-factors, .threat-categories, .recommendations { 
                margin-top: 5px;
                padding-left: 20px;
              }
            </style>
          </head>
          <body>
            <h1>IP Analysis Report</h1>
            <table>
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Reputation</th>
                  <th>Location</th>
                  <th>Network Info</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr>
                    <td>${item.ip}</td>
                    <td class="reputation-${item.reputation?.status || 'unknown'}">
                      <strong>${item.reputation?.status || 'Unknown'}</strong>
                      ${item.reputation?.confidence_score ? `<br>Confidence: ${item.reputation.confidence_score}%` : ''}
                      ${item.reputation?.details ? `
                        <div class="details-section">
                          <div><strong>Details:</strong> ${item.reputation.details}</div>
                          ${item.reputation.risk_factors?.length ? `
                            <div class="risk-factors">
                              <strong>Risk Factors:</strong>
                              <ul>${item.reputation.risk_factors.map(rf => `<li>${rf}</li>`).join('')}</ul>
                            </div>
                          ` : ''}
                          ${item.reputation.threat_categories?.length ? `
                            <div class="threat-categories">
                              <strong>Threat Categories:</strong>
                              <ul>${item.reputation.threat_categories.map(tc => `<li>${tc}</li>`).join('')}</ul>
                            </div>
                          ` : ''}
                          ${item.reputation.recommendations?.length ? `
                            <div class="recommendations">
                              <strong>Recommendations:</strong>
                              <ul>${item.reputation.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
                            </div>
                          ` : ''}
                        </div>
                      ` : ''}
                    </td>
                    <td>
                      ${item.ipInfo?.country || 'Unknown'}<br>
                      ${item.ipInfo?.region || 'Unknown'}<br>
                      ${item.ipInfo?.city || 'Unknown'}
                    </td>
                    <td>
                      <strong>ISP:</strong> ${item.ipInfo?.isp || 'Unknown'}<br>
                      <strong>Organization:</strong> ${item.ipInfo?.org || 'Unknown'}<br>
                      <strong>AS:</strong> ${item.ipInfo?.as || 'Unknown'}
                    </td>
                    <td>
                      ${item.ipInfo?.lat ? `Lat: ${item.ipInfo.lat}` : 'Unknown'}<br>
                      ${item.ipInfo?.lon ? `Lon: ${item.ipInfo.lon}` : 'Unknown'}
                    </td>
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

