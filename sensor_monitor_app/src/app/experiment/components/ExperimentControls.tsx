import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useExperiments } from '@/contexts/experiments'
import { Play } from 'lucide-react'
import React from 'react'

const ExperimentControls = () => {
  const {isExperimentDeviceOn, startExperiment, isExperimentOngoing} = useExperiments()

  return (
    <div className='flex gap-2 '>
        <TooltipWrapper title="Start experiment">
            <Button onClick={()=>{
              if(isExperimentDeviceOn && !isExperimentOngoing){
                startExperiment()
              }
            }} disabled={!isExperimentDeviceOn}
             size={"icon"}>
                <Play/>
            </Button>
        </TooltipWrapper>
    </div>
  )
}

export default ExperimentControls