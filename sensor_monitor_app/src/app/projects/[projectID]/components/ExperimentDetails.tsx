import { useProjectDetails } from '@/contexts/projectDetails'
import React from 'react'
import LocationSelection from './LocationSelection'
import { getformatedExperimentTime } from '@/lib/utils'
import ExperimentOptions from './ExperimentOptions'
import ProjectExperimentData from './ProjectExperimentData'

const ExperimentDetails = () => {
    const {selectedExperiment} = useProjectDetails()
    
    const duration = React.useMemo(()=>{
        if(!selectedExperiment) return "00:00:00"
        return getformatedExperimentTime(selectedExperiment.duration)
    },[selectedExperiment])

    return <div className='w-full h-full p-2'>
        <header className='w-full flex justify-between items-center'>
            <h4 className='text-lg font-bold'>Experiment {selectedExperiment!.id}</h4>
            <div className='flex gap-2 items-center'>
                <LocationSelection/>
                <h4 className='text-3xl font-bold'>{duration}</h4>
                <ExperimentOptions/>
            </div>
        </header>
        <ProjectExperimentData/>
    </div>
}

export default ExperimentDetails