import React from 'react'

const WidgetCard = ({className, title, secondaryAction, children}:{className?:string, title: string, secondaryAction?: React.ReactNode, children: React.ReactNode }) => {
  return (
    <div  className={`${className} bg-secondary-background h-full rounded-xl px-5 py-4 flex flex-col`}>
      <div className='flex justify-between items-center mb-6'>
            <h6>{title}</h6>
            <div>
                {secondaryAction}
            </div>
        </div>
        {children}
    </div>
  )
}

export default WidgetCard