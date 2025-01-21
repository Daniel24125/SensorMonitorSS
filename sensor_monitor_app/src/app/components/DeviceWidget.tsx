"use client"
import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { DeviceType, useDevices } from '@/contexts/devices'
import { Button } from '@/components/ui/button'
import { ExternalLink, Plus, RadioReceiver, ToggleLeft, ToggleRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSocket } from '@/contexts/socket'

const deviceIconColors = {
    "ready": "#2ECC71",
    "busy": "#FDCB6E",
    "disconnected": "#35363A"
}


const DeviceWidget = () => {
    const {deviceList} = useDevices()
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
            {deviceList.length > 0 ? <ScrollArea className='w-full h-full flex flex-col gap-5'>
                {deviceList.map(d=><DeviceCardComponent key={d.id} device={d}/>)}
            </ScrollArea>: <NoDeviceDetected/>}
        </WidgetCard>
    )
}

const NoDeviceDetected = ()=>{
    const {emit} = useSocket()

    return <div className='w-full h-full flex justify-center items-center flex-col text-center gap-3'>
        <h4 className='font-bold text-primary text-2xl'>We noticed something!</h4>
        <h6>No device was detected. Please connect the device.</h6>
        <Button onClick={()=>{
            emit("get_rpi_config", null)
        }}>Retry</Button>
    </div>
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
            <span className='ml-3 text-xs text-muted-foreground'>{device.configurations.length} configurations defined</span>
        </div>
        <DeviceSwitch device={device}/>
    </div>
}

const DeviceSwitch = ({device}:{device: DeviceType})=>{

    const switchColor = React.useMemo(()=>{
        return !device.isConnected ? "muted" : device.status === "busy" ? "muted": "primary"
    },[device.isConnected, device.status])

    const deviceReady = React.useMemo(()=>{
        return device.isConnected && device.status === "ready"
    },[device.isConnected, device.status])

    return <Button disabled={!deviceReady} className={`flex-shrink-0 text-${switchColor}`} variant="ghost" size="icon" >
        {deviceReady ? <ToggleRight/> : <ToggleLeft/>}
    </Button>
}
export default DeviceWidget