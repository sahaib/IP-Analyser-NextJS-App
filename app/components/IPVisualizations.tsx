"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts'
import { IPData } from "@/app/types/ip"

const COLORS = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#673ab7']

export function IPVisualizations({ data }: { data: IPData[] }) {
  // Filter out entries with null ipInfo
  const validData = data.filter(item => item.ipInfo !== null)

  const countryDistribution = validData.reduce((acc, item) => {
    const country = item.ipInfo.country
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const ispDistribution = validData.reduce((acc, item) => {
    const isp = item.ipInfo.isp
    acc[isp] = (acc[isp] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-medium">Top 5 Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(countryDistribution)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-medium">ISP Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(ispDistribution)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {Object.entries(ispDistribution)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, entry: any) => [`${entry.payload.percentage}%`, entry.payload.name]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry: any) => `${entry.payload.name} ${entry.payload.percentage}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

