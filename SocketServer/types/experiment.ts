export type ExperimentStatusType = {
    isRunning: boolean,
    startTime: null | string,
    configurationID: null | string,
    projectID: null | string,
    userID: null | string,
    deviceID: null | string
    duration: number
}


export type PhSensorModeType =  "acidic" | "alkaline" | "auto"

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
    updatedBy: string, 
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

export type DeviceErrorType = {
    message: string 
    deviceID: string
}


type UpdateDeviceDataType ={
    id: string
    name: string 
    configurationID: string
    locationID?: null | string
    sensorID?: null | string
    createdAt?: string
    lastUpdatedAt?: string
    locations: DeviceLocationType
    sensors: SensorType
}

type UpdateDeviceCommandType = {
    context: "device" | "configuration" | "location" | "sensor",
    operation:  "create" | "update" | "delete",
    data: UpdateDeviceDataType
}

export type UpdateDeviceConfigType = {
    data: UpdateDeviceCommandType
    deviceID: string
}



