import React from 'react'
import WidgetCard from '../ui/WidgetCard'
import { useProjects } from '@/contexts/projects'
import moment from 'moment'
import { Button } from '@/components/ui/button'
import { ExperimentType } from '@/contexts/experiments'
import { useRouter } from 'next/navigation'
import ProjectOptions from './ProjectOptions'
import DeviceBadge from '@/app/devices/components/DeviceBadge'

const ProjectDetails = () => {
  const {selectedProject} = useProjects()
  const [selectedExperiment, setSelectedExperiment] = React.useState<ExperimentType | null>(null)
  const router = useRouter()

  return <WidgetCard title={selectedProject ? selectedProject.title :"Project Details"} className='w-full' secondaryAction={
    <div className='flex items-center gap-4'>
      {selectedProject && <DeviceBadge project={selectedProject} />}
      <ProjectOptions
        project={selectedProject!}
      />
    </div>
  }>
    {selectedProject ? <div className='flex w-full h-full'>
      {selectedProject.experiments!.length > 0 ? <>
        <div className='w-40 bg-card flex flex-col rounded-xl h-full'>
        {selectedProject.experiments?.map(e=>{
          return <div key={e.id} style={{
            border: selectedExperiment && selectedExperiment.id === e.id ? "solid 2px #0984E3" : "none"
          }} onClick={()=>{
            setSelectedExperiment(e)
          }} className='w-full p-2 rounded-xl flex flex-col bg-secondary-background'>
            <p>{e.id}</p>
            <p className='text-xs text-accent'>{moment(e.createdAt).format("DD/MM/YYY - hh:mm a")}</p>
          </div>
        })}
      </div>
      <div></div>
      </>: <NoDataToDisplay title={<>
          <h3 className='text-lg text-accent font-bold'>No experimental data to display</h3>
          <Button onClick={()=>router.push(`/experiment?projectID=${selectedProject.id}`)}>Start a new experiment</Button>
        </>}/>}
    </div>: <NoDataToDisplay title={<h3 className='text-lg text-accent font-bold'>No information to display</h3>}/>}
  </WidgetCard>
}

const NoDataToDisplay = ({title}: {title: React.ReactNode})=>{
  return <div className='w-full h-full flex justify-center items-center flex-col gap-3'>
    {title}
  </div>
}

export default ProjectDetails