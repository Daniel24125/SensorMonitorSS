import { cn } from '@/lib/utils'
import React from 'react'

type CircularProgressPropsType = {
    size?: number,
    progress: number,
    label: string
}

const CircularProgress = ({size=200, progress, label}: CircularProgressPropsType) => {
  return <div className="flex items-center justify-center h-full">
  <div style={{
    width: size, 
    height: size
  }} className="relative ">
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
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-gray-900 dark:text-gray-50">
      {label}
    </div>
  </div>
</div>
}

export default CircularProgress