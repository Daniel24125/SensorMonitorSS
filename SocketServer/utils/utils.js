
import { io } from "../server.js";


export const validateCommand = (command, params) => {
    const validCommands = {
        'valve': (params) => params.valveId && typeof params.state === 'boolean',
        'configure': (params) => params.configuration && typeof params.configuration === 'object',
        'getReadings': (params) => true,
        'startExperiment': (params) => {
            const {configurationID, projectID, userID} = params
            return configurationID && typeof configurationID === 'string' &&
            projectID && typeof projectID === 'string'&&
            userID && typeof userID === 'string'
        },
        'stopExperiment': (params) => true
    };

    return validCommands[command] && validCommands[command](params);
};



export const reportErrorToClient = (error) => {
    console.error("An error occured while trying to send a device config command.", error)

    io.to('web_clients').emit('error', {
        message: error.message ? error.message : "An error occured in the device!",
        deviceID: error["device_id"] ? error["device_id"] : null,
        timestamp: new Date().toISOString()
    });
}

