"use client"
import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { DeviceType, useDevices } from '@/contexts/devices'
import { Button } from '@/components/ui/button'
import { DiamondPlus, ExternalLink,  RadioReceiver, ToggleLeft, ToggleRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import DashboardCard from '@/components/ui/dashboard-card'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUserProfile } from '@/contexts/user'
import { TooltipWrapper } from '@/components/ui/tooltip'

export const deviceIconColors = {
    "ready": "#2ECC71",
    "busy": "#FDCB6E",
    "disconnected": "#35363A"
}

type DeviceWidgetProps = {
    showHeaderIcon?: boolean
    setDevice?: (device: DeviceType)=>void
}
const DeviceWidget = ({
    showHeaderIcon
}:DeviceWidgetProps) => {
    const router = useRouter()
    const {getDeviceByID, deviceList} = useDevices()
    const {user, setOpen} = useUserProfile()

    const userSubscriptions = React.useMemo(()=>{
        return user!.deviceSubscriptions.map(d=>getDeviceByID(d))
    },[user, deviceList])
    
    return (
        <WidgetCard title="Devices" secondaryAction={<>
            {showHeaderIcon && <div className='flex gap-2 items-center'>
                <TooltipWrapper title="Subscribe to a device">
                    <Button onClick={()=>setOpen(true)} size="icon" variant="ghost"><DiamondPlus/></Button>
                </TooltipWrapper>
                <Button onClick={()=>router.push("/devices")} size="icon" variant="ghost"><ExternalLink/></Button>
            </div>}
        </>} className={cn('w-80 flex-shrink-0', )}>
            {userSubscriptions!.length > 0 ? <ScrollArea className='w-full h-full flex flex-col gap-5'>
                {userSubscriptions!.map(d=><DeviceCardComponent key={d!.id} device={d!}/>)}
            </ScrollArea>: <NoDeviceDetected/>}
        </WidgetCard>
    )
}

const NoDeviceDetected = ()=>{
    const {setOpen} = useUserProfile()

    return <div className='w-full h-full flex justify-center items-center flex-col text-center gap-3'>
        <h4 className='font-bold text-primary text-2xl'>We noticed something!</h4>
        <h6>You did not subscribe to any device.</h6>
        <Button onClick={()=>setOpen(true)}>Subscribe</Button>
    </div>
}

const DeviceCardComponent = ({device}:{device: DeviceType})=>{
    const {setSelectedDevice} = useDevices()
    return <DashboardCard 
        setSelected={()=>setSelectedDevice(device)}
        title={device.name}
        subtitle={`${device.configurations.length} configurations defined`}
        color={deviceIconColors[device.status]}
        secondaryAction={<DeviceSwitch device={device}/>}
    >
        <RadioReceiver/>
    </DashboardCard>
}

const DeviceSwitch = ({device}:{device: DeviceType})=>{

    const switchColor = React.useMemo(()=>{
        return device.status === "disconnected" ? "muted" : device.status === "busy" ? "muted": "primary"
    },[device.status])

    const deviceReady = React.useMemo(()=>{
        return  device.status !== "disconnected" && device.status === "ready"
    },[device.status])

    return <Button disabled={!deviceReady} className={`flex-shrink-0 text-${switchColor}`} variant="ghost" size="icon" >
        {deviceReady ? <ToggleRight/> : <ToggleLeft/>}
    </Button>
}
export default DeviceWidget