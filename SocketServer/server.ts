import {   reportErrorToClient, validateCommand } from './utils/utils.js';
import 'dotenv/config';
import express from 'express';
import { v4 } from 'uuid';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DeviceManager } from './management/device_management.js';
import { DeviceType, ExperimentStatusType, ExperimentType, UpdateDeviceConfigType } from './types/experiment.js';
import { CommandDataType, ParseCommandsType } from './types/sockets.js';

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
let experimentStatus: ExperimentStatusType = {
    isExperimentOngoing: false,
    data: null
};

const deviceManager = new DeviceManager(io);
deviceManager.initialize().catch(console.error);

const updateClientsExperimentData = (isExperimentOngoing: boolean, data: Partial<ExperimentType | null>)=>{
    io.to('web_clients').emit("experiment_status", {isExperimentOngoing})
    io.to('web_clients').emit("experiment_data", data)
}

const parseCommands: ParseCommandsType = async (data)=>{
    const { command, params } = data;
    // Validate command
    if (!validateCommand(command, params)) {
        reportErrorToClient({message: 'Invalid command or parameters'});
        return 
    }

    console.log(`Command received: ${command}`);

    // Handle experiment-related commands
    const {deviceID} = params
    if (command === 'startExperiment') {
        const createdAt =  new Date().toISOString()
       
        experimentStatus = {
            ...experimentStatus,
            isExperimentOngoing: true,
            data: {
                ...params,
                createdAt,
            }
        }
        updateClientsExperimentData(true, {createdAt})
        deviceManager.updateDeviceStatus(deviceID, "busy")

    } else if (command === 'stopExperiment') {
        experimentStatus = {
            isExperimentOngoing: false, 
            data: null
        }
        updateClientsExperimentData(false, null)
        deviceManager.updateDeviceStatus(deviceID, "ready")

    }
    deviceManager.sendDeviceCommand(deviceID, {
        cmd: command, 
        data: experimentStatus.data!
    })
}



io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
   
    // Register client type
    socket.on('register_client', async (clientType: "rpi" | "web") => {
        if (clientType === 'rpi') {
            console.log('RPi registered:', socket.id);
        } 
        else if (clientType === 'web') {
            console.log('Web client registered:', socket.id);
            socket.join('web_clients');
            const devices = await deviceManager.getAllDevices()
            socket.emit('get_connected_devices', devices);
            updateClientsExperimentData(experimentStatus.isExperimentOngoing, experimentStatus.data)
        }
    });

    socket.on('get_rpi_config', async (config) => {
        if(config){
            deviceManager.registerDevice(config, socket.id)
            // handleDeviceRegistration(config, config.id, socket.id)
        }else{
            const devices = await deviceManager.getAllDevices()
            socket.emit('get_connected_devices', devices);
        }
    });

    socket.on('refresh_device_data', async (config: DeviceType) => {
        const device = await deviceManager.isDevice(socket.id)
        await deviceManager.updateDeviceInfo(device!.id, config)
        const devices = deviceManager.getAllDevices()
        io.to('web_clients').emit('get_connected_devices', devices);
    });

    socket.on("updateDeviceConfig", async (res: UpdateDeviceConfigType) =>{

       const device = await deviceManager.getDeviceByID(res.deviceID)
       try {
            const submitData = res.data
            const isCreate =  submitData.operation === "create"
            const operationContext = submitData.context 
            if(!device || device.status === "disconnected"){
                throw Error("The device you are trying to communicate is not connected. Please make sure the device is turned on.")
            }
            if(!res.data){
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
            io.to(device.socketID as string).emit("updateDeviceConfig", {
                ...submitData,
                data: parsedData
            })
        } catch (error) {
            reportErrorToClient({
                message: error as string | Error,
                device_id: device? device.id : undefined 
            })
        }

    })

    // Handle commands from web client
    socket.on('user_command', (data: CommandDataType) => {
        // Check if RPi is connected
        if (!Object.hasOwn(data.params, "deviceID")) {
            reportErrorToClient({
                message: "No device is associated with the command."
            })
            return;
        }
       parseCommands(data)
    });

    // Handle sensor data from RPi
    socket.on('sensor_data', (data) => {
        if (experimentStatus.isExperimentOngoing) {
            console.log("Message received from RPi")
            // Broadcast sensor data to all web clients
            io.to('web_clients').emit('sensor_data', {
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on("update_experiment_status", (status)=>{
        experimentStatus.data = {
            ...experimentStatus.data, 
            ...status
        }
        updateClientsExperimentData(true, status)
    })
  
    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log("Client Disconnected")
        const isDevice = await deviceManager.isDevice(socket.id)
        if (isDevice) {
            await deviceManager.updateDeviceStatus(isDevice.id, "disconnected")
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
        experimentStatus
    });
});

http.listen(PORT, () => {
    console.log(`Bridge server running on port ${PORT}`);
});