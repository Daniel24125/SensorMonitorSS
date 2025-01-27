import CardAvatar from '@/app/components/ui/CardAvatar'
import React from 'react'

type DashboardCardPropsType = {
    title: string | React.ReactNode, 
    children: React.ReactNode, 
    subtitle: string | React.ReactNode
    color?: string
    setSelected?: ()=>void
    secondaryAction?: React.ReactNode
}

const DashboardCard = ({title, children, subtitle, secondaryAction, setSelected, color}: DashboardCardPropsType) => {
    const parsedTitle = typeof title === "string" && title.length > 36 ?  `${title.substring(0, 36)}...` : title
    return (<div onClick={()=>setSelected ? setSelected(): false} className='bg-card w-full h-20 p-3 rounded-xl flex mb-5 hover:bg-card-hover cursor-pointer'>
        {color? <CardAvatar color={color}>{children}</CardAvatar>: children}
        <div className='space-y-1 w-full ml-5 flex flex-col'>
            {typeof title === "string" ? <span className='text-sm w-full'>{parsedTitle}</span>: title}
            {typeof subtitle === "string" ? <span className='text-xs text-muted-foreground'>{subtitle}</span>: subtitle}
        </div>
        <div className='h-full flex items-center'>
            {secondaryAction}
        </div>
    </div>)
}

export default DashboardCard