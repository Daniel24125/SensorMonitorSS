import { cn } from '@/lib/utils'
import React from 'react'

const CardAvatar = ({
    color,
    className,
    children
}:{color: string, className?: string,children: React.ReactNode}) => {
  return (
    <div style={{
        backgroundColor: `${color}4D`,
        borderColor: `${color}33`,
        color: color
    }} className={cn(
      'w-14 h-14 flex-shrink-0 round-full border-solid border-8 rounded-full flex justify-center items-center',
      className
    )}>
        {children}
    </div>
  )
}

export default CardAvatar