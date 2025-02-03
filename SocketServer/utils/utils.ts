
import { io } from "../server.js";
import { CommandParamsType, ErrorType, ValidateCommandType, ValidCommandsType } from "../types/sockets.js";

const validCommands = {
    // 'valve': (params: CommandParamsType) => params.valveId && typeof params.state === 'boolean',
    // 'configure': (params: CommandParamsType) => params.configuration && typeof params.configuration === 'object',
    // 'getReadings': (params: CommandParamsType) => true,
    'startExperiment': (params: CommandParamsType) => {
        const {configurationID, projectID, userID} = params
        return Boolean(configurationID) && typeof configurationID === 'string' &&
        Boolean(projectID) && typeof projectID === 'string'&&
        Boolean(userID) && typeof userID === 'string'
    },
    'stopExperiment': (params) => Boolean(params.deviceID) && typeof params.deviceID === "string"
} satisfies ValidCommandsType;

export const validateCommand: ValidateCommandType = (command, params) => {
    return command in validCommands && validCommands[command](params);
};



export const reportErrorToClient = (error: ErrorType ) => {
    console.error("An error occured while trying to send a device config command.", error)

    io.to('web_clients').emit('error', {
        message: error.message ? error.message : "An error occured in the device!",
        deviceID: error["device_id"] ? error["device_id"] : null,
        timestamp: new Date().toISOString()
    });
}

