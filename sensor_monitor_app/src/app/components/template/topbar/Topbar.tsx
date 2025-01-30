"use client"

import { Input } from '@/components/ui/input'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { DeviceType, useDevices } from '@/contexts/devices'
import { Plus } from 'lucide-react'
import React from 'react'
import { Select, SelectContent, SelectTrigger } from '@/components/ui/select'
import { SelectItem } from '@radix-ui/react-select'
import { deviceIconColors } from '../../DeviceWidget'
import { useProjects } from '@/contexts/projects'
import AddProjectButton from '../../projects/AddProjectButton'

const Topbar = () => {
  return (
    <div className='w-full flex justify-between items-center p-3 flex-grow-0 flex-shrink basis-auto'>
        <SearchProject/>
        <div className='flex items-center gap-3'>
          <DeviceInfo/>
          <CreateProject/>
        </div>
    </div>
  )
}

export const SearchProject = ()=>{
    return <Input placeholder="Search for a project title" className='w-80 bg-secondary-background'/>
}
export const DeviceStatusDot = ({device}:{device: DeviceType})=> {
  return <TooltipWrapper title={device.status}>
    <div style={{background: deviceIconColors[device.status]}} className='w-2 h-2 rounded-full'></div>
  </TooltipWrapper>
}

const DeviceInfo = ()=>{
  const {deviceList, selectedDevice, setSelectedDevice} = useDevices()

  
  return<Select disabled={deviceList.length === 0} value={selectedDevice?.id} onValueChange={(value: string)=>{
    setSelectedDevice(deviceList.filter(d=>d.id === value)[0])
}}>
    <SelectTrigger >
      {selectedDevice ? <div className='flex gap-2 items-center p-2'>
        <DeviceStatusDot device={selectedDevice!}/> {selectedDevice?.name}
      </div> : "Select a device"}
    </SelectTrigger>
    <SelectContent>
        {deviceList.map(d=>{
          return <SelectItem key={d.id} value={d.id}>
            <div className='flex gap-2 items-center p-2'>
              <DeviceStatusDot device={d}/> {d.name}
            </div>
          </SelectItem>
        })}
    </SelectContent>
  </Select>
}

export const CreateProject = ()=>{
    const {setOpen, setEdit} = useProjects()

    return <AddProjectButton title="Create a new project">
          <div onClick={()=>{
            setOpen(true)
            setEdit(false)
          }} className='rounded-full bg-primary p-2 cursor-pointer'>
            <Plus/>
          </div>
      </AddProjectButton>  
}

export default Topbar

