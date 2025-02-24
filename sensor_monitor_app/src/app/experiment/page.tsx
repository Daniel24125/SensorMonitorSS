"use client"

import React from 'react'
import {  useSearchParams } from 'next/navigation';
import { useExperiments } from '@/contexts/experiments';
import { useProjects } from '@/contexts/projects';
import ExperimentControls from './[deviceID]/components/ExperimentControls';
import ExperimentData from './[deviceID]/components/ExperimentData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TooltipWrapper } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { CircleMinus, MoreVertical } from 'lucide-react';
import SelectProjectTemplate from './[deviceID]/components/SelectExperimentProject';
import { getformatedExperimentTime } from '@/lib/utils';
import ProjectExperimentLogs from '../projects/[projectID]/components/logs/ProjectExperimentLogs';

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
            <ProjectExperimentLogs
              logs={data.logs!}
              deviceID={data.deviceID}
              configurationID={data.configurationID}
            />
    </div>
    )
}

const ExperimentHeader = ()=>{
  const {data} = useExperiments()

  const formatedTime = React.useMemo(()=>{
    if(!data) return  "00:00:00"
    return getformatedExperimentTime(data.duration)
  }, [data])

  
  return <div className='w-full flex justify-between items-center'>
      <ExperimentControls/>
      <div className='flex gap-2 items-center'>
          <p className='text-4xl font-bold'>{formatedTime}</p>
          <ExperimentOptions/>
      </div>
  </div>
}

const ExperimentOptions = ()=>{
  const {isExperimentDeviceOn,  isExperimentOngoing} = useExperiments()
  
    return <DropdownMenu>
    <DropdownMenuTrigger disabled={!isExperimentDeviceOn || !isExperimentOngoing}>
      <TooltipWrapper title="Experiment options">
        <Button variant="outline" size="icon">
          <MoreVertical/>
        </Button>
      </TooltipWrapper>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuItem disabled={!isExperimentDeviceOn || !isExperimentOngoing} className="cursor-pointer" onClick={()=>{
          
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