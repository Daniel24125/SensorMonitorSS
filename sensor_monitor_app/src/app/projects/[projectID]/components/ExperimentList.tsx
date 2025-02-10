import { ExperimentCard } from '@/app/components/projects/ProjectDetailsWidget'
import { useProjectDetails } from '@/contexts/projectDetails'
import React from 'react'

const ExperimentList = () => {
    const {project, selectedExperiment, setSelectedExperiment} = useProjectDetails()

    return <div className='bg-card w-64 h-full rounded-lg p-2 shrink-0'>
        {project!.experiments!.map(e=>{
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
}

export default ExperimentList