
import { io } from "../server.js";


export const validateCommand = (command, params) => {
    const validCommands = {
        'valve': (params) => params.valveId && typeof params.state === 'boolean',
        'configure': (params) => params.configuration && typeof params.configuration === 'object',
        'getReadings': (params) => true,
        'startExperiment': (params) => params.configuration && typeof params.configuration === 'object',
        'stopExperiment': (params) => true
    };

    return validCommands[command] && validCommands[command](params);
};


export const parseCommands = (socket, data)=>{
    const { command, params } = data;

    // Validate command
    if (!validateCommand(command, params)) {
        socket.emit('command_error', {
            error: 'Invalid command or parameters',
            command,
            params
        });
        return;
    }

    console.log(`Command received: ${command}`, params);

    // Handle experiment-related commands
    if (command === 'startExperiment') {
        experimentStatus.isRunning = true;
        experimentStatus.startTime = new Date();
        experimentStatus.currentConfiguration = params.configuration;
    } else if (command === 'stopExperiment') {
        experimentStatus.isRunning = false;
        experimentStatus.startTime = null;
    }

    // Forward command to RPi
    rpiSocket.emit('execute_command', {
        command,
        params,
        timestamp: new Date().toISOString(),
        senderId: socket.id
    });
}


export const reportErrorToClient = (error) => {
    console.error("An error occured while trying to send a device config command.", error)

    io.to('web_clients').emit('error', {
        message: error.message ? error.message : "An error occured in the device!",
        deviceID: error["device_id"] ? error["device_id"] : null,
        timestamp: new Date().toJSON()
    });
}

