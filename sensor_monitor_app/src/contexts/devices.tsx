import React from 'react'
 
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
    updatedAt: string
    updatedBy: User
}

type TemperatureSensorType = {}

type SensorType = PhSensorType | TemperatureSensorType

type LocationType = {
    id: string
    name: string
    createdAt: string
    lastUpdatedAt: string
    sensor: SensorType[]
}

type DeviceType = {
    id: string
    name: string
    createdAt: string
    lastUpdatedAt: string
    locations: LocationType[]
}

interface DeviceContextType {
    deviceList: DeviceType[]
}

const DevicesContext = React.createContext<DeviceContextType | null>(null)

const Devices = () => {
  return (
    <div>Devices</div>
  )
}

export default Devices