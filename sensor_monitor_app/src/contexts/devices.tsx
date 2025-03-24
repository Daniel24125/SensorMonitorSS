"use client"

import React from 'react'
import { useSocket } from './socket';
import { useToast } from '@/hooks/use-toast';
import WarningDialogProvider from './warning';
import { useUser } from '@auth0/nextjs-auth0';
import Loading from '@/app/components/Loading';

export interface User {
    sub: string;
    name?: string;
    nickname?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email?: string;
    email_verified?: boolean;
    org_id?: string;
}

export type PhSensorModeType =  "acidic" | "alkaline" | "auto"
export type DevicePortType =  "i1" | "i2" | "i3" | "i4" | "i5" | "i6" | "i7" | "i8" | "i9" | "i10" | "i11" | "i12"

export type PhSensorType = {
    id?: string
    mode:PhSensorModeType
    margin: number 
    maxValveTimeOpen: number 
    phMonitorFrequency: number
    targetPh: number 
    devicePort: DevicePortType
    checkInterval: number
    createdAt?: string
    updatedAt?: string
    updatedBy?: string
}

type TemperatureSensorType = {
    probePort: string
}

export type SensorType = PhSensorType | TemperatureSensorType

export type DeviceLocationType ={
    id: string, 
    name: string, 
    createdAt: string, 
    updatedAt?: string 
    updatedBy?: string, 
    isAcidPumping?: boolean
    isBasePumping?: boolean
    sensors: PhSensorType[]
}

export type DeviceConfigurationType = {
    id: string
    name: string
    createdAt: string
    lastUpdatedAt?: string
    locations: DeviceLocationType[]
}

export type DeviceType = {
    id: string
    name: string
    createdAt: string
    lastUpdatedAt?: string
    status: "ready" | "busy" | "disconnected"
    configurations: DeviceConfigurationType[]
}

type DeviceErrorType = {
    message: string 
    deviceID: string
}

interface DeviceContextType {
    deviceList: DeviceType[]
    selectedDevice: null | DeviceType
    setSelectedDevice: React.Dispatch<React.SetStateAction<null | DeviceType>>,
    getDeviceByID: (deviceID: string)=> null | DeviceType | undefined
    isDeviceOn: (deviceID: string) => boolean | undefined
    getConfigurationByID: (deviceID: string, configurationID: string) => null | undefined | DeviceConfigurationType

}

const DevicesContext = React.createContext<DeviceContextType | null>(null)

// Custom hook to use socket context with type safety
export const useDevices = (): DeviceContextType => {
  const context = React.useContext(DevicesContext);
  if (!context) {
    throw new Error('useDevices must be used within a DevicesProvider');
  }
  return context;
};

interface DevicesProviderProps {
  children: React.ReactNode;
}

const DevicesProvider = ({children}: DevicesProviderProps) => {
    const [deviceList, setDeviceList] = React.useState<DeviceType[]>([])
    const [selectedDevice, setSelectedDevice] = React.useState<null | DeviceType>(null)
    const [devicesLoading, setDevicesLoading] = React.useState<boolean>(true)
    const {on, emit, isConnected} = useSocket()
    const { toast } = useToast()
    const { isLoading} = useUser()

    const getDeviceByID = React.useCallback((deviceID: string)=>{
        const list = deviceList.find(d=>d.id === deviceID)
        return list
    }, [isLoading, deviceList])

    const isDeviceOn = React.useCallback((deviceID: string)=>{
        const device = getDeviceByID(deviceID)
        return Boolean(device) && device!.status !== "disconnected"
    }, [isLoading, deviceList])

    const getConfigurationByID = React.useCallback((deviceID: string, configurationID: string)=>{
        const device = getDeviceByID(deviceID)
        if(!device) return null
        const list = device.configurations.find(c=>c.id === configurationID)
        return list
    }, [isLoading, deviceList])

    const loading = React.useMemo(()=> isLoading || devicesLoading,[isLoading, devicesLoading])

    const value: DeviceContextType = {
        deviceList,
        selectedDevice,
        setSelectedDevice, 
        getDeviceByID,
        getConfigurationByID,
        isDeviceOn
    }

    React.useEffect(()=>{
        if(isConnected){
            emit("register_client", "web")
            on<DeviceType[]>("get_connected_devices", (data)=>{
                if(Array.isArray(data)){
                    setDeviceList(data)
                    if(deviceList.length > 0){
                        toast({
                            title: "Device info update",
                            description: "The device information was successfuly updated!",
                        })
                    }
                }
            setDevicesLoading(false)
            })

            on<DeviceErrorType>("error", (err)=>{
                console.error(err.message)
                toast({
                    title: `An error occured on device ${err.deviceID}`,
                    description: err.message,
                    variant: "destructive"
                })
            })
        }
    },[isConnected])

    React.useEffect(()=>{
        if(selectedDevice){
            const updatedDeviceData = deviceList.find(d=>d.id === selectedDevice.id)
            if(!updatedDeviceData) return
            if(updatedDeviceData.status === "disconnected"){
                setSelectedDevice(null)
            }else{
                setSelectedDevice(updatedDeviceData)
            }
        }else if(deviceList.length > 0){
            setSelectedDevice(deviceList[0])
        }
    }, [deviceList])

    if(loading) return <Loading/>
    return <DevicesContext.Provider value={value}>
        <WarningDialogProvider>
            {children}
        </WarningDialogProvider>
    </DevicesContext.Provider>
}

export default DevicesProvider


