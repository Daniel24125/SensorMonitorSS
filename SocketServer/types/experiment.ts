type ExperimentDataType = {
    x: number, //Represents the experiment time
    y: number  //Represents the experiment pH
}


export type LocationChartDataType = {
    id: string, 
    data: ExperimentDataType[]
}

export type PossibleLogTypes = "error" | "info" | "warning"

export type LogType = {
    id: string, 
    type: PossibleLogTypes,
    desc: string, 
    createdAt: string, 
    location: string
}

interface ExperimentGeneralData{
    duration: number,
    logs?: LogType[]
    createdAt?: string, 
}
type ExperimentStatus = "ready" | "paused" | "running"

export interface ExperimentType extends ExperimentGeneralData{
    id?: string,
    deviceID: string
    projectID: string, 
    dataAquisitionInterval: number,
    configurationID: string,
    userID: string,
    status: ExperimentStatus,
    locations: LocationChartDataType[],
  } 



export type ExperimentStatusType = {
    isExperimentOngoing: boolean,
    data: null | ExperimentType
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
    updatedAt?: string, 
    isAcidPumping?: boolean
    isBasePumping?: boolean
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

export type DeviceStatus = "ready" | "busy" | "disconnected"

export type DeviceType = {
    id: string
    name: string
    createdAt: string
    socketID?: string,
    lastUpdatedAt?: string
    status: DeviceStatus
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



