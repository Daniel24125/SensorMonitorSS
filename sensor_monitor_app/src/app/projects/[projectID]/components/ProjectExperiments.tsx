"use client"

import { useProjectDetails } from '@/contexts/projectDetails'
import React from 'react'
import ExperimentDetails from './ExperimentDetails'
import ExperimentList from './ExperimentList'

const ProjectExperiments = () => {
    const {selectedExperiment} = useProjectDetails()
    
    return (<div className='w-full h-full flex pt-5'>
        <ExperimentList/>
        {selectedExperiment && <ExperimentDetails/>}
    </div>
  )
}




export default ProjectExperiments