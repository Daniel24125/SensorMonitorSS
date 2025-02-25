import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useExperiment } from '@/contexts/experiments'
import { CircleMinus, MoreVertical } from 'lucide-react'
import React from 'react'

const ExperimentOptions = ({deviceID}:{deviceID: string}) => {
    const {isDeviceOn, isExperimentOngoing} = useExperiment(deviceID)
  
    return <DropdownMenu>
    <DropdownMenuTrigger disabled={!isDeviceOn || !isExperimentOngoing}>
      <TooltipWrapper title="Experiment options">
        <Button variant="outline" size="icon">
          <MoreVertical/>
        </Button>
      </TooltipWrapper>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuItem disabled={!isDeviceOn || !isExperimentOngoing} className="cursor-pointer" onClick={()=>{
          
        }}>
          <div className="flex items-center gap-2">
            <CircleMinus size={13}/>
            <span> Close all valves</span>
          </div>
        </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}

export default ExperimentOptions