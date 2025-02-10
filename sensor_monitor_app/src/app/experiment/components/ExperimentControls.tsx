import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useExperiments } from '@/contexts/experiments'
import { Pause, Play, StopCircle } from 'lucide-react'
import React from 'react'

const ExperimentControls = () => {
  const {data,startExperiment, isExperimentOngoing, stopExperiment, pauseExperiment, resumeExperiment} = useExperiments()

  return (
    <div className='flex gap-2 '>
      {!isExperimentOngoing ? <ControlButton
        title='Start monitoring'
        onClickFn={startExperiment}
        Icon={Play}
      /> : <>
        {data?.status === "running" ? <ControlButton
          title='Pause monitoring'
          onClickFn={pauseExperiment}
          Icon={Pause}
          className='bg-yellow-500'
        /> : <ControlButton
        title='Resume monitoring'
        onClickFn={resumeExperiment}
        Icon={Play}
      />}
        <ControlButton
          title='Stop monitoring'
          onClickFn={stopExperiment}
          Icon={StopCircle}
        /> 
      </>}
    </div>
  )
}

const ControlButton = ({
  title, 
  onClickFn, 
  Icon,
  className
}:{
  title: string, 
  onClickFn: ()=>void, 
  Icon: typeof StopCircle,
  className?: string
})=>{
  const {isExperimentDeviceOn} = useExperiments()

  return <TooltipWrapper title={title}>
  <Button className={className} variant="ghost" size="icon" onClick={()=>{
    if(isExperimentDeviceOn){
      onClickFn()
    }
  }} disabled={!isExperimentDeviceOn}
   >
      <Icon/>
  </Button>
</TooltipWrapper>
}


export default ExperimentControls