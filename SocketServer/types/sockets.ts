import { Socket } from "socket.io"
import { ExperimentType } from "./experiment"



export type CommandDataType = {
    command: AvailableCommandsType, 
    params: ExperimentType
}

export type ParseCommandsType =  (socket: Socket, data: CommandDataType) =>void


export type ErrorType = {
    message: string | Error,
    device_id?: string
}

export type AvailableCommandsType = "startExperiment" | "stopExperiment" | "pauseExperiment" | "resumeExperiment"

export type ValidateCommandType = (command: AvailableCommandsType, params: ExperimentType)=>boolean


export type ValidCommandsType ={
    startExperiment: (params: ExperimentType) =>boolean,
    stopExperiment: (params: ExperimentType)=>boolean,
    pauseExperiment: ()=>boolean,
    resumeExperiment: ()=>boolean,
}