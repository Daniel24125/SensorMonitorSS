
export type CommandParamsType = {
    deviceID: string
    configurationID?: undefined| string
    userID?: undefined| string
    projectID?: undefined| string
}


export type CommandDataType = {
    command: AvailableCommansType, 
    params: CommandParamsType
}

export type ParseCommandsType =  (data: CommandDataType) =>void


export type ErrorType = {
    message: string | Error,
    device_id?: string
}

type AvailableCommansType = "startExperiment" | "stopExperiment" 

export type ValidateCommandType = (command: AvailableCommansType, params: CommandParamsType)=>boolean


export type ValidCommandsType ={
    startExperiment: (params: CommandParamsType) =>boolean,
    stopExperiment: (params: CommandParamsType)=>boolean
}