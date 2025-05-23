"use client"

import { Loader2, GitCompare, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JsonDiffVisualization from "./json-diff-visualization"
import JsonDiffStats from "./json-diff-stats"
import { Button } from "@/components/ui/button"
import type { Commit } from "@/lib/types"
import { useState } from "react"

interface CommitCompareProps {
  baseCommit: Commit
  compareCommit: Commit
  baseData: any
  compareData: any
  isLoading: boolean
  selectedFile: string
}

export default function CommitCompare({
  baseCommit,
  compareCommit,
  baseData,
  compareData,
  isLoading,
  selectedFile,
}: CommitCompareProps) {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Card className="bg-white border-l-4 border-l-indigo-500 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800">Comparing Security Metadata: {selectedFile}</h3>
              <GitCompare className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-white text-blue-700">
                    Base
                  </Badge>
                  <code className="bg-white px-2 py-1 rounded text-xs font-mono border border-blue-200">
                    {baseCommit.hash.substring(0, 8)}
                  </code>
                </div>
                <p className="text-sm text-slate-700 mb-1">{baseCommit.message}</p>
                <p className="text-xs text-slate-500">
                  {baseCommit.author} • {new Date(baseCommit.date).toLocaleDateString()}
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-white text-green-700">
                    Compare
                  </Badge>
                  <code className="bg-white px-2 py-1 rounded text-xs font-mono border border-green-200">
                    {compareCommit.hash.substring(0, 8)}
                  </code>
                </div>
                <p className="text-sm text-slate-700 mb-1">{compareCommit.message}</p>
                <p className="text-xs text-slate-500">
                  {compareCommit.author} • {new Date(compareCommit.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="visualization">Diff Visualization</TabsTrigger>
          <TabsTrigger value="stats">Diff Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="mt-0">
          <div className="h-[600px] bg-white rounded-lg shadow-md border border-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-2">Loading security metadata comparison...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <AlertTriangle className="h-16 w-16 mb-4 text-red-400" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            ) : baseData && compareData ? (
              <JsonDiffVisualization baseData={baseData} compareData={compareData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <GitCompare className="h-16 w-16 mb-4 text-slate-300" />
                <p>Select two commits to compare security metadata</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-2">Loading security metadata comparison...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-red-500">
                <AlertTriangle className="h-16 w-16 mb-4 text-red-400" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            ) : baseData && compareData ? (
              <JsonDiffStats baseData={baseData} compareData={compareData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <GitCompare className="h-16 w-16 mb-4 text-slate-300" />
                <p>Select two commits to compare security metadata</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
