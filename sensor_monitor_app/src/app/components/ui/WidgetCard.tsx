import React from 'react'

type WidgetCardType = {
  className?:string,
  title: string | React.ReactNode, 
  secondaryAction?: React.ReactNode, 
  children: React.ReactNode }


const WidgetCard = ({className, title, secondaryAction, children}: WidgetCardType) => {
  return (
    <div className={`${className} bg-secondary-background h-full rounded-xl px-5 py-4 flex flex-col`}>
      <div className='flex justify-between items-start mb-6'>
            <h6 className='flex-shrink-0 mr-3'>{title}</h6>
            {secondaryAction}
            {/* <div>
            </div> */}
        </div>
        {children}
    </div>
  )
}

export default WidgetCard