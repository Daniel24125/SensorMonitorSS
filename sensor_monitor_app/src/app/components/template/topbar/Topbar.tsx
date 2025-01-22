"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDevices } from '@/contexts/devices'
import { Plus } from 'lucide-react'
import React from 'react'
import ProjectForm from '../../projects/ProjectForm'

const Topbar = () => {
  return (
    <div className='w-full flex justify-between items-center p-3 flex-grow-0 flex-shrink basis-auto'>
        <SearchProject/>
        <div className='flex items-center gap-3'>
          {/* <DeviceInfo/> */}
          <CreateProject/>
        </div>
    </div>
  )
}

export const SearchProject = ()=>{
    return <Input placeholder="Search for a project title" className='w-80 bg-secondary-background'/>
}

const DeviceInfo = ()=>{
  const {deviceList} = useDevices()

  return "Device List"
}

export const CreateProject = ()=>{
    return <ProjectForm size="icon" className='rounded-full'>
      <TooltipWrapper title={"Create a new project"}>
          <div className='rounded-full bg-primary p-2'>
            <Plus/>
          </div>
      </TooltipWrapper>
    </ProjectForm>
    
   
}

export default Topbar

