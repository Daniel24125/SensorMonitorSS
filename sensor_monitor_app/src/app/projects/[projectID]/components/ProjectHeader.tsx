"use client"

import { deviceIconColors } from '@/app/components/DeviceWidget'
import ProjectOptions from '@/app/components/projects/ProjectOptions'
import CardAvatar from '@/app/components/ui/CardAvatar'
import { useProjectDetails } from '@/contexts/projectDetails'

import { RadioReceiver } from 'lucide-react'
import moment from 'moment'
import React from 'react'

const ProjectHeader = () => {
    const {project, device} = useProjectDetails()
    
    const color = React.useMemo(()=>{
        return deviceIconColors[device!.status]
    },[device!.status])
       
    return (
        <div className='w-full flex justify-between items-start'>
            <div className='flex gap-5'>
                <CardAvatar className='rounded-xl' color={color}>
                    <RadioReceiver/>
                </CardAvatar>
                <div className='flex flex-col'>
                    <p className='text-3xl font-bold'>{project!.title}</p>
                    <span className='text-accent'>{project!.updatedAt? `Updated ${moment(project!.updatedAt).fromNow()}`: `Project created at ${moment(project!.createdAt).format("DD/MM/YYYY - hh:mm a")}`}</span>
                </div>
            </div>
            <ProjectOptions project={project!}/>
        </div>
    )
}



export default ProjectHeader