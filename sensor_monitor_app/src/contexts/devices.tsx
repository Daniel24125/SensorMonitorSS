"use client"

import React from 'react'
import { useSocket } from './socket';
import { useToast } from '@/hooks/use-toast';
import { ProjectProvider } from './projects';
import WarningDialogProvider from './warning';

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
    [key: string]: any;
}

export type PhSensorModeType =  "acidic" | "alkaline" | "both"

export type PhSensorType = {
    id?: string
    mode:PhSensorModeType
    margin: number 
    maxValveTimeOpen: number 
    targetPh: number 
    probePort: number
    valvePort: number 
    checkInterval: number
    createdAt?: string
    updatedAt?: string
    updatedBy?: User
}

type TemperatureSensorType = {}

export type SensorType = PhSensorType | TemperatureSensorType

export type DeviceLocationType ={
    id: string, 
    name: string, 
    createdAt: string, 
    updatedAt?: string 
    updatedBy: User, 
    sensors: SensorType[]
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
    setSelectedDevice: React.Dispatch<React.SetStateAction<null | DeviceType>>
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
    const {on, emit, isConnected} = useSocket()
    const { toast } = useToast()

    const value: DeviceContextType = {
        deviceList,
        selectedDevice,
        setSelectedDevice
    }

    
    React.useEffect(()=>{
        if(isConnected){
            emit("register_client", "web")
            on<DeviceType[]>("get_connected_devices", (data)=>{
                setDeviceList(data)
                if(deviceList.length > 0){
                    toast({
                        title: "Device info update",
                        description: "The device information was successfuly updated!",
                    })
                }
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
            const updatedDeviceData = deviceList.filter(d=>d.id === selectedDevice.id)[0]
            if(updatedDeviceData.status === "disconnected"){
                setSelectedDevice(null)
            }else{
                setSelectedDevice(updatedDeviceData)
            }
        }else if(deviceList.length > 0){
            setSelectedDevice(deviceList[0])
        }
    }, [deviceList])


    return <DevicesContext.Provider value={value}>
        <WarningDialogProvider>
            <ProjectProvider>
                {children}
            </ProjectProvider>
        </WarningDialogProvider>
    </DevicesContext.Provider>
}

export default DevicesProvider


