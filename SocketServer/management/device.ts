import { Server, Socket } from "socket.io";
import { DeviceLocationType, ExperimentType, LogType } from "../types/experiment";
import { reportErrorToClient } from "../utils/utils.js";
import { v4 } from "uuid";


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
      this.socket.join(deviceID);
      this.registerSocketListenners()
    }
  
    registerSocketListenners(){
      console.log("Regestering Socket listenners for the device")
      
      this.socket.on("get_ongoing_experiment_data", (data)=>{
        console.log("Receiving data from ongoing experiment...")
        this.experimentData = data
        this.sendDataToClient("experiment_data", this.experimentData!)
        this.isExperimentOngoing = true
      })

      this.socket.on("update_experiment_status", (status)=>{
        this.experimentData = {
            ...this.experimentData, 
            ...status
        }
        this.sendDataToClient("experiment_data", this.experimentData!)
      })
  
      this.socket.on("update_experiment_log", this.updateExperimentLog)
   
      this.socket.on('update_pump_status', (pumpData: {deviceID: string, location: DeviceLocationType, pump: "acidic" | "alkaline", status: boolean}) => {
        console.log("Sending pump status to client")
        if(pumpData.deviceID === this.id){
          this.io.to("web_clients").emit("update_pump_status", pumpData)
        }
      });

      // Handle sensor data from RPi
      this.socket.on('sensor_data', (sensorData: {deviceID: string, data: {id: string, x: number, y: number}[]}) => {
        if(sensorData.deviceID === this.id){
          this.updateExperimentalData(sensorData)
        }
      });
  
      // Handle errors
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        reportErrorToClient(error)
        if(this.isExperimentOngoing){
            this.stopExperiment()
        }
      });
    }

    sendDataToClient(channel:string, data: Partial<ExperimentType>){
      this.io.to(this.id).emit(channel, {
        deviceID: this.id,
        ...data
      })
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
       
    }
    
    pauseExperiment = ()=>{
        console.log("Pause the Experiment")
        this.experimentData!.status = "paused"
        this.io.to(this.id).emit("experiment_status", {
          deviceID: this.id,
            status: "paused"
        })
        this.updateExperimentLog({type:"info",  desc:"Experiment paused", location:"Device"})
    }
    
    resumeExperiment = ()=>{
        console.log("Resume the Experiment")
        this.experimentData!.status = "running"
        this.io.to(this.id).emit("experiment_status", {
          deviceID: this.id,
          status: "running"
        })
        this.updateExperimentLog({type:"info", desc:"Experiment resumed", location:"Device"})
    }
    
    stopExperiment = ()=>{
        this.isExperimentOngoing = false,
        this.experimentData = null
        this.updateExperimentLog({type:"info", desc:"Experiment ended", location:"Device"})
    }
  
    updateExperimentLog({type, desc, location}: Partial<LogType>){
      if(this.experimentData && this.experimentData.logs ){
        const log = {
          id: v4(),
          type, 
          desc, 
          createdAt: new Date().toISOString(),
          location
        }
        this.experimentData.logs.unshift(log as LogType)
        this.io.to(this.experimentData.deviceID).emit("update_experiment_log",  {
          logs: this.experimentData.logs, 
          deviceID: this.experimentData.deviceID
        })
        console.log("New log added to the log stack.")
      }
    }
  
    updateExperimentalData(sensorData: {data: {id: string, x: number, y: number}[]}){
      if (this.isExperimentOngoing) {
        // Broadcast sensor data to all web clients
        sensorData.data.forEach((l, index) =>{
            const location = this.experimentData!.locations[index]
            if(!location) return 
            this.experimentData!.locations[index] = {
                id: l.id,
                data: [...location.data, {x: l.x,y: l.y}]
            }
        })

        this.io.to(this.id).emit('sensor_data', {
            deviceID: this.id,
            locations: this.experimentData!.locations,
            timestamp: new Date().toISOString()
        });
      }
    }
  }
  