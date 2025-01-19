import React from 'react'

const WidgetCard = ({className, children}:{className?:string, children: React.ReactNode }) => {
  return (
    <div  className={`${className} bg-secondary-background h-full rounded-xl px-5 py-4 flex flex-col`}>
        {children}
    </div>
  )
}

export default WidgetCard