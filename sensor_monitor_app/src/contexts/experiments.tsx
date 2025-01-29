"use client"

import React from 'react';
import { DeviceLocationType, PhSensorType, useDevices } from './devices';
import { useProjects } from './projects';
import Loading from '@/app/components/Loading';

type ExperimentDataType = {
    time: number, 
    sensorData: number
}

interface ExperimentLocationsType extends DeviceLocationType {
    sensors: PhSensorType[] & ExperimentDataType[] | []
}

type LogType = {
    id: string, 
    type: "error" | "info" | "warning",
    desc: string, 
    time: string, 
    location: string
}

export type ExperimentType = {
    id?: string,
    projectID: string, 
    createdAt?: string, 
    duration: number,
    locations: ExperimentLocationsType[],
    logs?: LogType[]
  } 


// Define types for the socket context
interface ExperimentContextType {
    data: null | ExperimentType,
    setData: React.Dispatch<React.SetStateAction< null | ExperimentType>>
    isExperimentOngoing: boolean
    setIsExperimentOngoing: React.Dispatch<React.SetStateAction<boolean>>
    registerProject: (projectID: string) => void
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
    const {getProjectByID, isLoading} = useProjects()
    const { getConfigurationByID} = useDevices()
    
    const registerProject = React.useCallback((projectID: string)=>{
        const projectData = getProjectByID(projectID)
        if(projectData){
            const configuration = getConfigurationByID(projectData.device, projectData.configuration)
            setData({
                projectID,
                duration: 0,
                locations: configuration!.locations.map(l=>{
                    return {
                        ...l, 
                        sensors: []
                    }
                })
            })
        }
    },[isLoading])

    const value: ExperimentContextType = {
        data,
        setData,
        isExperimentOngoing,
        setIsExperimentOngoing,
        registerProject
    }

    if(isLoading) return <Loading/>
    return <ExperimentContext.Provider value={value}>
        {children}
    </ExperimentContext.Provider>
}