import { handleDeviceRegistration, handleRpiDisconnect, parseCommands, registerRpi, registerWebClient, reportErrorToClient } from './utils.js';
import 'dotenv/config';
import express from 'express';
import { v4 } from 'uuid';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const http = createServer(app);
const io = new Server(http, {
    cors: {
        origin: process.env.NEXTJS_CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

export { io };

const PORT = process.env.PORT || 8000;

// Track RPi connection and experiment status
let rpiSocket = null;
let experimentStatus = {
    isRunning: false,
    startTime: null,
    currentConfiguration: null
};
export let connectedDevices = {}



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

            const parsedData = {
                ...submitData.data,
                id: isCreate ? v4() : submitData.data.id,
                createdAt: isCreate ? new Date().toJSON() : submitData.data.createdAt,
                lastUpdatedAt: isCreate ? undefined : new Date().toJSON(), 
                locations: operationContext === "configuration" ? isCreate ? [] : submitData.data.locations: undefined,
                sensors: operationContext === "location" ? isCreate ? [] : submitData.data.sensors: undefined
            }

            console.log(parsedData)
            io.to(device.socketID).emit("updateDeviceConfig", {
                ...submitData,
                data: parsedData
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