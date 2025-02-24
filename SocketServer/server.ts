import {   reportErrorToClient, validateCommand } from './utils/utils.js';
import 'dotenv/config';
import express from 'express';
import { v4 } from 'uuid';
import { createServer } from 'http';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { DeviceManager } from './management/device_management.js';
import { DeviceType,  ExperimentType,  UpdateDeviceConfigType } from './types/experiment.js';
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



const deviceManager = new DeviceManager(io);
deviceManager.initialize().catch(console.error);


const parseCommands: ParseCommandsType = async (data)=>{
    const { command, params } = data;
    // Validate command
    if (!validateCommand(command, params)) {
        reportErrorToClient({message: 'Invalid command or parameters'});
        return 
    }

    console.log(`Command received: ${command}`);

    // Handle experiment-related commands
    // deviceManager.sendDeviceCommand(deviceID, {
    //     cmd: command, 
    //     data: experimentStatus.data!
    // })
    deviceManager.sendDeviceCommand(command,params)
}

const webClientConnection = async (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> )=>{
    console.log('Web client registered:', socket.id);
    socket.join('web_clients');
    const devices = await deviceManager.getAllDevices()
    socket.emit('get_connected_devices', devices);
    // updateClientsExperimentData(experimentStatus.isExperimentOngoing, experimentStatus.data)
}


io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    // Register client type
    socket.on('register_client', async (clientType: "rpi" | "web") => {
        if (clientType === 'rpi') {
            console.log('RPi registered:', socket.id);
        } 
        else if (clientType === 'web') {
            await webClientConnection(socket)
        }
    });

    socket.on('get_rpi_config', async (config) => {
        if(config){
            deviceManager.registerDevice(config, socket)
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

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log("Client Disconnected")
        const device = await deviceManager.isDevice(socket.id)
        if (Boolean(device)) {
            await deviceManager.updateDeviceStatus(device!.id, "disconnected")
            deviceManager.disconnectDevice(device!.id)
        }
    });

   
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy'
    });
});

http.listen(PORT, () => {
    console.log(`Bridge server running on port ${PORT}`);
});