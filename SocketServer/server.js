require('dotenv').config();
const express = require('express');
const { v4 } = require('uuid');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: process.env.NEXTJS_CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 8000;

// Track RPi connection and experiment status
let rpiSocket = null;
let experimentStatus = {
    isRunning: false,
    startTime: null,
    currentConfiguration: null
};
let connectedDevices = {}

// Command validation
const validateCommand = (command, params) => {
    const validCommands = {
        'valve': (params) => params.valveId && typeof params.state === 'boolean',
        'configure': (params) => params.configuration && typeof params.configuration === 'object',
        'getReadings': (params) => true,
        'startExperiment': (params) => params.configuration && typeof params.configuration === 'object',
        'stopExperiment': (params) => true
    };

    return validCommands[command] && validCommands[command](params);
};

const registerRpi = socket=>{
    if (connectedDevices[socket.id]) {
        // Disconnect existing RPi connection
        socket.disconnect(true);
        delete connectedDevices[socket.id]
    }
    console.log('RPi registered:', socket.id);
}

const registerWebClient = socket =>{
    console.log('Web client registered:', socket.id);
    socket.join('web_clients');
    socket.emit('get_connected_devices', Object.values(connectedDevices));
}

const parseCommands = (socket, data)=>{
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

const handleDeviceRegistration = (config, deviceID, socketID) =>{
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

const handleRpiDisconnect = (socketID)=>{
    console.log('RPi disconnected');
    deviceID = Object.values(connectedDevices).filter(d=>d.socketID === socketID)[0].id
    
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

const reportErrorToClient = (error) => {
    console.error("An error occured while trying to send a device config command.", error)

    io.to('web_clients').emit('error', {
        message: error.message ? error.message : "An error occured in the device!",
        deviceID: error["device_id"] ? error["device_id"] : null,
        timestamp: new Date().toJSON()
    });
}

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
   
    // Register client type
    socket.on('register_client', (clientType) => {
        if (clientType === 'rpi') {
            registerRpi(socket)
        } 
        else if (clientType === 'web') {
            registerWebClient(socket)
        }
    });

    socket.on('get_rpi_config', (config) => {
        if(config){
            handleDeviceRegistration(config, config.id, socket.id)
        }else{
            socket.emit('get_connected_devices',  Object.values(connectedDevices));
        }
    });

    socket.on('refresh_device_data', (config) => {
        deviceID = Object.values(connectedDevices).filter(d=>d.socketID === socket.id)[0].id
        connectedDevices[deviceID] = {
            ...connectedDevices[deviceID],
            ...config
        }
        io.to('web_clients').emit('get_connected_devices', Object.values(connectedDevices));
    });

    socket.on("updateDeviceConfig", config =>{
        /* 
            config: {
                deviceID: string, 
                data: any
            }
        */

       const device = connectedDevices[config["deviceID"]]
       try {
            const submitData = config.data
            const isCreate =  submitData.operation === "create"
            const operationContext = submitData.context 
            if(!device || device.status === "disconnected"){
                throw Error("The device you are trying to communicate is not connected. Please make sure the device is turned on.")
            }
            if(!config.data){
                throw Error("Invalid command format")
            }
            io.to(device.socketID).emit("updateDeviceConfig", {
                ...submitData,
                data:{
                    ...submitData.data,
                    id: isCreate ? v4() : submitData.data.id,
                    createdAt: isCreate ? new Date().toJSON() : submitData.data.createdAt,
                    updatedAt: isCreate ? null : new Date().toJSON(), 
                    locations: operationContext === "configuration" ? isCreate ? [] : submitData.data.locations: null,
                    sensors: operationContext === "location" ? isCreate ? [] : submitData.data.sensors: null
                }
            })
        } catch (error) {
            reportErrorToClient({
                message: error.message,
                device_id: device? device.id : null
            })
        }

    })

    // Handle commands from web client
    socket.on('command', (data) => {
        // Check if RPi is connected
        if (!rpiSocket) {
            socket.emit('command_error', {
                error: 'RPi not connected',
                command
            });
            return;
        }
       parseCommands(socket, data)
    });

    // Handle sensor data from RPi
    socket.on('sensor_data', (data) => {
        if (socket === rpiSocket && experimentStatus.isRunning) {
            // Broadcast sensor data to all web clients
            io.to('web_clients').emit('sensor_update', {
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle command responses from RPi
    socket.on('command_response', (data) => {
        const { senderId, response, status } = data;
        io.to('web_clients').emit('command_result', {
            response,
            status,
            timestamp: new Date().toISOString()
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log("Client Disconnected")
        const isDevice = Object.values(connectedDevices).filter(d=>d.socketID === socket.id).length > 0
        if (isDevice) {
            handleRpiDisconnect(socket.id)
        }
    });

    // Handle errors
    socket.on('error', (error) => {
        /*
            Receives errors from the device socket client
            error: {
                message: string,
                device_id: string
            }
        */ 
        console.error('Socket error:', error);
        reportErrorToClient(error)
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        rpiConnected: !!rpiSocket,
        experimentStatus
    });
});

http.listen(PORT, () => {
    console.log(`Bridge server running on port ${PORT}`);
});