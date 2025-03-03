import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { Button } from '@/components/ui/button'
import { ExternalLink, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {  useExperiment, useExperiments } from '@/contexts/experiments'
import { useDevices } from '@/contexts/devices'
import { Dialog, DialogContent, DialogDescription,  DialogHeader, DialogTitle } from '@/components/ui/dialog'
import SelectProjectTemplate from '../experiment/[deviceID]/components/SelectExperimentProject'
import ExperimentControls from '../experiment/[deviceID]/components/ExperimentControls'
import { ChartComponent, LocationListComponent } from '../experiment/[deviceID]/components/ExperimentData'
import { getformatedExperimentTime } from '@/lib/utils'
import CircularProgress from '@/components/ui/circular-progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipWrapper } from '@/components/ui/tooltip'

const OnGoingExperimentWidget = () => {
  const router = useRouter()
  const {experiments} = useExperiments()
  const [selectedExperiment, setSelectedExperiment] = React.useState<null | string>(null)

  const hasExperimenstsOngoing = React.useMemo(()=>{
    const values = Object.values(experiments || {})
    return values.length > 0 && selectedExperiment && values.find(v=>v !== null)
  },[experiments, selectedExperiment])

  React.useEffect(()=>{
    if(experiments){
      const id = Object.keys(experiments)[0]
      setSelectedExperiment(id)
    }
  },[experiments])


  return (
    <WidgetCard title='Ongoing Experiments' className='w-full' secondaryAction={<>
      {hasExperimenstsOngoing && <div className='flex w-full items-center gap-2 justify-end'>
        <Tabs value={selectedExperiment || ""}>
          <TabsList className="w-full">
            {Object.keys(experiments!).map(id=>{
              return <TabsTrigger key={id} value={id}>{id}</TabsTrigger>
            })}
          </TabsList>
        </Tabs>
        <TooltipWrapper title="Open experiment page">
          <Button size={"icon"} variant={"outline"} onClick={()=>{
            router.push(`/experiment/${experiments![selectedExperiment!]!.deviceID}?projectID=${experiments![selectedExperiment!]!.projectID}`)
          }}>
              <ExternalLink/>
          </Button>
        </TooltipWrapper>
      </div>}
    </>}>
        {hasExperimenstsOngoing ? <OnGoingExperimentData selectedExperiment={selectedExperiment!}/> : <NotOngoingExperiment/>}
    </WidgetCard>
  )
}



const OnGoingExperimentData = ({selectedExperiment}:{selectedExperiment: string})=>{
  const {experiment} = useExperiment(selectedExperiment)
  
  const time = React.useMemo(()=>{
    return experiment? experiment.duration : 0
  },[experiment])
  
  return <div className='w-full h-[calc(100%-55px)] flex justify-between'>
    <div className='h-full flex flex-col w-1/5 min-w-40 max-w-44 justify-between shrink-0'>
      <div className='w-full h-full bg-card rounded-2xl shrink-0 flex flex-col items-center justify-center gap-5'>
      <CircularProgress size="md"
        progress={
          (time%60)/60 
        } label={
          getformatedExperimentTime(time, false)
        }/>
        <ExperimentControls deviceID={experiment!.deviceID}/>
      </div>
      {/* <div className='flex justify-center items-center w-full h-10 bg-card shrink rounded-2xl'>
      </div> */}
    </div>
    <ChartComponent deviceID={experiment!.deviceID}/>
    <div className='flex flex-col h-full justify-center'>
      <LocationListComponent deviceID={experiment!.deviceID}  showIcon={false}/>
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

  return <Dialog open={open} onOpenChange={(o)=>setOpen(o)}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Project selection</DialogTitle>
        <DialogDescription>
          To start the experiment, please select the project associated with the experiment.
        </DialogDescription>
      </DialogHeader>
      <SelectProjectTemplate/>
    </DialogContent>
  </Dialog>
}

export default OnGoingExperimentWidget