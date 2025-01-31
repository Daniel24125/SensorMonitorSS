import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useExperiments } from '@/contexts/experiments'
import { useProjects } from '@/contexts/projects'
import React from 'react'


const SelectProjectTemplate = ()=>{
    const {projectList} = useProjects()
    const {registerProject} = useExperiments()
    
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
                    return <SelectItem  key={p.id} value={p.id!}>
                        {p.title}
                    </SelectItem>
                })}
            </SelectContent>
        </Select>
    </div>
}


export default SelectProjectTemplate