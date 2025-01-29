import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { Play } from 'lucide-react'
import React from 'react'

const ExperimentControls = () => {
  return (
    <div className='flex gap-2 '>
        <TooltipWrapper title="Start experiment">
            <Button size={"icon"}>
                <Play/>
            </Button>
        </TooltipWrapper>
    </div>
  )
}

export default ExperimentControls