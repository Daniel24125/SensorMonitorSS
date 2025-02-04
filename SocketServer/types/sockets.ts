import { ExperimentType } from "./experiment"



export type CommandDataType = {
    command: AvailableCommansType, 
    params: ExperimentType
}

export type ParseCommandsType =  (data: CommandDataType) =>void


export type ErrorType = {
    message: string | Error,
    device_id?: string
}

type AvailableCommansType = "startExperiment" | "stopExperiment" 

export type ValidateCommandType = (command: AvailableCommansType, params: ExperimentType)=>boolean


export type ValidCommandsType ={
    startExperiment: (params: ExperimentType) =>boolean,
    stopExperiment: (params: ExperimentType)=>boolean
}