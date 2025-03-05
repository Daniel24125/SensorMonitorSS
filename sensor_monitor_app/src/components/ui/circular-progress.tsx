import { cn } from '@/lib/utils'
import React from 'react'

type CircularProgressPropsType = {
    size?: "sm" | "md" | "lg",
    progress: number,
    label: string
}

const CircularProgress = ({size="md", progress, label}: CircularProgressPropsType) => {
  return <div className="flex items-center justify-center">
  <div className={cn(
    "relative",
    size === "sm" ? "w-24 h-24":"",
    size === "md" ? "w-28 h-28 lg:w-36 lg:h-36 ":"",
    size === "lg" ? "w-48 h-48":"",
  )}>
    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#19191B" strokeWidth="2" />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        stroke="url(#progress-gradient)"
        strokeWidth="2"
        strokeDasharray="251.2"
        strokeDashoffset={251.2 * (1 - progress)}
      />
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9C88FF" />
          <stop offset="100%" stopColor="#9C88FF00" />
        </linearGradient>
      </defs>
    </svg>
    <div className={cn(
      "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-gray-900 dark:text-gray-50",
      size === "sm" ? "text-xl":"",
      size === "md" ? "text-3xl":"",
      size === "lg" ? "text-5xl":"",
    )}>
      {label}
    </div>
  </div>
</div>
}

export default CircularProgress