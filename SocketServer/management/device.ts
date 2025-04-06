import { Server, Socket } from "socket.io";
import { DeviceLocationType, ExperimentType, LocationChartDataType, LogType } from "../types/experiment";
import { reportErrorToClient } from "../utils/utils.js";
import { v4 } from "uuid";

const MAX_POINTS_PER_LOCATION= 400

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
      console.log("Registering Socket listeners for the device")
    
      // Bind methods to preserve context
      const boundUpdateExperimentLog = this.updateExperimentLog.bind(this);
      
      this.socket.on("get_ongoing_experiment_data", (data)=>{
          console.log("Receiving data from ongoing experiment...")
          this.experimentData = data
          this.sendDataToClient("experiment_data", {
            ...this.experimentData!, 
            locations: this.getTrimmedData()
          })
          this.isExperimentOngoing = true
      })
  
      this.socket.on("update_experiment_status", (status)=>{
          this.experimentData = {
              ...this.experimentData, 
              locations: this.getTrimmedData(),
              ...status
          }
          this.sendDataToClient("experiment_data", this.experimentData!)
      })
   
      // Use the bound method for update_experiment_log
      this.socket.on("update_experiment_log", boundUpdateExperimentLog)
     
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
          // if(this.isExperimentOngoing){
          //     this.pauseExperiment()
          // }
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
        if (!params) {
          console.error("No parameters provided to start experiment")
          return
      }
        const createdAt =  new Date().toISOString()
        this.isExperimentOngoing = true
        this.experimentData = {
          ...params,
          createdAt,
          status: "running",
          logs: params.logs || [], // Ensure logs exists
          locations: params.locations || [], // Ensure locations exists if not provided
          deviceID: params.deviceID || this.id // Fallback to device ID
      }
      console.log("Experiment Data set:", this.experimentData)
      // Add initial log
      this.updateExperimentLog({
        type: "info", 
        desc: "Experiment started", 
        location: "Device"
      })
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
      console.log("Stop Experiment CALLED")
     
      this.isExperimentOngoing = false,
      this.experimentData = null
      
      // Try to add log before nullifying
      this.updateExperimentLog({type:"info", desc:"Experiment ended", location:"Device"})      
    }
  
    updateExperimentLog({type, desc, location}: Partial<LogType>){
     
      if(this.experimentData){
        const log = {
          id: v4(),
          type, 
          desc, 
          createdAt: new Date().toISOString(),
          location
        }
        this.experimentData.logs = this.experimentData.logs || []
        this.experimentData.logs.unshift(log as LogType)
        this.io.to(this.experimentData.deviceID).emit("update_experiment_log",  {
          logs: this.experimentData.logs, 
          deviceID: this.experimentData.deviceID
        })
        console.log("New log added successfully")
      } else {
        console.error("Cannot add log - experimentData is undefined or null")
      }
    }
  
    updateExperimentalData(sensorData: {data: {id: string, x: number, y: number}[]}){
      if (this.isExperimentOngoing) {
        // Broadcast sensor data to all web clients
        sensorData.data.forEach((l, index) =>{
            const location = this.experimentData!.locations[index]
            if(!location) return 

              // Add new data point
              const updatedData = [...location.data, {x: l.x, y: l.y}]
                
            this.experimentData!.locations[index] = {
                id: l.id,
                data: updatedData
            }
        })

        this.io.to(this.id).emit('sensor_data', {
            deviceID: this.id,
            locations: this.getTrimmedData(),
            timestamp: new Date().toISOString()
        });
      }
    }

    getTrimmedData(){
      return this.experimentData!.locations.map(location => ({
        ...location,
        data: location.data.slice(-MAX_POINTS_PER_LOCATION) // Only send last maxPointsToSend points
      }))
    }
  }
  