import { useExperiment, useExperiments } from '@/contexts/experiments';
import { useProjects } from '@/contexts/projects';
import { useSearchParams } from 'next/navigation';
import React from 'react'
import SelectProjectTemplate from './SelectExperimentProject';
import ExperimentHeader from './ExperimentHeader';
import ExperimentData from './ExperimentData';
import ProjectExperimentLogs from '@/app/projects/[projectID]/components/logs/ProjectExperimentLogs';

const ExperimentTemplate = ({deviceID}: {deviceID: string}) => {
    const searchParams = useSearchParams();
    const projectID = searchParams.get('projectID');
    const {experiment, isLoading: isExperimentLoading} = useExperiment(deviceID)
    const {isChecking, experiments} = useExperiments()
    const {registerProject} = useExperiments()
    const {isLoading} = useProjects()

    const loading = React.useMemo(()=> isLoading || isExperimentLoading ,[isLoading, isExperimentLoading])

    React.useEffect(()=>{
        if(projectID && !loading && !isChecking && experiments){
            if(Object.entries(experiments).length === 0){
                registerProject(projectID)
            }
        }
    },[loading, isChecking, experiments])

    if(!experiment?.projectID) return <SelectProjectTemplate/>

    return (<div className='w-full h-full flex flex-col py-5 gap-7'>
            <ExperimentHeader deviceID={deviceID}/>
            <ExperimentData deviceID={deviceID}/>
            <ProjectExperimentLogs
              logs={experiment.logs!}
              deviceID={deviceID}
              configurationID={experiment.configurationID}
            />
    </div>
    )
}

export default ExperimentTemplate