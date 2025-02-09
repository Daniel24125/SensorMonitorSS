"use client"

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipWrapper } from '@/components/ui/tooltip'
import {  useProjects } from '@/contexts/projects'
import { cn } from '@/lib/utils'
import {  FlaskConical,   SquareKanban } from 'lucide-react'
import moment from 'moment'
import React from 'react'
import { NoProjectsComponent } from '../components/projects/ProjectListWidget'
import ProjectOptions from '../components/projects/ProjectOptions'
import DeviceBadge from '../devices/components/DeviceBadge'


const Page = () => {
    const {projectList, setSelectedProject} = useProjects()
    console.log(projectList)
    return (
        <div  className='w-full flex justify-evenly h-full'>
            <ScrollArea className='w-full'>
                <div className='w-full flex flex-col gap-5 pt-11'>
                    <LoadingProjectList/>
                    {projectList.length === 0 ? <NoProjectsComponent size="lg"/> :projectList.map((p)=>{
                        return <div key={p.id}  className={'w-full gap-10 border flex flex-col rounded-xl p-4'}>
                            <div className='w-full flex justify-between'>
                                <div className='flex gap-2 items-center'>
                                    <div className={'w-10 h-10 flex-shrink-0 bg-[#9C88FF80] flex justify-center items-center rounded-lg'}>
                                        <SquareKanban/>
                                    </div>
                                    <div className='flex flex-col px-4'>
                                        <p className='text-lg '>{p.title}</p>
                                        <span className='text-accent text-xs'>Created at {moment(p.createdAt!).format("DD/MM/YYYY - hh:mm a")}</span>
                                    </div>
                                </div>
                                <div className='flex gap-4 items-center'>
                                    <TooltipWrapper title="Number of experiments">
                                        <div className='flex gap-2'>
                                            <FlaskConical/> {p.experiments!.length}
                                        </div>
                                    </TooltipWrapper>
                                    <DeviceBadge project={p}/>
                                    <ProjectOptions project={p} onClick={()=>setSelectedProject(p)}/>
                                </div>
                            </div>
                            <div className='w-full flex justify-end'>
                                <Button variant="outline">More details</Button>
                            </div>

                        </div>
                    })}
                </div>
            </ScrollArea>        
        </div>
    )
}




const LoadingProjectList = ()=>{
    const {isLoading} = useProjects()

    return <div className={cn(
        'absolute w-full h-full bg-background flex flex-col gap-5',
        isLoading? "": "animate-fadeout"
    )}>
        {[...Array(2).keys()].map(s =>{
        return <Skeleton key={s} className='w-full h-40 rounded-xl'/>
    })}
    </div>
}


export default Page