"use client"

import React from 'react';
import { DeviceLocationType, PhSensorType, useDevices } from './devices';
import { useProjects } from './projects';
import Loading from '@/app/components/Loading';
import { useUser } from '@auth0/nextjs-auth0';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from './socket';

type ExperimentDataType = {
    x: number, //Represents the experiment time
    y: number  //Represents the experiment pH
    timestamp: string
}

// interface ExperimentLocationsType extends DeviceLocationType {
//     sensors: PhSensorType[] & ExperimentDataType[] | []
// }


type LogType = {
    id: string, 
    type: "error" | "info" | "warning",
    desc: string, 
    logTime: string, 
    location: string
}

export type ExperimentType = {
    id?: string,
    deviceID: string
    projectID: string, 
    configurationID: string,
    userID: string,
    createdAt?: string, 
    duration: number,
    data: ExperimentDataType[],
    logs?: LogType[]
  } 


// Define types for the socket context
interface ExperimentContextType {
    data: null | ExperimentType,
    setData: React.Dispatch<React.SetStateAction< null | ExperimentType>>
    isExperimentOngoing: boolean
    setIsExperimentOngoing: React.Dispatch<React.SetStateAction<boolean>>
    registerProject: (projectID: string) => void
    selectedLocation: DeviceLocationType | null,
    setSelectedLocation: React.Dispatch<React.SetStateAction<DeviceLocationType | null>>
    isExperimentDeviceOn: boolean
    startExperiment: ()=>void
    pauseExperiment: ()=>void
    stopExperiment: ()=>void
}


// Create context with type
const ExperimentContext = React.createContext<ExperimentContextType | null>(null);

// Custom hook to use socket context with type safety
export const useExperiments = (): ExperimentContextType => {
  const context = React.useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiments must be used within a ProjectsProvider');
  }
  return context;
};

export const ExperimentProvider = ({ 
  children 
}:{children: React.ReactNode})=>{
    const [data, setData] = React.useState<null | ExperimentType>(null)
    const [isExperimentOngoing, setIsExperimentOngoing] = React.useState(false)
    const [selectedLocation, setSelectedLocation] = React.useState<null | DeviceLocationType>(null)
    const {getProjectByID, isLoading} = useProjects()
    const { getConfigurationByID, isDeviceOn} = useDevices()
    const {user} = useUser()
    const {toast} = useToast()
    const {emit, on} = useSocket()


    React.useEffect(()=>{
        on("sensor_data",data=>{
            console.log("DATA RECEIVED FROM RPi: ", data)
        })
    }, [])

    React.useEffect(()=>{
        if(data && !selectedLocation){
            setSelectedLocation(data.locations[0])
        }
    },[data])

    const isExperimentDeviceOn = React.useMemo(()=>{
        if(!data) return false
        const project = getProjectByID(data!.projectID)
        return (project && isDeviceOn(project!.device)) as boolean
    },[data])

    const registerProject = React.useCallback((projectID: string)=>{
        const projectData = getProjectByID(projectID)
        
        if(projectData){
            const configuration = getConfigurationByID(projectData.device, projectData.configuration)
            if(configuration){
                setData({
                    userID: user!.sub,
                    deviceID: projectData.device,
                    projectID,
                    duration: 0,
                    configurationID: configuration.id,
                    data: []
                    //  configuration!.locations.map(l=>{
                    //     return {
                    //         ...l, 
                    //         sensors: []
                    //     }
                    // })
                })
            }
        }
    },[isLoading])

    const startExperiment = React.useCallback(()=>{
        if(!isExperimentDeviceOn){
            toast({
                title: "Device no connected",
                description: "The device is currently not connected. Please check the connection and try again later.",
                variant: "destructive"
            })
            return 
        }
        emit("user_command", {
            command: "startExperiment", 
            params: data
        })

    },[data])

    const pauseExperiment = React.useCallback(()=>{
        console.log("PAUSE EXPERIMENT")

    },[data])

    const stopExperiment = React.useCallback(()=>{
        console.log("STOP EXPERIMENT")
    },[data])

    const value: ExperimentContextType = {
        data,
        setData,
        isExperimentOngoing,
        setIsExperimentOngoing,
        registerProject,
        selectedLocation,
        setSelectedLocation,
        isExperimentDeviceOn,
        startExperiment,
        pauseExperiment,
        stopExperiment
    }

    if(isLoading) return <Loading/>
    return <ExperimentContext.Provider value={value}>
        {children}
    </ExperimentContext.Provider>
}