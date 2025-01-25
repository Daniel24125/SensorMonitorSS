import { connectedDevices, io } from "./server.js";

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

export const registerRpi = socket=>{
    if (connectedDevices[socket.id]) {
        // Disconnect existing RPi connection
        socket.disconnect(true);
        delete connectedDevices[socket.id]
    }
    console.log('RPi registered:', socket.id);
}

export const registerWebClient = socket =>{
    console.log('Web client registered:', socket.id);
    socket.join('web_clients');
    socket.emit('get_connected_devices', Object.values(connectedDevices));
}

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

export const handleDeviceRegistration = (config, deviceID, socketID) =>{
    if(!connectedDevices.hasOwnProperty(deviceID)){
        connectedDevices[deviceID] = {...config, socketID}
    }else{
        connectedDevices[deviceID] = {
            ...connectedDevices[deviceID],
            ...config,
            status: "ready",
            socketID
        }
    }

    io.to('web_clients').emit('get_connected_devices', Object.values(connectedDevices));
}

export const handleRpiDisconnect = (socketID)=>{
    console.log('RPi disconnected');
    const deviceID = Object.values(connectedDevices).filter(d=>d.socketID === socketID)[0].id
    
    if(connectedDevices.hasOwnProperty(deviceID)){
        connectedDevices[deviceID] = {
            ...connectedDevices[deviceID],
            status: "disconnected",
            socketID: null
        }
    }else{
        console.log("The device is not registered")
    }
   
   
    io.to('web_clients').emit('get_connected_devices', Object.values(connectedDevices));
}

export const reportErrorToClient = (error) => {
    console.error("An error occured while trying to send a device config command.", error)

    io.to('web_clients').emit('error', {
        message: error.message ? error.message : "An error occured in the device!",
        deviceID: error["device_id"] ? error["device_id"] : null,
        timestamp: new Date().toJSON()
    });
}
