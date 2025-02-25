import { useExperiment } from '@/contexts/experiments'
import { getformatedExperimentTime } from '@/lib/utils'
import React from 'react'
import ExperimentControls from './ExperimentControls'
import ExperimentOptions from './ExperimentOptions'

const ExperimentHeader = ({deviceID}:{deviceID: string}) => {
    const {experiment} = useExperiment(deviceID)

    const formatedTime = React.useMemo(()=>{
      if(!experiment) return  "00:00:00"
      return getformatedExperimentTime(experiment.duration)
    }, [experiment])
  
    
    return <div className='w-full flex justify-between items-center'>
        <ExperimentControls deviceID={deviceID}/>
        <div className='flex gap-2 items-center'>
            <p className='text-4xl font-bold'>{formatedTime}</p>
            <ExperimentOptions deviceID={deviceID}/>
        </div>
    </div>
}

export default ExperimentHeader