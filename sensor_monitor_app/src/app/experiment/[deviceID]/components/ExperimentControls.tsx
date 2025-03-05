import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useExperiment } from '@/contexts/experiments'
import { Pause, Play, StopCircle } from 'lucide-react'
import React from 'react'

const ExperimentControls = ({deviceID}: {deviceID: string}) => {
  const {experiment, startExperiment, isExperimentOngoing, hasAccess, stopExperiment, pauseExperiment, resumeExperiment} = useExperiment(deviceID)

  return (
    <div className='flex gap-2'>
      {!isExperimentOngoing ? <ControlButton
        title='Start monitoring'
        onClickFn={startExperiment}
        Icon={Play}
        hasAccessToExperiment={hasAccess}
      /> : <>
        {experiment!.status === "running" ? <ControlButton
          title='Pause monitoring'
          onClickFn={pauseExperiment}
          Icon={Pause}
          hasAccessToExperiment={hasAccess}
          className='bg-yellow-500'
        /> : <ControlButton
        title='Resume monitoring'
        onClickFn={resumeExperiment}
        Icon={Play}
        hasAccessToExperiment={hasAccess}
      />}
        <ControlButton
          title='Stop monitoring'
          onClickFn={stopExperiment}
          Icon={StopCircle}
          hasAccessToExperiment={hasAccess}
        /> 
      </>}
    </div>
  )
}

const ControlButton = ({
  title, 
  onClickFn, 
  Icon,
  hasAccessToExperiment,
  className
}:{
  title: string, 
  onClickFn: ()=>void, 
  Icon: typeof StopCircle,
  hasAccessToExperiment: boolean,
  className?: string
})=>{

  return <TooltipWrapper title={title}>
  <Button className={className} variant="ghost" size="icon" onClick={()=>{
    if(hasAccessToExperiment){
      onClickFn()
    }
  }} disabled={!hasAccessToExperiment}
   >
      <Icon/>
  </Button>
</TooltipWrapper>
}


export default ExperimentControls