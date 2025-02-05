import { NoLocationSelected } from '@/app/devices/components/LocationDetails'
import { Button } from '@/components/ui/button'
import { ChartConfig,ChartContainer} from '@/components/ui/chart'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDevices } from '@/contexts/devices'
import { LocationChartDataType, useExperiments } from '@/contexts/experiments'
import { useSocket } from '@/contexts/socket'
import { cn } from '@/lib/utils'
import { CircleCheck, CircleMinus, MapPin } from 'lucide-react'
import React from 'react'
import {   ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts"
 


const chartConfig = {
    sensorData: {
      label: "pH Value",
      color: "#2563eb",
    }
  } satisfies ChartConfig

const ExperimentData = () => {
  return (
    <div className='w-full h-96 border rounded-xl flex overflow-hidden'>
        <div className='w-3/4 min-w-72 h-full flex flex-col'>
            <ChartHeader/>
            <ChartComponent/>
        </div>
        <ScrollArea className='w-1/4 min-w-32  h-full  bg-card py-2'>
            <div className='w-full h-full flex flex-col '>
                <LocationListComponent/>
            </div>
        </ScrollArea>
    </div>
  )
}

const ChartHeader = ()=>{
    const {selectedLocation, isExperimentOngoing} = useExperiments()

    return selectedLocation && <div className='w-full flex justify-between items-center py-2 px-4'>
        <h5 className='text-location font-bold text-lg'>{selectedLocation.name}</h5>
        <div className='flex items-center'>
            <TooltipWrapper title="Open valve">
                <Button disabled={!isExperimentOngoing} className="text-primary" variant={"ghost"} size="icon">
                    <CircleCheck/>
                </Button>
            </TooltipWrapper>
            <TooltipWrapper title="Close valve">
                <Button disabled={!isExperimentOngoing} className='text-destructive' variant={"ghost"} size="icon">
                    <CircleMinus/>
                </Button>
            </TooltipWrapper>
            <div className='w-3 h-3 bg-accent rounded-full ml-2'></div>
        </div>
    </div>
}

const ChartComponent = ()=>{
    const {selectedLocation, isExperimentOngoing, setData, data} = useExperiments()
    const {on} = useSocket()
    
    React.useEffect(()=>{
        on<{locations: LocationChartDataType[], timestamp: string}>("sensor_data",data=>{
            setData(prev=>{
                if(!prev) return null
                return {
                    ...prev,
                    locations: data.locations
                }
            })
        })
    }, [])

    const chartData = React.useMemo(()=>{
        if(!selectedLocation) return []
        const locationsData = data?.locations.find(l=>l.id === selectedLocation!.id)
        if(!locationsData) return []
        return locationsData!.data
    }, [data, selectedLocation])


    return selectedLocation ? isExperimentOngoing ? <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
        <ScatterChart
          margin={{
              top: 20,
              right: 20,
              bottom: 0,
              left: 0,
            }}
        >
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="Time" unit="s" />
            <YAxis type="number" dataKey="y" name="pH"  />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="A school" data={chartData} fill="#8884d8" line shape="circle" />
        </ScatterChart>
    </ChartContainer>: <NoExperimentOngoingComponent/> : <NoLocationSelected/>     
}

const NoExperimentOngoingComponent = ()=>{
    return <div className='flex justify-evenly w-full h-full items-center'>
        <div className='flex flex-col items-center gap-2'>
            <h2 className='text-5xl font-bold'>Waiting!</h2>
            <p>You didn&apos;t start the experiment yet</p>
            {/* <Button onClick={()=>{
                if(isExperimentDeviceOn && !isExperimentOngoing){
                    startExperiment()
                  }
            }} disabled={!isExperimentDeviceOn}>Start experiment</Button> */}
        </div>

    </div>
}

const LocationListComponent = ()=>{
    const {data, selectedLocation, setSelectedLocation, isExperimentDeviceOn, isExperimentOngoing} = useExperiments()
    const {getConfigurationByID} = useDevices()

    return data?.locations.map(l=>{
        const lastSensorData = l.data.length > 0 ? l.data[l.data.length - 1].y: null
        const isActive = selectedLocation && selectedLocation.id === l.id
        const configuration = getConfigurationByID(data.deviceID, data.configurationID)
        const location = configuration?.locations.find(loc=>loc.id === l.id)!
        return <div key={l.id} onClick={()=>{
            if(isExperimentDeviceOn && isExperimentOngoing){
                setSelectedLocation(location)
            }
        }} className='w-full hover:bg-slate-950 flex justify-between px-4 py-2 cursor-pointer items-center'>
        <div className={cn(
            'flex items-center gap-2 text-sm ',
            isActive ? "font-bold text-[#9C88FF]":""
        )}>
            <MapPin/>
            {location.name}
        </div>
        <div className={cn(
            "w-10 h-5 flex justify-center items-center rounded-full text-sm",
            isActive ? "font-bold text-[#9C88FF] bg-[#9C88FF33]":"bg-[#3A3A3A33]"
        )}>{lastSensorData ? lastSensorData : "-"}</div>
    </div>
    })
}

export default ExperimentData