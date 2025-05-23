"use client"

import type React from "react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2, Github, GitCommit, FileJson, GitCompare, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CommitList from "@/components/commit-list"
import CommitCompare from "@/components/commit-compare"
import CommitAnalysis from "@/components/commit-analysis"
// import { mockFetchCommits, fetchMetadata } from "@/lib/mock-api"
import type { Commit } from "@/lib/types"
import { fetchCommits, fetchMetadata } from "@/lib/mock-api"

// Dynamically import the JsonTreeVisualization component to avoid SSR issues with ReactFlow
const JsonTreeVisualization = dynamic(() => import("@/components/json-tree-visualization"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading visualization...</span>
    </div>
  ),
})

// Dynamically import the JsonDiffVisualization component
const JsonDiffVisualization = dynamic(() => import("@/components/json-diff-visualization"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading diff visualization...</span>
    </div>
  ),
})

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [commits, setCommits] = useState<Commit[]>([])
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)
  const [compareCommits, setCompareCommits] = useState<{
    base: Commit | null
    compare: Commit | null
  }>({ base: null, compare: null })
  const [jsonData, setJsonData] = useState<any>(null)
  const [compareData, setCompareData] = useState<{
    base: any | null
    compare: any | null
  }>({ base: null, compare: null })
  const [activeTab, setActiveTab] = useState("commits")
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState("root.json")
  const [selectedCommits, setSelectedCommits] = useState<Commit[]>([])

  const handleRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Mock API call to fetch commits
      const commitsData = await fetchCommits(repoUrl)
      setCommits(commitsData)
      setSelectedCommit(null)
      setCompareCommits({ base: null, compare: null })
      setJsonData(null)
      setCompareData({ base: null, compare: null })
      setSelectedCommits([])
      setActiveTab("commits")
    } catch (err) {
      setError("Failed to fetch repository data. Please check the URL and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommitSelect = async (commit: Commit) => {
    setSelectedCommit(commit)
    setIsLoading(true)
    setActiveTab("visualization")

    try {
      // Mock API call to fetch metadata for the selected commit
      const metadata = await fetchMetadata(repoUrl, commit.hash, selectedFile)
      setJsonData(metadata)
    } catch (err) {
      setError(`Failed to fetch ${selectedFile} for this commit.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompareSelect = async (base: Commit, compare: Commit) => {
    setCompareCommits({ base, compare })
    setIsLoading(true)
    setActiveTab("compare")

    try {
      // Fetch both commits' data in parallel
      const [baseData, compareData] = await Promise.all([
        fetchMetadata(repoUrl, base.hash, selectedFile),
        fetchMetadata(repoUrl, compare.hash, selectedFile),
      ])

      setCompareData({ base: baseData, compare: compareData })
    } catch (err) {
      setError(`Failed to fetch comparison data.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (file: string) => {
    setSelectedFile(file)

    // If we have a selected commit, reload its data with the new file
    if (selectedCommit && activeTab === "visualization") {
      setIsLoading(true)
      try {
        const metadata = await fetchMetadata(repoUrl, selectedCommit.hash, file)
        setJsonData(metadata)
      } catch (err) {
        setError(`Failed to fetch ${file} for this commit.`)
      } finally {
        setIsLoading(false)
      }
    }

    // If we're in compare mode, reload both commits' data
    if (compareCommits.base && compareCommits.compare && activeTab === "compare") {
      setIsLoading(true)
      try {
        const [baseData, compareData] = await Promise.all([
          fetchMetadata(repoUrl, compareCommits.base.hash, file),
          fetchMetadata(repoUrl, compareCommits.compare.hash, file),
        ])

        setCompareData({ base: baseData, compare: compareData })
      } catch (err) {
        setError(`Failed to fetch comparison data.`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCommitRangeSelect = (commits: Commit[]) => {
    setSelectedCommits(commits)
    setActiveTab("analysis")
  }

  // Load data for analysis tab when selected commits change
  useEffect(() => {
    if (activeTab === "analysis" && selectedCommits.length > 0) {
      const loadAnalysisData = async () => {
        setIsLoading(true)
        setError("")

        try {
          // Load data for each commit in the range
          const dataPromises = selectedCommits.map((commit) => fetchMetadata(repoUrl, commit.hash, selectedFile))

          const results = await Promise.all(dataPromises)

          // Store the results in the selectedCommits state
          const commitsWithData = selectedCommits.map((commit, index) => ({
            ...commit,
            data: results[index],
          }))

          setSelectedCommits(commitsWithData)
        } catch (err) {
          console.error("Failed to load analysis data:", err)
          setError("Failed to load analysis data for selected commits. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      loadAnalysisData()
    }
  }, [activeTab, selectedCommits.length, repoUrl, selectedFile])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Github className="h-8 w-8 text-slate-800" />
            <h1 className="text-3xl font-bold text-slate-800">gittuf Metadata Visualizer</h1>
          </div>
          <p className="text-slate-600 max-w-3xl">
            Visualize and analyze gittuf's security metadata structure across repository commits. gittuf is a security
            layer for Git repositories that applies security policies independent of hosting services.
          </p>
        </header>

        <form onSubmit={handleRepoSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              type="text"
              placeholder="Enter GitHub repository URL with gittuf metadata (e.g., https://github.com/gittuf/gittuf)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-grow"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px] transition-all duration-300 ease-in-out"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Github className="h-4 w-4 mr-2" />}
              Fetch Repository
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>

        {commits.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileChange("root.json")}
                      className={selectedFile === "root.json" ? "bg-blue-50 border-blue-200" : ""}
                    >
                      root.json
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View root policy data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileChange("targets.json")}
                      className={selectedFile === "targets.json" ? "bg-blue-50 border-blue-200" : ""}
                    >
                      targets.json
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View targets policy data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="commits" className="flex items-center">
                  <GitCommit className="h-4 w-4 mr-2" />
                  Commits
                </TabsTrigger>
                <TabsTrigger value="visualization" disabled={!selectedCommit} className="flex items-center">
                  <FileJson className="h-4 w-4 mr-2" />
                  Visualization
                </TabsTrigger>
                <TabsTrigger
                  value="compare"
                  disabled={!compareCommits.base || !compareCommits.compare}
                  className="flex items-center"
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </TabsTrigger>
                <TabsTrigger value="analysis" disabled={selectedCommits.length < 2} className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="commits" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <CommitList
                      commits={commits}
                      onSelectCommit={handleCommitSelect}
                      selectedCommit={selectedCommit}
                      onCompareSelect={handleCompareSelect}
                      compareCommits={compareCommits}
                      onRangeSelect={handleCommitRangeSelect}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visualization" className="mt-0">
                {selectedCommit && (
                  <div className="mb-4">
                    <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-slate-800">Viewing {selectedFile} for commit:</h3>
                            <div className="mt-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                              <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                                {selectedCommit.hash.substring(0, 8)}
                              </code>
                              <p className="text-slate-600">{selectedCommit.message}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-slate-500 whitespace-nowrap">
                            {new Date(selectedCommit.date).toLocaleDateString()} by {selectedCommit.author}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="h-[600px] bg-white rounded-lg shadow-md border border-gray-200">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading JSON data...</span>
                    </div>
                  ) : jsonData ? (
                    <JsonTreeVisualization jsonData={jsonData} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <FileJson className="h-16 w-16 mb-4 text-slate-300" />
                      <p>Select a commit to visualize its JSON data</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="compare" className="mt-0">
                {compareCommits.base && compareCommits.compare && (
                  <CommitCompare
                    baseCommit={compareCommits.base}
                    compareCommit={compareCommits.compare}
                    baseData={compareData.base}
                    compareData={compareData.compare}
                    isLoading={isLoading}
                    selectedFile={selectedFile}
                  />
                )}
              </TabsContent>

              <TabsContent value="analysis" className="mt-0">
                {selectedCommits.length >= 2 && (
                  <CommitAnalysis commits={selectedCommits} isLoading={isLoading} selectedFile={selectedFile} />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {commits.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-lg border border-dashed border-slate-300">
            <Github className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">No repository data</h3>
            <p className="text-slate-500 text-center max-w-md">
              Enter a GitHub repository URL and click "Fetch Repository" to visualize its JSON data
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
