"use client"

import React from 'react'
import {  useSearchParams } from 'next/navigation';
import { useExperiments } from '@/contexts/experiments';
import { useProjects } from '@/contexts/projects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ExperimentControls from './components/ExperimentControls';
import ExperimentData from './components/ExperimentData';
import ExperimentLogs from './components/ExperimentLogs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TooltipWrapper } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { CircleMinus, MoreVertical } from 'lucide-react';
import SelectProjectTemplate from './components/SelectExperimentProject';

const ExperimentPage = () => {
    const searchParams = useSearchParams();
    const projectID = searchParams.get('projectID');
    const {data, registerProject} = useExperiments()
    const {isLoading} = useProjects()

    React.useEffect(()=>{
        if(projectID && !isLoading){
            registerProject(projectID)
        }
    },[isLoading])

    if(!data?.projectID) return <SelectProjectTemplate/>
    return (<div className='w-full h-full flex flex-col py-5 gap-7'>
            <ExperimentHeader/>
            <ExperimentData/>
            <ExperimentLogs/>
            
    </div>
    )
}

const ExperimentHeader = ()=>{
    return <div className='w-full flex justify-between items-center'>
        <ExperimentControls/>
        <div className='flex gap-2 items-center'>
            <p className='text-4xl font-bold'>00:00:00</p>
            <ExperimentOptions/>
        </div>
    </div>
}

const ExperimentOptions = ()=>{
    return <DropdownMenu>
    <DropdownMenuTrigger>
      <TooltipWrapper title="Experiment options">
        <Button variant="outline" size="icon">
          <MoreVertical/>
        </Button>
      </TooltipWrapper>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer" onClick={()=>{
      
        }}>
          <div className="flex items-center gap-2">
            <CircleMinus size={13}/>
            <span> Close all valves</span>
          </div>
        </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}

export default ExperimentPage