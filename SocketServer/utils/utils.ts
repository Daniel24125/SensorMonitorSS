
import { DefaultEventsMap, Socket } from "socket.io";
import { deviceManager, io } from "../server.js";
import { ErrorType, ParseCommandsType, ValidateCommandType, ValidCommandsType } from "../types/sockets.js";

const validCommands = {
    // 'valve': (params: CommandParamsType) => params.valveId && typeof params.state === 'boolean',
    // 'configure': (params: CommandParamsType) => params.configuration && typeof params.configuration === 'object',
    // 'getReadings': (params: CommandParamsType) => true,
    'startExperiment': (params) => {
        const {configurationID, projectID, userID} = params
        return Boolean(configurationID) && typeof configurationID === 'string' &&
        Boolean(projectID) && typeof projectID === 'string'&&
        Boolean(userID) && typeof userID === 'string'
    },
    'stopExperiment': (params) => Boolean(params.deviceID) && typeof params.deviceID === "string",
    'pauseExperiment': () => true,
    'resumeExperiment': () => true,
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

export const parseCommands: ParseCommandsType = async (socket, data)=>{
    const { command, params } = data;
    // Validate command
    if (!validateCommand(command, params)) {
        reportErrorToClient({message: 'Invalid command or parameters'});
        return 
    }
    console.log(`Command received: ${command}`);
    deviceManager.sendDeviceCommand(socket,command,params)
}



export const webClientConnection = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> )=>{
    console.log('Web client registered:', socket.id);
    socket.join('web_clients');
    const devices = await deviceManager.getAllDevices()
    socket.emit('get_connected_devices', devices);
}
