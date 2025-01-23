"use client"

import React from 'react'
import { useSocket } from './socket';
import { useToast } from '@/hooks/use-toast';
import { ProjectProvider } from './projects';
import { Button } from '@/components/ui/button';
 
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

type PhSensorType = {
    id: string
    mode: "acidic" | "alkaline" | "both"
    margin: number 
    maxValveTimeOpen: number 
    targetPh: number 
    probePort: number
    valvePort: number 
    checkInterval: number
    createdAt: string
    updatedAt?: string
    updatedBy?: User
}

type TemperatureSensorType = {}

type SensorType = PhSensorType | TemperatureSensorType

type DeviceLocationType ={
    id: string, 
    name: string, 
    createdAt: string, 
    updatedAt?: string 
    updatedBy: User, 
    sensors: SensorType[]
}

type DeviceConfigurationType = {
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
    const {on, emit, isConnected} = useSocket()
    const { toast } = useToast()

    const value: DeviceContextType = {
        deviceList
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


    return <DevicesContext.Provider value={value}>
        <ProjectProvider>
            {/* <Button onClick={()=>{
              emit("updateDeviceConfig", {
                deviceID: "dvdwvwevewvwddvwev",
                data: {
                    context: "configuration",
                    operation: "create",
                    data: {
                        id: "wobjgfijwerbgiwerjbgv",
                        name: "odwsnfvowerkinvow", 
                        createdAt: new Date().toJSON(),
                        locations: [
                            {
                                id: "ibugeiuebrg",
                                name: "odwsnfvowerkinvow", 
                                createdAt: new Date().toJSON(),
                                sensors: [
                                    {
                                        'id': "ehbvgihweribj",
                                        'mode': "acidics",
                                        'margin': 0.1,
                                        'maxValveTimeOpen': 10,
                                        'targetPh': 10.0,
                                        'probePort': 17,
                                        'checkInterval': 10,
                                        'createdAt':  new Date().toJSON()
                                    }
                                ]
                            }
                        ]
                    }
                }
              })
            }}>Send Config Data Test</Button> */}
            {children}
        </ProjectProvider>
    </DevicesContext.Provider>
}

export default DevicesProvider