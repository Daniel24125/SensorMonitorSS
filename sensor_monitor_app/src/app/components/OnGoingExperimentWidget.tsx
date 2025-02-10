import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { Button } from '@/components/ui/button'
import { ExternalLink, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useExperiments } from '@/contexts/experiments'
import { useDevices } from '@/contexts/devices'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import SelectProjectTemplate from '../experiment/components/SelectExperimentProject'
import ExperimentControls from '../experiment/components/ExperimentControls'
import { ChartComponent, LocationListComponent } from '../experiment/components/ExperimentData'

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

  return <div className='w-full h-full flex justify-between'>
    <div className='h-full flex flex-col w-48 justify-between shrink-0'>
      <div className='w-full h-48 bg-card rounded-2xl shrink-0 flex justify-center items-center'>

      </div>
      <div className='flex justify-center items-center w-full h-20 bg-card shrink rounded-2xl'>
        <ExperimentControls/>
      </div>
    </div>
    <ChartComponent/>
    <div className='flex flex-col h-full justify-center'>
      <LocationListComponent  showIcon={false}/>
    </div>
  </div>
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
    <div onClick={()=>{
      if(hasDeviceConnected){
        setOpen(true)
      }
    }} style={{
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
  const {data, startExperiment} = useExperiments()
  const router = useRouter()

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
         if(data && data.projectID){
          startExperiment()
          // router.push(`/experiment`)
         }
      }}>Start experiment</Button>
        <Button variant={"ghost"} onClick={()=>setOpen(false)} >Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

export default OnGoingExperimentWidget