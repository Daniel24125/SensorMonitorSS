"use client"

import { useProjectDetails } from '@/contexts/projectDetails'
import React from 'react'
import ExperimentDetails from './ExperimentDetails'
import ExperimentList from './ExperimentList'
import { NoDataToDisplay } from '@/app/components/projects/ProjectDetailsWidget'
import { Button } from '@/components/ui/button'
import { useDevices } from '@/contexts/devices'
import { useRouter } from 'next/navigation'

const ProjectExperiments = () => {
    const {selectedExperiment, project} = useProjectDetails()
    const {isDeviceOn} = useDevices()
    const router = useRouter()

    return (selectedExperiment ? <div className='w-full h-full flex pt-5'>
        <ExperimentList/>
        <ExperimentDetails/>
      </div> :  <NoDataToDisplay title={<>
        <h3 className='text-lg text-accent font-bold'>No experimental data to display</h3>
        <Button disabled={!isDeviceOn(project!.device)} onClick={()=>{
          if(isDeviceOn(project!.device)){
            router.push(`/experiment?projectID=${project!.id}`)
          }
        }}>Start a new experiment</Button>
      </>}/>
  )
}




export default ProjectExperiments