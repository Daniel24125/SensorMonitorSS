import path from "path";
import fs from "fs/promises";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import { DeviceStatus, DeviceType,  ExperimentStatusType,  ExperimentType, LogType, PossibleLogTypes } from "../types/experiment";
import { AvailableCommandsType } from "../types/sockets";
import { v4 } from 'uuid';
import { updateClientsExperimentData } from "../server";
import { reportErrorToClient } from "../utils/utils";



type DeviceCommandType = {
  cmd: AvailableCommandsType,
  data: ExperimentType
}


export class DeviceConnection{
  public readonly id: string;
  private readonly io: Server;
  public isExperimentOngoing: boolean
  public experimentData : null | ExperimentType
  private socket: Socket
 
  constructor(io: Server, socket: Socket, deviceID: string){
    this.io = io
    this.id = deviceID
    this.isExperimentOngoing = false
    this.experimentData = null
    this.socket = socket
  }

  registerSocketListenners(){
    this.socket.on("update_experiment_status", (status)=>{
      this.experimentData = {
          ...this.experimentData, 
          ...status
      }
      updateClientsExperimentData(true, status)
    })

     // Handle errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      reportErrorToClient(error)
      if(this.isExperimentOngoing){
          this.stopExperiment()
      }
  });
  }
  
  startExperiment = (params: ExperimentType)=>{
      console.log("Start the Experiment")
      const createdAt =  new Date().toISOString()
      this.isExperimentOngoing = true
      this.experimentData = {
        ...params,
        createdAt,
        status: "running",
        logs: []
    }
      this.updateExperimentLog({type:"info",  desc:"Experiment started", location:"Device"})
      updateClientsExperimentData(true, {createdAt})
     
  }
  
  pauseExperiment = ()=>{
      console.log("Pause the Experiment")
      this.experimentData!.status = "paused"
      
      this.io.to('web_clients').emit("experiment_status", {
          isExperimentOngoing: true,
          status: "paused"
      })
      this.updateExperimentLog({type:"info",  desc:"Experiment paused", location:"Device"})
  }
  
  resumeExperiment = ()=>{
      console.log("Resume the Experiment")
      this.experimentData!.status = "running"
      this.io.to('web_clients').emit("experiment_status", {
          isExperimentOngoing: true,
          status: "running"
      })
      this.updateExperimentLog({type:"info", desc:"Experiment resumed", location:"Device"})
  }
  
  stopExperiment = ()=>{
      this.io.to('web_clients').emit('sensor_data', {
          locations: this.experimentData!.locations.map(l=>{
              return{
                  id: l.id, 
                  data: []
              }
          }),
      });
      this.isExperimentOngoing = false,
      this.experimentData = null
      this.updateExperimentLog({type:"info", desc:"Experiment ended", location:"Device"})
      updateClientsExperimentData(false, {
          duration: 0
      })
  }

  updateExperimentLog({type, desc, location}: Partial<LogType>){
    if(this.experimentData && this.experimentData.logs){
      const log = {
          id: v4(),
          type, 
          desc, 
          createdAt: new Date().toISOString(),
          location
      }
      this.experimentData.logs.push(log as LogType)
      this.io.to('web_clients').emit("update_experiment_log",  this.experimentData.logs)
    }
  }

  updateExperimentalData(sensorData: {data: {id: string, x: number, y: number}[]}){
    if (this.isExperimentOngoing) {
      // Broadcast sensor data to all web clients
      sensorData.data.forEach((l, index) =>{
          const location = this.experimentData!.locations[index]
          this.experimentData!.locations[index] = {
              id: l.id,
              data: [...location.data, {x: l.x,y: l.y}]
          }
      })
      this.io.to('web_clients').emit('sensor_data', {
          locations: this.experimentData!.locations,
          timestamp: new Date().toISOString()
      });
  }
  }
}

export class DeviceManager {
  private readonly storageFilePath: string;
  private readonly io: Server;
  private connectedDevices: DeviceConnection[]

  constructor(io: Server, storageFilePath: string = './management/devices.json') {
    this.storageFilePath = storageFilePath;
    this.io = io;
    this.connectedDevices = []
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
      await this.disconnectAllDevices()
    } catch (error) {
      console.error('Error initializing device storage:', error);
      throw error;
    }
  }

  async loadDevices(): Promise<DeviceType[]> {
    try {
      const data = await fs.readFile(this.storageFilePath, 'utf8');
      return JSON.parse(data) as DeviceType[];
    } catch (error) {
      console.error('Error loading devices:', error);
      throw error;
    }
  }

  async disconnectAllDevices(){
    console.log("Disconnecting all devices...")
    const devices = await this.loadDevices()
    for(let d of devices){
      const {id} = d
      await this.updateDeviceStatus(id, "disconnected")
    }
  }

  async sendDeviceCommand( command: AvailableCommandsType, data: ExperimentType): Promise<void> {
    const {deviceID} = data
    const device = await this.getDeviceByID(deviceID);
    const deviceConnection = this.connectedDevices.find(d=>d.id === deviceID)

     if (command === 'startExperiment') {
            deviceConnection!.startExperiment(data)
            this.updateDeviceStatus(deviceID, "busy")
        } else if (command === 'pauseExperiment') {
            deviceConnection!.pauseExperiment()
        } else if (command === 'resumeExperiment') {
            deviceConnection!.resumeExperiment()
        } else if (command === 'stopExperiment') {
            deviceConnection!.stopExperiment()
            this.updateDeviceStatus(deviceID, "ready")
        }
    if (device?.socketID) {
      this.io.to(device.socketID).emit("command", data);
    }
  }

  getDeviceConnection(deviceID: string){
    return this.connectedDevices.find(d=>d.id === deviceID)
  }
  
  updateExperimentLog = (deviceID:string, log: {type: PossibleLogTypes, desc: string, location: string})=>{
    console.log(`Log received: ${log.desc}`)
    const device = this.getDeviceConnection(deviceID)
    device!.updateExperimentLog(log)
    
}
  async getDeviceByID(deviceID: string): Promise<DeviceType | undefined> {
    const devices = await this.getAllDevices();
    return devices.find(d => d.id === deviceID);
  }

  async saveDevices(devices: DeviceType[]): Promise<void> {
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

  async getAllDevices(): Promise<DeviceType[]> {
    return await this.loadDevices();
  }

  async isDevice(socketID: string): Promise<DeviceType | undefined> {
    const devices = await this.getAllDevices();
    return devices.find(d => d.socketID === socketID);
  }

  async registerDevice(deviceInfo: DeviceType, socket: Socket): Promise<DeviceType> {
    try {
      const devices = await this.loadDevices();
      const timestamp = new Date().toJSON();
      const deviceExists = devices.find(device => device.id === deviceInfo.id);

      if (deviceExists) {
        this.connectedDevices.push(new DeviceConnection(this.io, socket, deviceInfo.id))
        return await this.updateDeviceStatus(deviceInfo.id!, "ready", socket.id);
      }

      const newDevice: DeviceType = {
        ...deviceInfo,
        id: deviceInfo.id || uuidv4(),
        createdAt: timestamp,
        status: 'ready',
        lastUpdatedAt: timestamp,
        socketID: socket.id
      };

      devices.push(newDevice);
      await this.saveDevices(devices);
      this.connectedDevices.push(new DeviceConnection(this.io, socket, deviceInfo.id))
      return newDevice;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  async updateDeviceStatus(deviceId: string, status: DeviceStatus, socketID?: string | undefined): Promise<DeviceType> {
    try {
      const devices = await this.loadDevices();
      const deviceIndex = devices.findIndex(device => device.id === deviceId);
      if (deviceIndex === -1) {
        throw new Error(`Device not found: ${deviceId}`);
      }

      devices[deviceIndex] = {
        ...devices[deviceIndex],
        status,
        socketID: socketID ? socketID : devices[deviceIndex].socketID,
        lastUpdatedAt: new Date().toISOString()
      };

      await this.saveDevices(devices);

      return devices[deviceIndex];
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
  }

  async updateDeviceInfo(deviceId: string, info: Partial<DeviceType>): Promise<DeviceType> {
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

  disconnectDevice (deviceID: string){
    const device = this.connectedDevices.find(d=>d.id === deviceID)
    this.connectedDevices = this.connectedDevices.filter(d => d.id !== deviceID)

    if(device && device!.isExperimentOngoing){
      this.io.to("web_clients").emit("force_shutdown", device!.experimentData)
      device.stopExperiment()
      device.updateExperimentLog({type:"error", desc: "The device was disconnected", location: "Device"})
    }
  }
  
  // Utility method to help with race conditions
  async atomicUpdate<T>(updateFn: (devices: DeviceType[]) => Promise<T>): Promise<T> {
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