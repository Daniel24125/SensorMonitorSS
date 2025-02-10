import React from 'react'
import WidgetCard from '../ui/WidgetCard'
import { useProjects } from '@/contexts/projects'
import moment from 'moment'
import { Button } from '@/components/ui/button'
import { ExperimentType } from '@/contexts/experiments'
import { useRouter } from 'next/navigation'
import ProjectOptions from './ProjectOptions'
import DeviceBadge from '@/app/devices/components/DeviceBadge'
import { useDevices } from '@/contexts/devices'
import { cn } from '@/lib/utils'

const ProjectDetails = () => {
  const {selectedProject} = useProjects()
  const {isDeviceOn} = useDevices()
  const [selectedExperiment, setSelectedExperiment] = React.useState<ExperimentType | null>(null)
  const router = useRouter()

  return <WidgetCard 
    title={selectedProject ? selectedProject.title :"Project Details"} 
    className='w-full' 
    secondaryAction={
      <div className='flex items-center gap-4'>
        {selectedProject && <DeviceBadge project={selectedProject} />}
        <ProjectOptions
          project={selectedProject!}
        />
      </div>
    }
  >
    {selectedProject ? <div className='flex w-full h-full'>
      {selectedProject.experiments!.length > 0 ? <>
        <div className='w-52 bg-card flex flex-col rounded-xl h-full p-2'>
        {selectedProject.experiments?.map(e=>{
          return <ExperimentCard
            key={e.id}
            experiment={e}
            className={selectedExperiment && selectedExperiment.id === e.id ? "border-2 border-[#0984E3] ": ""}
            onClick={()=>{
              setSelectedExperiment(e)
            }}
            
          />
        })}
      </div>
      <div></div>
      </>: <NoDataToDisplay title={<>
          <h3 className='text-lg text-accent font-bold'>No experimental data to display</h3>
          <Button disabled={!isDeviceOn(selectedProject.device)} onClick={()=>{
            if(isDeviceOn(selectedProject.device)){
              router.push(`/experiment?projectID=${selectedProject.id}`)
            }
          }}>Start a new experiment</Button>
        </>}/>}
    </div>: <NoDataToDisplay title={<h3 className='text-lg text-accent font-bold'>No information to display</h3>}/>}
  </WidgetCard>
}

export const ExperimentCard = ({
  experiment, className, onClick}
  : {
    experiment: ExperimentType
    className?: string, 
    onClick: ()=>void
  })=>{
  return <div key={experiment.id} onClick={onClick} className={cn(
    'w-full p-2 rounded-xl flex flex-col bg-secondary-background hover:border-2 hover:border-[#0984E3] cursor-pointer',
    className
  )}>
    <p className='text-sm font-bold'>{experiment.id}</p>
    <p className='text-xs text-accent'>{moment(experiment.createdAt).format("DD/MM/YYY - hh:mm a")}</p>
  </div>
}

const NoDataToDisplay = ({title}: {title: React.ReactNode})=>{
  return <div className='w-full h-full flex justify-center items-center flex-col gap-3'>
    {title}
  </div>
}

export default ProjectDetails