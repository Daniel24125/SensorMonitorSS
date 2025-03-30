import { NoLocationSelected } from '@/app/devices/components/LocationDetails'
import { Button } from '@/components/ui/button'
import { ChartConfig,ChartContainer} from '@/components/ui/chart'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDevices } from '@/contexts/devices'
import { useExperiment, useExperiments } from '@/contexts/experiments'
import { useSocket } from '@/contexts/socket'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import React, { ReactElement, SVGProps } from 'react'
import { 
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts"
 


export const chartConfig = {
    sensorData: {
      label: "pH Value",
      color: "#2563eb",
    }
  } satisfies ChartConfig

const ExperimentData = ({deviceID}:{deviceID: string}) => {
  return (
    <div className='w-full h-96 border rounded-xl flex overflow-hidden shrink-0'>
        <div className='w-3/4 min-w-72 h-full flex flex-col'>
            <ChartHeader deviceID={deviceID}/>
            <ChartComponent deviceID={deviceID}/>
        </div>
        <ScrollArea className='w-1/4 min-w-32  h-full  bg-card py-2'>
            <div className='w-full h-full flex flex-col '>
                <LocationListComponent deviceID={deviceID}/>
            </div>
        </ScrollArea>
    </div>
  )
}

const ChartHeader = ({deviceID}:{deviceID: string})=>{
    const {selectedLocation} = useExperiment(deviceID)

    return selectedLocation && <div className='w-full flex justify-between items-center py-2 px-4'>
        <h5 className='text-location font-bold text-lg'>{selectedLocation.name}</h5>
        <div className='flex items-center'>
            <PumpControls deviceID={deviceID}/>
        </div>
    </div>
}

const PumpControls = ({deviceID}:{deviceID: string})=>{
    const {isDeviceOn, selectedLocation, setSelectedLocation} = useExperiment(deviceID)
    const {setSelectedLocation: expSetSelectedLocation} = useExperiments()
    const {emit, on} = useSocket()

    React.useEffect(()=>{
        on("update_pump_status", (data: {deviceID: string, pump: "acidic" | "alkaline", status: boolean})=>{
            if(selectedLocation){
                expSetSelectedLocation(data.deviceID, {
                    ...selectedLocation, 
                    isAcidPumping: data.pump === "acidic" ? data.status : selectedLocation!.isAcidPumping,
                    isBasePumping: data.pump === "alkaline" ? data.status : selectedLocation!.isBasePumping
                })
            }
        })
    },[])


    return <>
    <TooltipWrapper title="Acidic Pump">
        <Button onClick={()=>{
            emit("toggle_pump",{
                deviceID,
                selectedLocation,
                pump: "acid",
            })
            if(selectedLocation){
                setSelectedLocation({
                    ...selectedLocation, 
                    isAcidPumping: !selectedLocation!.isAcidPumping
                })
            }
        }} disabled={!isDeviceOn} className={`${selectedLocation?.isAcidPumping ? "text-yellow-400" : "text-gray-500"}`} variant={"ghost"} size="icon">
            ACP
        </Button>
    </TooltipWrapper>
    <TooltipWrapper title="Alkaline Pump">
        <Button onClick={()=>{
            emit("toggle_pump",{
                deviceID,
                selectedLocation,
                pump: "alkaline"
            })
            if(selectedLocation){
                setSelectedLocation({
                    ...selectedLocation, 
                    isBasePumping: !selectedLocation!.isBasePumping
                })
            }
        }} disabled={!isDeviceOn} className={`${selectedLocation?.isBasePumping ? "text-blue-500" : "text-gray-500"}`} variant={"ghost"} size="icon">
            ALP
        </Button>
    </TooltipWrapper>
    </>
}

export const ChartComponent = ({deviceID}:{deviceID: string})=>{
    const {selectedLocation, isExperimentOngoing, experiment} = useExperiment(deviceID)
  

    const chartData = React.useMemo(()=>{
        if(!selectedLocation) return []
        const locationsData = experiment!.locations.find(l=>l.id === selectedLocation!.id)
        
        if(!locationsData) return []
        return locationsData!.data
    }, [experiment, selectedLocation])

    const renderCustomTick: (value: any, index: number) => string = (value)=>{
        
        let seconds: number | string =  Math.floor(value%60)
        let minutes : number | string= Math.floor((value % 3600) / 60)
        let hours: number | string = Math.floor((value % 86400) / 3600)
        const days: number | string = Math.floor(value / 86400);
           
        seconds = seconds <10 ? `0${seconds}` : seconds
        minutes = minutes <10 ? `0${minutes}` : minutes
        hours = hours <10 ? `0${hours}` : hours

        if(value >= 86400) return  `${days}:${hours}:${minutes}:${seconds}`

        if(value >= 3600 && value < 86400) return `${hours}:${minutes}:${seconds}`

        if(value >= 60 && value < 3600) return `${minutes}:${seconds}`
        return value
    }
    
    return selectedLocation ? isExperimentOngoing ? <ChartContainer 
        config={chartConfig} 
        className=" w-full h-full max-h-72">
        <ScatterChart
          margin={{
              top: 20,
              right: 20,
              bottom: 0,
              left: 0,
            }}
        >
            <CartesianGrid />
            <XAxis 
                type="number" 
                dataKey="x" 
                name="Time" 
                domain={['auto', 'auto']}
                tickFormatter={renderCustomTick}
                />
            <YAxis type="number" dataKey="y" name="pH"  />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="pH Data" data={chartData} fill="#8884d8" line shape="circle" />
        </ScatterChart>
    </ChartContainer>: <NoExperimentOngoingComponent/> : <NoLocationSelected/>     
}

const NoExperimentOngoingComponent = ()=>{
    return <div className='flex justify-evenly w-full h-full items-center'>
        <div className='flex flex-col items-center gap-2'>
            <h2 className='text-5xl font-bold'>Waiting!</h2>
            <p>You didn&apos;t start the experiment yet</p>
           
        </div>

    </div>
}

type LocationListPropsTyep={
    showIcon?: boolean,
    deviceID: string
}

export const LocationListComponent = ({showIcon=true, deviceID}: LocationListPropsTyep)=>{
    const {experiment, selectedLocation, setSelectedLocation, isDeviceOn, isExperimentOngoing} = useExperiment(deviceID)
    const {getConfigurationByID} = useDevices()

    if(!experiment) return 
    return experiment!.locations.map(l=>{
        const lastSensorData = l.data.length > 0 ? l.data[l.data.length - 1].y: null
        const isActive = selectedLocation && selectedLocation.id === l.id
        const configuration = getConfigurationByID(deviceID, experiment.configurationID)
        const location = configuration!.locations.find(loc=>loc.id === l.id)!
        return <div key={l.id} onClick={()=>{
            if(isDeviceOn && isExperimentOngoing){
                setSelectedLocation(location)
            }
        }} className='w-full hover:bg-slate-950 flex justify-between px-4 py-2 cursor-pointer items-center gap-2'>
        <div className={cn(
            'flex items-center gap-2 text-sm ',
            isActive ? "font-bold text-[#9C88FF]":""
        )}>
            {showIcon && <MapPin/>}
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