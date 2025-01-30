import path from "path"
import fs from "fs/promises"
import {v4} from "uuid"

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


export class DeviceManager {
    constructor(storageFilePath = './devices.json') {
      this.storageFilePath = storageFilePath;
    }
  
    async initialize() {
      try {
        // Create directory if it doesn't exist
        const directory = path.dirname(this.storageFilePath);
        await fs.mkdir(directory, { recursive: true });
  
        // Check if file exists, if not create it with empty array
        try {
          await fs.access(this.storageFilePath);
        } catch {
          await this.saveDevices([]);
        }
      } catch (error) {
        console.error('Error initializing device storage:', error);
        throw error;
      }
    }
  
    async loadDevices() {
      try {
        const data = await fs.readFile(this.storageFilePath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Error loading devices:', error);
        throw error;
      }
    }
  
    async saveDevices(devices) {
      try {
        await fs.writeFile(
          this.storageFilePath,
          JSON.stringify(devices, null, 2),
          'utf8'
        );
      } catch (error) {
        console.error('Error saving devices:', error);
        throw error;
      }
    }
  
    async getAllDevices() {
      return await this.loadDevices();
    }
  
    async registerDevice(deviceInfo) {
      try {
        const devices = await this.loadDevices();
        const timestamp = new Date().toISOString();
        
        const newDevice = {
          ...deviceInfo,
          id: deviceInfo.id || uuidv4(),
          createdAt: timestamp,
          status: 'connected',
          lastUpdatedAt: timestamp
        };
  
        devices.push(newDevice);
        await this.saveDevices(devices);
        
        return newDevice;
      } catch (error) {
        console.error('Error registering device:', error);
        throw error;
      }
    }
  
    async updateDeviceStatus(deviceId, status) {
      try {
        const devices = await this.loadDevices();
        const deviceIndex = devices.findIndex(device => device.id === deviceId);
        
        if (deviceIndex === -1) {
          throw new Error(`Device not found: ${deviceId}`);
        }
  
        devices[deviceIndex] = {
          ...devices[deviceIndex],
          status,
          lastUpdatedAt: new Date().toISOString()
        };
  
        await this.saveDevices(devices);
        return devices[deviceIndex];
      } catch (error) {
        console.error('Error updating device status:', error);
        throw error;
      }
    }
  
    async deviceExists(deviceId) {
      try {
        const devices = await this.loadDevices();
        return devices.some(device => device.id === deviceId);
      } catch {
        return false;
      }
    }
  
    // Utility method to help with race conditions
    async atomicUpdate(updateFn) {
      let retries = 3;
      while (retries > 0) {
        try {
          const devices = await this.loadDevices();
          const result = await updateFn(devices);
          await this.saveDevices(devices);
          return result;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay before retry
        }
      }
    }
  }