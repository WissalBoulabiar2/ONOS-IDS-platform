"use client"

import React from "react"

interface HealthScoreCircleProps {
  score: number // 0-100
  label?: string
  size?: "sm" | "md" | "lg"
}

export function HealthScoreCircle({
  score,
  label = "Network Health",
  size = "md",
}: HealthScoreCircleProps) {
  // Determine color based on score
  let color = "#32A852" // Green (Healthy: 80-100)
  let bgColor = "bg-green-50 dark:bg-green-950"
  let textColor = "text-green-700 dark:text-green-300"

  if (score < 60) {
    color = "#E81E1E" // Red (Critical: 0-59)
    bgColor = "bg-red-50 dark:bg-red-950"
    textColor = "text-red-700 dark:text-red-300"
  } else if (score < 80) {
    color = "#FF9500" // Orange (Warning: 60-79)
    bgColor = "bg-orange-50 dark:bg-orange-950"
    textColor = "text-orange-700 dark:text-orange-300"
  }

  const sizeMap = {
    sm: { container: "w-24 h-24", text: "text-sm" },
    md: { container: "w-32 h-32", text: "text-lg" },
    lg: { container: "w-48 h-48", text: "text-2xl" },
  }

  const dims = sizeMap[size]
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${bgColor} p-6 rounded-lg`}>
      <div className={`relative ${dims.container}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`${dims.text} font-bold ${textColor}`}>{score}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">%</div>
        </div>
      </div>

      <p className={`text-center text-sm font-medium ${textColor}`}>{label}</p>

      {/* Status badge */}
      <div className={`text-xs font-semibold px-3 py-1 rounded-full ${textColor} border ${
        score >= 80
          ? "border-green-300 dark:border-green-700"
          : score >= 60
            ? "border-orange-300 dark:border-orange-700"
            : "border-red-300 dark:border-red-700"
      }`}>
        {score >= 80 ? "Healthy" : score >= 60 ? "Warning" : "Critical"}
      </div>
    </div>
  )
}
