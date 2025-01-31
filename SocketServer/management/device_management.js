import path from "path"
import fs from "fs/promises"
import { io } from "../server.js";

export class DeviceManager {
    constructor(storageFilePath = './management/devices.json') {
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
  
    async isDevice(socketID){
        const devices = await this.getAllDevices()
        return devices.find(d=>d.socketID === socketID)
       
    }

    async registerDevice(deviceInfo, socketID) {
      try {
        const devices = await this.loadDevices();
        const timestamp = new Date().toJSON();
        const deviceExists = devices.findIndex(device => device.id === deviceInfo.id) > -1;

        if(deviceExists){
            return await this.updateDeviceStatus(deviceInfo.id, "ready", socketID)
        }

        const newDevice = {
          ...deviceInfo,
          id: deviceInfo.id || uuidv4(),
          createdAt: timestamp,
          status: 'ready',
          lastUpdatedAt: timestamp
        };

        devices.push(newDevice);
        await this.saveDevices(devices);
        await this.sendDevicesToWebClients()
        return newDevice;
      } catch (error) {
        console.error('Error registering device:', error);
        throw error;
      }
    }
  
    async updateDeviceStatus(deviceId, status, socketID) {
      try {
        const devices = await this.loadDevices();
        const deviceIndex = devices.findIndex(device => device.id === deviceId);
        if (deviceIndex === -1) {
          throw new Error(`Device not found: ${deviceId}`);
        }
  
        devices[deviceIndex] = {
          ...devices[deviceIndex],
          status,
          socketID,
          lastUpdatedAt: new Date().toISOString()
        };
  
        await this.saveDevices(devices);
        await this.sendDevicesToWebClients()
        return devices[deviceIndex];
      } catch (error) {
        console.error('Error updating device status:', error);
        throw error;
      }
    }

    async updateDeviceInfo(deviceId, info) {
        try {
          const devices = await this.loadDevices();
          const deviceIndex = devices.findIndex(device => device.id === deviceId);
          if (deviceIndex === -1) {
            throw new Error(`Device not found: ${deviceId}`);
          }
    
          devices[deviceIndex] = {
            ...devices[deviceIndex],
           ...info,
            lastUpdatedAt: new Date().toISOString()
          };
          await this.saveDevices(devices);
          await this.sendDevicesToWebClients()
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

    async sendDevicesToWebClients(){
        const devices = await this.getAllDevices()
        io.to('web_clients').emit('get_connected_devices', devices);
    }
}