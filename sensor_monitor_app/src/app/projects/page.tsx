"use client"

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useProjects } from '@/contexts/projects'
import { cn } from '@/lib/utils'
import { SquareKanban } from 'lucide-react'
import React from 'react'

const Page = () => {
  return (
    <div className='w-full flex justify-evenly h-full'>
        <ProjectList/>
        <ProjectInformation/>
    </div>
  )
}

const ProjectList = ()=>{
    const {projectList, setSelectedProject,selectedProject , isLoading} = useProjects()

   
    return <div className='w-96 flex flex-wrap justify-evenly relative'>
            
            <LoadingProjectList/>
            {projectList.map((p)=>{
                const isSelected = selectedProject && selectedProject.id === p.id
                return <div key={p.id} onClick={()=>setSelectedProject(p)} className={cn(
                    'w-28 cursor-pointer h-28 gap-3 flex flex-col justify-center items-center rounded-xl',
                    isSelected ? "bg-white text-black": "bg-card"
                )}>
                    <div className={cn(
                        'w-9 h-9 flex justify-center items-center rounded-lg  text-black',
                        isSelected ? "bg-primary opacity-50": "bg-white"
                    )}>
                        <SquareKanban/>
                    </div>
                    <TooltipWrapper title={p.title}>
                    <p className='text-xs text-center px-4'>{p.title.length > 20 ? `${p.title.substring(0,20)}...` : p.title}</p>
                    </TooltipWrapper>
                </div>
            })}
    </div>
}

const LoadingProjectList = ()=>{
    const {isLoading} = useProjects()

    return <div className={cn(
        'absolute w-full h-full bg-background flex flex-wrap gap-2 justify-evenly',
        isLoading? "": "animate-fadeout"
    )}>
        {[...Array(10).keys()].map(s =>{
        return <Skeleton key={s} className='w-28 h-28 rounded-xl'/>
    })}
    </div>
}

const ProjectInformation = ()=>{
    return <div className='w-full'>ProjectInformation</div>
}

export default Page