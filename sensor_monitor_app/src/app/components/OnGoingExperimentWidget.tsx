import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { Button } from '@/components/ui/button'
import { ExternalLink, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useExperiments } from '@/contexts/experiments'
import { useDevices } from '@/contexts/devices'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import SelectProjectTemplate from '../experiment/[deviceID]/components/SelectExperimentProject'
import ExperimentControls from '../experiment/[deviceID]/components/ExperimentControls'
import { ChartComponent, LocationListComponent } from '../experiment/[deviceID]/components/ExperimentData'
import { getformatedExperimentTime } from '@/lib/utils'
import CircularProgress from '@/components/ui/circular-progress'

const OnGoingExperimentWidget = () => {
  const router = useRouter()
  const {data} = useExperiments()
  return (
    <WidgetCard title='Ongoing Experiments' className='w-full' secondaryAction={<>
      <Button onClick={()=>{
        router.push("/experiment")
      }} size="icon" variant="ghost">
          <ExternalLink/>
      </Button>
    </>}>
        {data ? <OnGoingExperimentData/> : <NotOngoingExperiment/>}
    </WidgetCard>
  )
}

const OnGoingExperimentData = ()=>{
  const {data} = useExperiments()
  const time = React.useMemo(()=>{
    return data? data.duration : 0
  },[data])
  return <div className='w-full h-[calc(100%-55px)] flex justify-between'>
    <div className='h-full flex flex-col w-1/5 min-w-40 max-w-44 justify-between shrink-0'>
      <div className='w-full h-full bg-card rounded-2xl shrink-0 flex flex-col items-center'>
      <CircularProgress size="md"
        progress={
          (time%60)/60 
        } label={
          getformatedExperimentTime(time, false)
        }/>
        <ExperimentControls/>
      </div>
      {/* <div className='flex justify-center items-center w-full h-10 bg-card shrink rounded-2xl'>
      </div> */}
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
         }
      }}>Start experiment</Button>
        <Button variant={"ghost"} onClick={()=>setOpen(false)} >Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

export default OnGoingExperimentWidget