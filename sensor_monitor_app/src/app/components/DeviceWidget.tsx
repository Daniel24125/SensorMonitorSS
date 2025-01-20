
import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { DeviceType, useDevices } from '@/contexts/devices'
import { Button } from '@/components/ui/button'
import { ExternalLink, Plus, RadioReceiver, ToggleLeft, ToggleRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const deviceIconColors = {
    "ready": "#2ECC71",
    "busy": "#FDCB6E",
    "disconnected": "#35363A"
}


const DeviceWidget = () => {
    const {deviceList} = useDevices()

    console.log(deviceList)
    return (
        <WidgetCard className='w-80 flex-shrink-0'>
            <div className='flex justify-between items-center mb-6'>
                <h6>Devices</h6>
                <div>
                    <Button size="icon" variant="ghost">
                        <Plus/>
                    </Button>
                    <Button size="icon" variant="ghost">
                        <ExternalLink/>
                    </Button>
                </div>
            </div>
            <ScrollArea className='w-full h-full flex flex-col gap-5'>
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
            </ScrollArea>
        </WidgetCard>
    )
}

const DeviceCardComponent = ({device}:{device: DeviceType})=>{

    const colorStatus = React.useMemo(()=>{
        return !device.isConnected ? deviceIconColors.disconnected : deviceIconColors[device.status]
    },[device.isConnected, device.status])

    return <div className='bg-card w-full h-20 p-3 rounded-xl flex mb-5'>
        <div style={{
            backgroundColor: `${colorStatus}4D`,
            borderColor: `${colorStatus}33`,
            color: colorStatus
        }} className='w-14 h-14 flex-shrink-0 round-full border-solid border-8 rounded-full flex justify-center items-center'>
            <RadioReceiver/>
        </div>
        <div className='flex flex-col w-full'>
            <span className='ml-3 text-sm'>{device.name}</span>
            <span className='ml-3 text-xs text-muted-foreground'>{device.locations.length} locations defined</span>
        </div>
        <DeviceSwitch device={device}/>
    </div>
}

const DeviceSwitch = ({device}:{device: DeviceType})=>{

    const switchColor = React.useMemo(()=>{
        return !device.isConnected ? "muted" : device.status === "busy" ? "muted": "primary"
    },[device.isConnected, device.status])

    return <Button disabled={!device.isConnected || device.status === "busy"} className={`flex-shrink-0 text-${switchColor}`} variant="ghost" size="icon" >
        {device.isConnected ? <ToggleRight/> : <ToggleLeft/>}
    </Button>
}
export default DeviceWidget