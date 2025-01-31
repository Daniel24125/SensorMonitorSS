import { handleDeviceRegistration, handleRpiDisconnect, parseCommands, registerRpi, registerWebClient, reportErrorToClient } from './utils/utils.js';
import 'dotenv/config';
import express from 'express';
import { v4 } from 'uuid';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DeviceManager } from './management/device_management.js';

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

const deviceManager = new DeviceManager();
deviceManager.initialize().catch(console.error);

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
   
    // Register client type
    socket.on('register_client', async (clientType) => {
        if (clientType === 'rpi') {
            // registerRpi(socket)
            console.log('RPi registered:', socket.id);

        } 
        else if (clientType === 'web') {
            console.log('Web client registered:', socket.id);
            socket.join('web_clients');
            const devices = await deviceManager.getAllDevices()
            socket.emit('get_connected_devices', devices);
        }
    });

    socket.on('get_rpi_config', async (config) => {
        if(config){
            deviceManager.registerDevice(config, socket.id)
            // handleDeviceRegistration(config, config.id, socket.id)
        }else{
            const devices = await deviceManager.getAllDevices()
            console.log(devices)
            socket.emit('get_connected_devices', devices);
        }
    });

    socket.on('refresh_device_data', async (config) => {
        const device = await deviceManager.isDevice(socket.id)
        await deviceManager.updateDeviceInfo(device.id, config)
        const devices = deviceManager.getAllDevices()
        io.to('web_clients').emit('get_connected_devices', devices);
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
    socket.on('disconnect', async () => {
        console.log("Client Disconnected")
        const isDevice = await deviceManager.isDevice(socket.id)
        if (isDevice) {
            await deviceManager.updateDeviceStatus(isDevice.id, "disconnected", null)

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