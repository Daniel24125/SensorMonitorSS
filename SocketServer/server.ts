import {   parseCommands, reportErrorToClient, webClientConnection } from './utils/utils.js';
import 'dotenv/config';
import express from 'express';
import { v4 } from 'uuid';
import { createServer } from 'http';
import { Server} from 'socket.io';
import { DeviceManager } from './management/device_management.js';
import { DeviceLocationType, DeviceType,  UpdateDeviceConfigType } from './types/experiment.js';
import { CommandDataType } from './types/sockets.js';

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



export const deviceManager = new DeviceManager(io);
deviceManager.initialize().catch(console.error);

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('register_client', async (clientType: "rpi" | "web") => {
        if (clientType === 'rpi') {
            console.log('RPi registered:', socket.id);
        } 
        else if (clientType === 'web') {
            await webClientConnection(socket)
        }
    });

    socket.on("get_experiment_data", (userID: string)=>{
        const experiments = deviceManager.getUserOngoingExperiments(userID)
        experiments.forEach(e=>{
           console.log("Retrieving ongoing experiments")
            const id = e.id
            socket.join(id)
        })
        socket.emit("initial_data_update", experiments.map(e=>e.experimentData))
    })

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

    socket.on('toggle_pump', (pumpData: {deviceID: string, selectedLocation: DeviceLocationType,  pump: "acid" | "alkaline"}) => {
        io.to(pumpData.deviceID).emit("toggle_pump", pumpData)
    });

    // Handle commands from web client
    socket.on('user_command', (data: CommandDataType) => {
        // Check if RPi is connected
        if (!Object.hasOwn(data.params, "deviceID")) {
            reportErrorToClient({
                message: "No device is associated with the command."
            })
            return;
        }
       parseCommands(socket, data)
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
    console.log("\nPing received. Sending health status...\n")
    res.status(200).json({
        status: 'healthy'
    });
});

http.listen(PORT, () => {
    console.log(`Bridge server running on port ${PORT}`);
});