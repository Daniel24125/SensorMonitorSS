import { Server, Socket } from "socket.io";
import { ExperimentType, LogType } from "../types/experiment";
import { updateClientsExperimentData } from "../server.js";
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
  
    }
  
    registerSocketListenners(){
      this.socket.on("update_experiment_status", (status)=>{
        this.experimentData = {
            ...this.experimentData, 
            ...status
        }
        updateClientsExperimentData(true, status)
      })
  
      this.socket.on("update_experiment_log", (log)=>{
        this.updateExperimentLog(log)
      })
      
      // Handle sensor data from RPi
      this.socket.on('sensor_data', (sensorID: string, sensorData: {data: {id: string, x: number, y: number}[]}) => {
        this.updateExperimentalData(sensorData)
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
  