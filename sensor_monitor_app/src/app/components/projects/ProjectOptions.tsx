import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useDevices } from '@/contexts/devices'
import { useExperiment } from '@/contexts/experiments'
import { ProjectType, useProjects } from '@/contexts/projects'
import { useWarningDialog } from '@/contexts/warning'
import { Edit, FlaskConical, MoreHorizontal, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const ProjectOptions = ({onClick, project}: {onClick?: ()=>void, project: ProjectType}) => {
    

    return <DropdownMenu>
        <DropdownMenuTrigger  asChild>
            <Button disabled={!project} onClick={onClick} variant="outline" size="icon">
                <MoreHorizontal/>
            </Button>
        </DropdownMenuTrigger>
        {project && <ProjectMenu project={project}/>}
    </DropdownMenu>
}


const ProjectMenu = ({project}:{project: ProjectType})=>{
    const {setOpen, setEdit, handleDeleteProject} = useProjects()
    const {isExperimentOngoing} = useExperiment(project.device)
    const {isDeviceOn} = useDevices()
    const {setOptions, setOpen: setOpenWarning} = useWarningDialog()
    const router = useRouter()

    return <DropdownMenuContent align="end">
    <DropdownMenuItem disabled={!isDeviceOn(project.device) || isExperimentOngoing} onClick={() =>{
        if(isDeviceOn(project.device)){
            router.push(`/experiment/${project.device}?projectID=${project.id}`)
        }
    }}>
        <FlaskConical/>
        <span> Start Experiment</span>
    </DropdownMenuItem>
    <DropdownMenuItem  onClick={() =>{
        console.log("Export Data")
    }}>
        <Save/>
        <span> Export Data</span>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() =>{
        setOpen(true)
        setEdit(true)
    }}>
        <Edit/>
        <span> Edit Project</span>
    </DropdownMenuItem>
        <DropdownMenuItem  className='text-destructive' onClick={() =>{
            setOptions({
                title: "Delete Project",
                description: "This operation is not reversible!", 
                deleteFn: async ()=>handleDeleteProject(project.id!)
            })
            setOpenWarning(true)
        }}>
        <Trash2/>
        <span> Delete Project</span>
    </DropdownMenuItem>
</DropdownMenuContent>
}
export default ProjectOptions