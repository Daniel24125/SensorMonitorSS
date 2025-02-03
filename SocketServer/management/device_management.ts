import path from "path";
import fs from "fs/promises";
import { Server } from "socket.io";
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for our data structures
interface DeviceInfo {
  id?: string;
  socketID?: string;
  [key: string]: any; // Allow for additional dynamic device info properties
}

interface Device extends DeviceInfo {
  id: string;
  status: string;
  socketID?: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export class DeviceManager {
  private readonly storageFilePath: string;
  private readonly io: Server;

  constructor(io: Server, storageFilePath: string = './management/devices.json') {
    this.storageFilePath = storageFilePath;
    this.io = io;
  }

  async initialize(): Promise<void> {
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

  async loadDevices(): Promise<Device[]> {
    try {
      const data = await fs.readFile(this.storageFilePath, 'utf8');
      return JSON.parse(data) as Device[];
    } catch (error) {
      console.error('Error loading devices:', error);
      throw error;
    }
  }

  async sendDeviceCommand(deviceID: string, cmd: any): Promise<void> {
    const device = await this.getDeviceByID(deviceID);
    if (device?.socketID) {
      this.io.to(device.socketID).emit("command", cmd);
    }
  }

  async getDeviceByID(deviceID: string): Promise<Device | undefined> {
    const devices = await this.getAllDevices();
    return devices.find(d => d.id === deviceID);
  }

  async saveDevices(devices: Device[]): Promise<void> {
    try {
      await fs.writeFile(
        this.storageFilePath,
        JSON.stringify(devices, null, 2),
        'utf8'
      );
      await this.sendDevicesToWebClients();
    } catch (error) {
      console.error('Error saving devices:', error);
      throw error;
    }
  }

  async getAllDevices(): Promise<Device[]> {
    return await this.loadDevices();
  }

  async isDevice(socketID: string): Promise<Device | undefined> {
    const devices = await this.getAllDevices();
    return devices.find(d => d.socketID === socketID);
  }

  async registerDevice(deviceInfo: DeviceInfo, socketID: string): Promise<Device> {
    try {
      const devices = await this.loadDevices();
      const timestamp = new Date().toJSON();
      const deviceExists = devices.findIndex(device => device.id === deviceInfo.id) > -1;

      if (deviceExists) {
        return await this.updateDeviceStatus(deviceInfo.id!, "ready", socketID);
      }

      const newDevice: Device = {
        ...deviceInfo,
        id: deviceInfo.id || uuidv4(),
        createdAt: timestamp,
        status: 'ready',
        lastUpdatedAt: timestamp,
        socketID
      };

      devices.push(newDevice);
      await this.saveDevices(devices);
      return newDevice;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  async updateDeviceStatus(deviceId: string, status: string, socketID: string): Promise<Device> {
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
      return devices[deviceIndex];
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
  }

  async updateDeviceInfo(deviceId: string, info: Partial<DeviceInfo>): Promise<Device> {
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
      await this.sendDevicesToWebClients();
      return devices[deviceIndex];
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
  }

  async deviceExists(deviceId: string): Promise<boolean> {
    try {
      const devices = await this.loadDevices();
      return devices.some(device => device.id === deviceId);
    } catch {
      return false;
    }
  }

  // Utility method to help with race conditions
  async atomicUpdate<T>(updateFn: (devices: Device[]) => Promise<T>): Promise<T> {
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
    throw new Error('Atomic update failed after all retries');
  }

  async sendDevicesToWebClients(): Promise<void> {
    const devices = await this.getAllDevices();
    this.io.to('web_clients').emit('get_connected_devices', devices);
  }
}