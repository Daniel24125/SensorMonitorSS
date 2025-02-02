import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDevices } from '@/contexts/devices'
import { useExperiments } from '@/contexts/experiments'
import { useProjects } from '@/contexts/projects'
import React from 'react'


const SelectProjectTemplate = ()=>{
    const {projectList} = useProjects()
    const {registerProject} = useExperiments()
    const {isDeviceOn} = useDevices()
    
    const handleChange = (value: string)=>{
        registerProject(value)
    }
    
    return <div className='w-full h-full flex justify-center items-center'>
        <Select
            onValueChange={handleChange} 
            required 
        >
            <SelectTrigger className='h-auto max-w-72'>
                <SelectValue  placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
                {projectList.map(p=>{
                    const isOn = isDeviceOn(p.device)
                    return <SelectItem key={p.id} disabled={!isOn}  value={p.id!}>
                    {p.title}
                </SelectItem>
                })}
            </SelectContent>
        </Select>
    </div>
}


export default SelectProjectTemplate