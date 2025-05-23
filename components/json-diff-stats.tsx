"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PlusCircle, MinusCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { compareJsonObjects, countChanges } from "@/lib/json-diff"

interface JsonDiffStatsProps {
  baseData: any
  compareData: any
}

export default function JsonDiffStats({ baseData, compareData }: JsonDiffStatsProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary")

  // Compare the two JSON objects
  const diff = compareJsonObjects(baseData, compareData)
  const { added, removed, changed, unchanged } = countChanges(diff)

  const total = added + removed + changed + unchanged
  const addedPercent = Math.round((added / total) * 100) || 0
  const removedPercent = Math.round((removed / total) * 100) || 0
  const changedPercent = Math.round((changed / total) * 100) || 0
  const unchangedPercent = Math.round((unchanged / total) * 100) || 0

  // Find the most significant changes
  const findSignificantChanges = () => {
    const changes: { path: string; type: string; oldValue?: any; newValue?: any }[] = []

    const traverse = (obj: any, path = "") => {
      if (!obj) return

      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        const currentPath = path ? `${path}.${key}` : key

        if (value.status === "added") {
          changes.push({
            path: currentPath,
            type: "added",
            newValue: typeof value.value === "object" ? "Complex object" : value.value,
          })
        } else if (value.status === "removed") {
          changes.push({
            path: currentPath,
            type: "removed",
            oldValue: typeof value.value === "object" ? "Complex object" : value.value,
          })
        } else if (value.status === "changed") {
          changes.push({
            path: currentPath,
            type: "changed",
            oldValue: value.oldValue,
            newValue: value.value,
          })
        }

        if (value.children) {
          traverse(value.children, currentPath)
        }
      })
    }

    traverse(diff)
    return changes.slice(0, 10) // Return top 10 changes
  }

  const significantChanges = findSignificantChanges()

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              activeTab === "summary" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-200`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              activeTab === "details" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-200 border-l-0`}
          >
            Details
          </button>
        </div>
      </div>

      {activeTab === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Added
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{added}</div>
              <div className="text-sm text-gray-500">elements ({addedPercent}%)</div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${addedPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center">
                <MinusCircle className="h-4 w-4 mr-2" />
                Removed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{removed}</div>
              <div className="text-sm text-gray-500">elements ({removedPercent}%)</div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${removedPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-red-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Changed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{changed}</div>
              <div className="text-sm text-gray-500">elements ({changedPercent}%)</div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${changedPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unchanged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unchanged}</div>
              <div className="text-sm text-gray-500">elements ({unchangedPercent}%)</div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${unchangedPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gray-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "details" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Significant Changes</h3>

          {significantChanges.length > 0 ? (
            <div className="space-y-2">
              {significantChanges.map((change, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${
                    change.type === "added"
                      ? "bg-green-50 border-green-200"
                      : change.type === "removed"
                        ? "bg-red-50 border-red-200"
                        : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {change.type === "added" ? (
                        <PlusCircle className="h-4 w-4 text-green-600" />
                      ) : change.type === "removed" ? (
                        <MinusCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{change.path}</div>
                      {change.type === "changed" && (
                        <div className="mt-1 text-sm">
                          <div className="text-red-700 line-through">{String(change.oldValue)}</div>
                          <div className="text-green-700">{String(change.newValue)}</div>
                        </div>
                      )}
                      {change.type === "added" && (
                        <div className="mt-1 text-sm text-green-700">{String(change.newValue)}</div>
                      )}
                      {change.type === "removed" && (
                        <div className="mt-1 text-sm text-red-700">{String(change.oldValue)}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No significant changes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
