"use client"

import { useState, useEffect } from "react"
import { Loader2, BarChart3, PieChart, LineChart, GitCommit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"
import { compareJsonObjects, countChanges } from "@/lib/json-diff"
import type { Commit } from "@/lib/types"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface CommitAnalysisProps {
  commits: Commit[]
  isLoading: boolean
  selectedFile: string
}

export default function CommitAnalysis({ commits, isLoading, selectedFile }: CommitAnalysisProps) {
  const [activeTab, setActiveTab] = useState("evolution")
  const [evolutionData, setEvolutionData] = useState<any>(null)
  const [structureData, setStructureData] = useState<any>(null)
  const [changeFrequencyData, setChangeFrequencyData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Process commits data for analysis
  useEffect(() => {
    if (!commits || commits.length < 2 || !commits[0].data) {
      if (commits && commits.length >= 2 && !commits[0].data) {
        setError("Failed to load data for selected commits. Please try again.")
      }
      return
    }

    try {
      // Sort commits by date
      const sortedCommits = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Evolution data - track changes over time
      const labels = sortedCommits.map((commit) => commit.hash.substring(0, 7))
      const dates = sortedCommits.map((commit) => new Date(commit.date).toLocaleDateString())

      // For each commit, compare with the previous one
      const changeData = []
      for (let i = 1; i < sortedCommits.length; i++) {
        const prevCommit = sortedCommits[i - 1]
        const currentCommit = sortedCommits[i]

        if (prevCommit.data && currentCommit.data) {
          const diff = compareJsonObjects(prevCommit.data, currentCommit.data)
          const { added, removed, changed } = countChanges(diff)
          changeData.push({ added, removed, changed })
        }
      }

      // Add a zero point for the first commit
      changeData.unshift({ added: 0, removed: 0, changed: 0 })

      setEvolutionData({
        labels,
        dates,
        datasets: [
          {
            label: "Added",
            data: changeData.map((d) => d.added),
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.5)",
            tension: 0.3,
          },
          {
            label: "Removed",
            data: changeData.map((d) => d.removed),
            borderColor: "rgb(239, 68, 68)",
            backgroundColor: "rgba(239, 68, 68, 0.5)",
            tension: 0.3,
          },
          {
            label: "Changed",
            data: changeData.map((d) => d.changed),
            borderColor: "rgb(245, 158, 11)",
            backgroundColor: "rgba(245, 158, 11, 0.5)",
            tension: 0.3,
          },
        ],
      })

      // Structure data - analyze the latest commit structure
      const latestCommit = sortedCommits[sortedCommits.length - 1]
      if (latestCommit.data) {
        const analyzeStructure = (obj: any, prefix = "") => {
          const result: Record<string, number> = {}

          const traverse = (o: any, path = "") => {
            if (!o || typeof o !== "object") return

            Object.keys(o).forEach((key) => {
              const currentPath = path ? `${path}.${key}` : key
              const category = prefix ? currentPath.split(".")[0] : currentPath

              result[category] = (result[category] || 0) + 1

              if (o[key] && typeof o[key] === "object") {
                traverse(o[key], currentPath)
              }
            })
          }

          traverse(obj)
          return result
        }

        const structure = analyzeStructure(latestCommit.data)

        setStructureData({
          labels: Object.keys(structure),
          datasets: [
            {
              label: "Number of elements",
              data: Object.values(structure),
              backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 99, 132, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)",
                "rgba(199, 199, 199, 0.6)",
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(199, 199, 199, 1)",
              ],
              borderWidth: 1,
            },
          ],
        })
      }

      // Change frequency data - analyze which parts change most frequently
      const changeFrequency: Record<string, number> = {}

      for (let i = 1; i < sortedCommits.length; i++) {
        const prevCommit = sortedCommits[i - 1]
        const currentCommit = sortedCommits[i]

        if (prevCommit.data && currentCommit.data) {
          const diff = compareJsonObjects(prevCommit.data, currentCommit.data)

          const trackChanges = (obj: any, path = "") => {
            if (!obj) return

            Object.entries(obj).forEach(([key, value]: [string, any]) => {
              const currentPath = path ? `${path}.${key}` : key
              const rootPath = currentPath.split(".")[0]

              if (value.status === "added" || value.status === "removed" || value.status === "changed") {
                changeFrequency[rootPath] = (changeFrequency[rootPath] || 0) + 1
              }

              if (value.children) {
                trackChanges(value.children, currentPath)
              }
            })
          }

          trackChanges(diff)
        }
      }

      // Sort by frequency
      const sortedFrequency = Object.entries(changeFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

      setChangeFrequencyData({
        labels: sortedFrequency.map(([path]) => path),
        datasets: [
          {
            label: "Change frequency",
            data: sortedFrequency.map(([, count]) => count),
            backgroundColor: "rgba(99, 102, 241, 0.6)",
            borderColor: "rgb(99, 102, 241)",
            borderWidth: 1,
          },
        ],
      })
      setError(null)
    } catch (err) {
      console.error("Error processing analysis data:", err)
      setError("Failed to process analysis data. Please try again.")
    }
  }, [commits])

  return (
    <div className="space-y-4">
      <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-medium text-slate-800 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                Analyzing {selectedFile} across {commits.length} commits
              </h3>
              <p className="text-sm text-slate-600 mt-1">Visualizing changes and patterns in the JSON data over time</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {commits.slice(0, 3).map((commit) => (
                <Badge key={commit.hash} variant="outline" className="bg-purple-50 border-purple-200">
                  <GitCommit className="h-3 w-3 mr-1" />
                  {commit.hash.substring(0, 7)}
                </Badge>
              ))}
              {commits.length > 3 && (
                <Badge variant="outline" className="bg-purple-50 border-purple-200">
                  +{commits.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="evolution" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Structure
          </TabsTrigger>
          <TabsTrigger value="frequency" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Change Frequency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="mt-0">
          {error && (
            <div className="text-center py-4 px-6 bg-red-50 text-red-700 rounded-md border border-red-200">
              <p>{error}</p>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>JSON Evolution Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading evolution data...</span>
                </div>
              ) : evolutionData ? (
                <Line
                  data={evolutionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                      tooltip: {
                        callbacks: {
                          title: (context) => {
                            const index = context[0].dataIndex
                            return `Commit ${evolutionData.labels[index]}`
                          },
                          afterTitle: (context) => {
                            const index = context[0].dataIndex
                            return evolutionData.dates[index]
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of changes",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Commits",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-slate-500">
                  <p>No evolution data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="mt-0">
          {error && (
            <div className="text-center py-4 px-6 bg-red-50 text-red-700 rounded-md border border-red-200">
              <p>{error}</p>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>JSON Structure Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading structure data...</span>
                </div>
              ) : structureData ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-1/2 h-full">
                    <Pie
                      data={structureData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right" as const,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <p>No structure data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="mt-0">
          {error && (
            <div className="text-center py-4 px-6 bg-red-50 text-red-700 rounded-md border border-red-200">
              <p>{error}</p>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Most Frequently Changed Elements</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading frequency data...</span>
                </div>
              ) : changeFrequencyData ? (
                <Bar
                  data={changeFrequencyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y" as const,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of changes",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "JSON path",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-slate-500">
                  <p>No frequency data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
