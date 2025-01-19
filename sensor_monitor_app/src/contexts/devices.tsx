import React from 'react'
import { useSocket } from './socket';
 
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

type LocationType = {
    id: string
    name: string
    createdAt: string
    lastUpdatedAt?: string
    sensor: SensorType[]
}

export type DeviceType = {
    id: string
    name: string
    createdAt: string
    lastUpdatedAt?: string
    isConnected: boolean
    status: "ready" | "busy"
    locations: LocationType[]
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

    const value: DeviceContextType = {
        deviceList
    }

    React.useEffect(()=>{
        if(isConnected){
            emit("register_client", "web")
            on<DeviceType[]>("getDeviceList", (data)=>{
                setDeviceList(data)
            })
        }
    },[isConnected])


    return <DevicesContext.Provider value={value}>
        {children}
    </DevicesContext.Provider>
}

export default DevicesProvider