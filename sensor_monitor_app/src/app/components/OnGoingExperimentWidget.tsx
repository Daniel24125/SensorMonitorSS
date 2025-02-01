import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { Button } from '@/components/ui/button'
import { ExternalLink, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useExperiments } from '@/contexts/experiments'
import { useDevices } from '@/contexts/devices'
import { useSocket } from '@/contexts/socket'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import SelectProjectTemplate from '../experiment/components/SelectExperimentProject'

const OnGoingExperimentWidget = () => {
  const router = useRouter()
  const {isExperimentOngoing} = useExperiments()
  return (
    <WidgetCard title='On going Experiment' className='w-full' secondaryAction={<>
      <Button onClick={()=>{
        router.push("/experiment")
      }} size="icon" variant="ghost">
          <ExternalLink/>
      </Button>
    </>}>
        {isExperimentOngoing ? <OnGoingExperimentData/> : <NotOngoingExperiment/>}
    </WidgetCard>
  )
}

const OnGoingExperimentData = ()=>{
  return ""
}

const NotOngoingExperiment = ()=>{
  const {deviceList} = useDevices()
  const [open, setOpen] = React.useState(false)

  const hasDeviceConnected = React.useMemo(()=>{
    return deviceList.find(d=>d.status === "ready")
  }, [deviceList])

  const color = React.useMemo(()=>{
    return hasDeviceConnected ? "#2ECC71" : "#35363A" 
  },[hasDeviceConnected])

  return <div className='w-full h-full flex justify-center items-center'>
    <div onClick={()=>setOpen(true)} style={{
      backgroundColor: `${color}4D`,
      border: `solid 20px ${color}33`,
      color: color
    }} className='w-44 h-44 flex justify-center items-center rounded-full cursor-pointer'>
      <Play size={50}/>
    </div>
    <SelectProjectDialog open={open} setOpen={setOpen}/>
  </div>
}


const SelectProjectDialog = ({
  open, 
  setOpen
}:{
  open: boolean 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
})=>{
  const {emit} = useSocket()
  const {data} = useExperiments()

  return <Dialog open={open} onOpenChange={(o)=>setOpen(o)}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Project selection</DialogTitle>
        <DialogDescription>
          To start the experiment, please select the project associated with the experiment.
        </DialogDescription>
      </DialogHeader>
      <SelectProjectTemplate/>
      <DialogFooter>
        <Button disabled={!data || !data.projectID} variant={"ghost"} className='text-primary' onClick={()=>{
          emit("command",{
            "command": "startExperiment",
            "params": data
          })
      }}>Start experiment</Button>
        <Button variant={"ghost"} onClick={()=>setOpen(false)} >Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

export default OnGoingExperimentWidget