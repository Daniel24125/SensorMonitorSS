"use client"

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { useExperiments } from '@/contexts/experiments';
import { useProjects } from '@/contexts/projects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    return (<div className='w-full h-full flex-col py-5'>
        ExperimentPage
    </div>
    )
}

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

export default ExperimentPage