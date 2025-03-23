import React from 'react'
import WidgetCard from '../ui/WidgetCard'
import { ProjectType, useProjects } from '@/contexts/projects'
import moment from 'moment'
import { Button } from '@/components/ui/button'
import { ExperimentType, LocationChartDataType, useExperiment } from '@/contexts/experiments'
import { useRouter } from 'next/navigation'
import ProjectOptions from './ProjectOptions'
import DeviceBadge from '@/app/devices/components/DeviceBadge'
import { useDevices } from '@/contexts/devices'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChartContainer } from '@/components/ui/chart'
import { chartConfig } from '@/app/experiment/[deviceID]/components/ExperimentData'
import { CartesianGrid, Label, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deleteExperiment } from '@/actions/experiments'
import ExperimentOptions from '@/app/projects/[projectID]/components/ExperimentOptions'
import { useToast } from '@/hooks/use-toast'

const ProjectDetails = () => {
  const {selectedProject} = useProjects()

  return <WidgetCard 
    title={selectedProject ? selectedProject.title :"Project Details"} 
    className='w-full' 
    secondaryAction={
      <div className='flex items-center gap-4'>
        {selectedProject && <DeviceBadge project={selectedProject} />}
        <ProjectOptions
          project={selectedProject!}
        />
      </div>
    }
  >
    {selectedProject ? <ProjectDetailsTemplate/>: <NoDataToDisplay title={<h3 className='text-lg text-accent font-bold'>No information to display</h3>}/>}
  </WidgetCard>
}

const ProjectDetailsTemplate = ()=>{
  const {selectedProject} = useProjects()
  const {isExperimentOngoing} = useExperiment(selectedProject!.device)
  const {isDeviceOn} = useDevices()
  const [selectedExperiment, setSelectedExperiment] = React.useState<ExperimentType | null>(null)
  const router = useRouter()
  
  
  React.useEffect(()=>{
    if(!selectedProject || !selectedProject.experiments || selectedProject.experiments?.length === 0 ) return 
    setSelectedExperiment(selectedProject!.experiments![0])
  },[selectedProject])


  return <div className='flex w-full flex-1 h-full'>
  {selectedProject!.experiments!.length > 0 ? <>
  <ScrollArea className='w-52 bg-card h-[calc(100%-60px)] rounded-xl shrink-0'>
    <div className='flex flex-col  p-2 gap-2'>
        {selectedProject!.experiments?.sort((a,b)=>{
            const aMiliseconds = moment(a.createdAt).unix()
            const bMiliseconds = moment(b.createdAt).unix()
            return bMiliseconds - aMiliseconds
        }).map(e=>{
          return <ExperimentCard
            key={e.id}
            experiment={e}
            className={selectedExperiment && selectedExperiment.id === e.id ? "border-2 border-[#0984E3] ": ""}
            onClick={()=>{
              setSelectedExperiment(e)
            }}
          />
        })}
    </div>
  </ScrollArea>
  <SelectedExperimentDetails selectedExperiment={selectedExperiment}/>
  </>: <NoDataToDisplay title={<>
      <h3 className='text-lg text-accent font-bold'>No experimental data to display</h3>
      <Button disabled={!isDeviceOn(selectedProject!.device) || isExperimentOngoing} onClick={()=>{
        if(isDeviceOn(selectedProject!.device)){
          router.push(`/experiment/${selectedProject!.device}?projectID=${selectedProject!.id}`)
        }
      }}>Start a new experiment</Button>
    </>}/>}
</div>
}

const SelectedExperimentDetails = ({selectedExperiment}: {selectedExperiment: ExperimentType | null})=>{
  const [selectedLocation, setSelectedLocation] = React.useState<LocationChartDataType | null>(null)
  const {toast} = useToast()
  const {getProjectList} = useProjects()

  React.useEffect(()=>{
    if(!selectedExperiment) return 
    setSelectedLocation(selectedExperiment.locations[0])
  },[selectedExperiment])

  const deleteProjectExperiment = React.useCallback(()=>{
        if(!selectedExperiment) return 
        deleteExperiment(selectedExperiment!.id!)
        toast({
            title: "Experiment Deletion",
            description: "The experimental data was successfuly deleted!",
        })
        getProjectList()
    },[selectedExperiment])

  return selectedExperiment ? <div className='w-full h-full p-2 flex justify-start items-start relative'>
    {/* <header className='w-full flex justify-between items-center'>
        <h4 className='text-lg font-bold'>Experiment {selectedExperiment!.id}</h4>
    </header> */}
    {selectedLocation && <SelectedExperimentData selectedLocation={selectedLocation}/>}
        <div className='flex gap-2 items-center absolute top-0 right-0'>
            {selectedLocation && <SelectedExperimentLocationSelection 
              selectedExperiment={selectedExperiment}
              setSelectedLocation={setSelectedLocation}
              selectedLocation={selectedLocation}
            />}
            <ExperimentOptions deleteProjectExperiment={deleteProjectExperiment}/>
        </div>
  </div> : <NoDataToDisplay title={<h3 className='text-lg text-accent font-bold'>No experiment selected</h3>}/>
}

const SelectedExperimentLocationSelection = ({selectedLocation, selectedExperiment, setSelectedLocation}:
  {
    selectedLocation: LocationChartDataType
    selectedExperiment: ExperimentType | null
    setSelectedLocation: React.Dispatch<React.SetStateAction<LocationChartDataType | null>>
  })=>{
    const {getDeviceByID} = useDevices()
    const {selectedProject} = useProjects()

    const device = React.useMemo(()=>{
      if(!selectedProject) return 
      return getDeviceByID(selectedProject.device)
    },[selectedProject])

    const configuration = React.useMemo(()=>{
      if(!selectedProject || !device) return 
      return device?.configurations.find(c=>c.id === selectedProject!.configuration)
    },[selectedProject])


  return configuration && <Select value={selectedLocation!.id} onValueChange={value=>{
    const locationData = selectedExperiment?.locations.find(l=>l.id === value)
    setSelectedLocation(locationData!)
  }}>
    <SelectTrigger  className="bg-[#1f1d2a]  text-[#8C7AE6] border-none rounded-full">
      <SelectValue placeholder="Select a location" />
    </SelectTrigger>
    <SelectContent>
        {selectedExperiment!.locations.map(l=>{
            const locationData = configuration?.locations.find(loc=>loc.id === l.id)
            return <SelectItem key={l.id} value={l.id}>{locationData?.name}</SelectItem>
        })}
      
    </SelectContent>
  </Select>
}

const SelectedExperimentData = ({selectedLocation}: {selectedLocation: LocationChartDataType})=>{
  return <ChartContainer config={chartConfig} className="w-full h-3/4 " >
    <ScatterChart
        margin={{
            top: 20,
            right: 20,
            bottom: 0,
            left: 0,
        }}
    >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Time" unit="s" >
            <Label value="Time (s)" offset={0} position="insideBottom" />
        </XAxis>
        <YAxis type="number" dataKey="y" name="pH"  label={{ value: 'pH', angle: -90, position: 'insideLeft' }}/>
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="pH data" data={selectedLocation!.data} fill="#8884d8" line shape="circle" />
    </ScatterChart>
    </ChartContainer>
}

export const ExperimentCard = ({
  experiment, className, onClick}
  : {
    experiment: ExperimentType
    className?: string, 
    onClick: ()=>void
  })=>{
  return <div key={experiment.id} onClick={onClick} className={cn(
    'w-full p-2 rounded-xl flex flex-col bg-secondary-background border-2 border-secondary-background hover:border-2 hover:border-[#0984E3] cursor-pointer',
    className
  )}>
    <p className='text-xs font-bold'>{experiment.id}</p>
    <p className='text-xs text-accent'>{moment(experiment.createdAt).format("DD/MM/YYYY - hh:mm a")}</p>
  </div>
}

export const NoDataToDisplay = ({title}: {title: React.ReactNode})=>{
  return <div className='w-full h-full flex justify-center items-center flex-col gap-3'>
    {title}
  </div>
}

export default ProjectDetails