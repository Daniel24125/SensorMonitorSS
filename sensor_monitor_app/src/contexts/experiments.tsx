"use client"

import React from 'react';
import { DeviceLocationType, useDevices } from './devices';
import { useProjects } from './projects';
import Loading from '@/app/components/Loading';
import { useUser } from '@auth0/nextjs-auth0';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from './socket';
import { useWarningDialog } from './warning';
import { createExperiment } from '@/actions/experiments';

type ExperimentDataType = {
    x: number, //Represents the experiment time
    y: number  //Represents the experiment pH
    timestamp: string
}


export type LocationChartDataType = {
    id: string, 
    data: ExperimentDataType[]
}

export type LogSeverityType = "error" | "info" | "warning"

export type LogType = {
    id: string, 
    type: LogSeverityType,
    desc: string, 
    createdAt: string, 
    location: string
}

interface ExperimentGeneralData{
    duration: number,
    logs?: LogType[]
    createdAt?: string, 
}

type ExperimentStatus = "ready" | "paused" | "running"

export interface ExperimentType extends ExperimentGeneralData{
    id?: string,
    deviceID: string,
    status: ExperimentStatus,
    projectID: string, 
    dataAquisitionInterval: number
    configurationID: string,
    userID: string,
    locations: LocationChartDataType[],
} 

// Updated to store multiple experiments
type ExperimentsStateType = {
    [deviceID: string]: ExperimentType | null
}

// Selected location state by device
type SelectedLocationsStateType = {
    [deviceID: string]: DeviceLocationType | null
}

// Loading state by device
type LoadingStateType = {
    [deviceID: string]: boolean
}

// Define types for the experiment context
interface ExperimentContextType {
    experiments: ExperimentsStateType,
    isExperimentLoading: (deviceID: string) => boolean,
    setExperimentLoading: (deviceID: string, loading: boolean) => void,
    getExperiment: (deviceID: string) => ExperimentType | null,
    setExperiment: (deviceID: string, data: Partial<ExperimentType>) => void
    registerProject: (projectID: string) => void,
    getSelectedLocation: (deviceID: string) => DeviceLocationType | null,
    setSelectedLocation: (deviceID: string, location: DeviceLocationType | null) => void,
    isExperimentDeviceOn: (deviceID: string) => boolean,
    startExperiment: (deviceID: string) => void,
    pauseExperiment: (deviceID: string) => void,
    resumeExperiment: (deviceID: string) => void,
    stopExperiment: (deviceID: string) => void,
    hasAccessToExperiment: (deviceID: string) => boolean,
}

type ExperimentHookType = {
    experiment: ExperimentType | null,
    isLoading: boolean,
    selectedLocation: DeviceLocationType | null,
    setSelectedLocation: (location: DeviceLocationType | null) => void,
    isDeviceOn: boolean,
    startExperiment: () => void,
    pauseExperiment: () => void,
    resumeExperiment: () => void,
    stopExperiment: () => void,
    hasAccess: boolean,
    isExperimentOngoing: boolean
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


// Hook to get a specific experiment
export const useExperiment = (deviceID: string): ExperimentHookType => {
    const {
        getExperiment,
        isExperimentLoading,
        getSelectedLocation,
        setSelectedLocation: setContextSelectedLocation,
        isExperimentDeviceOn,
        startExperiment: startContextExperiment,
        pauseExperiment: pauseContextExperiment,
        resumeExperiment: resumeContextExperiment,
        stopExperiment: stopContextExperiment,
        hasAccessToExperiment
    } = useExperiments();

    const experiment = getExperiment(deviceID)
    const isExperimentOngoing = React.useMemo(()=>{
        return Boolean(experiment) && experiment!.status !== "ready"
    },[experiment])

    return {
        experiment,
        isLoading: isExperimentLoading(deviceID),
        selectedLocation: getSelectedLocation(deviceID),
        setSelectedLocation: (location) => setContextSelectedLocation(deviceID, location),
        isDeviceOn: isExperimentDeviceOn(deviceID),
        startExperiment: () => startContextExperiment(deviceID),
        pauseExperiment: () => pauseContextExperiment(deviceID),
        resumeExperiment: () => resumeContextExperiment(deviceID),
        stopExperiment: () => stopContextExperiment(deviceID),
        hasAccess: hasAccessToExperiment(deviceID),
        isExperimentOngoing
    };
};


export const ExperimentProvider = ({ 
  children 
}:{children: React.ReactNode})=>{
    const [experiments, setExperiments] = React.useState<ExperimentsStateType>({});
    const [loadingState, setLoadingState] = React.useState<LoadingStateType>({});
    const [selectedLocations, setSelectedLocations] = React.useState<SelectedLocationsStateType>({});
    
    const {getProjectByID, isLoading, getProjectList, projectList} = useProjects()
    const {deviceList, getConfigurationByID, isDeviceOn} = useDevices()
    const {user} = useUser()
    const {toast} = useToast()
    const {isConnected, emit, on} = useSocket()
    const {setOptions, setOpen} = useWarningDialog()
    React.useEffect(()=>{
        if(isConnected){
            on<ExperimentType>("experiment_data", receivedData =>{
                if(!receivedData) return 
                const deviceID = receivedData.deviceID;
                setExperiment(deviceID, receivedData)

            })
    
            on<{deviceID: string, logs: LogType[]}>("update_experiment_log", payload => {
                const { deviceID, logs } = payload;
                console.log(payload)
                setExperiment(deviceID, {logs})
            });

            on<{deviceID: string, isExperimentOngoing: boolean, status: ExperimentStatus}>("experiment_status", payload => {
                const { deviceID, status } = payload;
                setExperiment(deviceID, {
                    status: status || "running"
                })
            });
            
            on<ExperimentType>("force_shutdown", receivedData => {
                console.log("Force shutdown");
                createExperiment(receivedData);
                getProjectList();
            });
        }
    }, [isConnected])

    React.useEffect(() => {
        // Set initial locations for experiments that have data but no selected location
        Object.entries(experiments).forEach(([deviceID, experimentData]) => {
            if (experimentData && !selectedLocations[deviceID]) {
                const configuration = getConfigurationByID(experimentData.deviceID, experimentData.configurationID);
                if (configuration && configuration.locations.length > 0) {
                    setSelectedLocations(prev => ({
                        ...prev,
                        [deviceID]: configuration.locations[0]
                    }));
                }
            }
        });
    }, [experiments, deviceList]);

    const isExperimentDeviceOn = React.useCallback((deviceID: string): boolean => {
        const experimentData = experiments[deviceID];
        if (!experimentData) return false;
        if (projectList.length === 0) return false;
        
        const project = getProjectByID(experimentData.projectID);
        return (project && isDeviceOn(project.device)) as boolean;
    }, [experiments, deviceList, projectList]);
    
    const hasAccessToExperiment = React.useCallback((deviceID: string): boolean => {
        const experimentData = experiments[deviceID];
        return Boolean(user) && 
               Boolean(isExperimentDeviceOn(deviceID)) && 
               (!experimentData || experimentData.userID === user!.sub);
    }, [isExperimentDeviceOn, user, experiments]);
   
    const registerProject = React.useCallback((projectID: string)=>{
        const projectData = getProjectByID(projectID)
        if(projectData){
            const configuration = getConfigurationByID(projectData.device, projectData.configuration)
            if(configuration){
                const deviceID = projectData.device;
                setExperiments(prev => ({
                    ...prev,
                    [deviceID]: {
                        userID: user!.sub,
                        deviceID,
                        dataAquisitionInterval: projectData.dataAquisitionInterval,
                        projectID,
                        duration: 0,
                        status: "ready",
                        configurationID: configuration.id,
                        locations: configuration.locations.map(l => ({
                            id: l.id,
                            data: []
                        }))
                    }
                }));
                 // Set the first location as selected
                 if (configuration.locations.length > 0) {
                    setSelectedLocations(prev => ({
                        ...prev,
                        [deviceID]: configuration.locations[0]
                    }));
                }
            }
            
        }
    },[isLoading, user])

    const startExperiment = React.useCallback((deviceID: string)=>{
        if(!isExperimentDeviceOn(deviceID)){
            toast({
                title: "Device no connected",
                description: "The device is currently not connected. Please check the connection and try again later.",
                variant: "destructive"
            })
            return 
        }
        emit("user_command", {
            command: "startExperiment", 
            params: experiments[deviceID]
        })
        updateExperimentalData(deviceID, { status: "running"})
    },[experiments, isExperimentDeviceOn])
    
    const pauseExperiment = React.useCallback((deviceID: string) => {
        emit("user_command", {
            command: "pauseExperiment",
            params: experiments[deviceID]
        });
    }, [experiments]);

    const resumeExperiment = React.useCallback((deviceID: string) => {
        emit("user_command", {
            command: "resumeExperiment",
            params: experiments[deviceID]
        });
    }, [experiments]);

    const stopExperiment = React.useCallback((deviceID: string)=>{
        const experimentData = experiments[deviceID];
        if (!experimentData) return;
        setOptions({
            title: "Stop the experiment",
            description: "Stopping the experiment is not reversible!",
            deleteFn: ()=>{
                emit("user_command", {
                    command: "stopExperiment",
                    params: {
                        deviceID
                    }
                })
                setOpen(false)
                toast({
                    title: "Experiment",
                    description: "Your experiment was successfuly stopped.",
                    variant: "default"
                })
                createExperiment(experimentData)
                getProjectList()
            }
        })
        setOpen(true)
    },[experiments])

    // Helper functions for context
    const getExperiment = (deviceID: string): ExperimentType | null => 
        experiments[deviceID] || null;
        
    const setExperiment = React.useCallback((deviceID: string, data: Partial<ExperimentType>)=>{
        setExperiments(prev => ({
            ...prev,
            [deviceID]: prev[deviceID] ? {
                ...prev[deviceID]!,
                ...data
            } : null
        }));
    },[])
    
    const isExperimentLoading = (deviceID: string): boolean => 
        loadingState[deviceID] || false;
        
    const setExperimentLoading = (deviceID: string, loading: boolean) => {
        setLoadingState(prev => ({
            ...prev,
            [deviceID]: loading
        }));
    };
    
    const getSelectedLocation = (deviceID: string): DeviceLocationType | null => 
        selectedLocations[deviceID] || null;
    
    const setSelectedLocation = (deviceID: string, location: DeviceLocationType | null) => {
        setSelectedLocations(prev => ({
            ...prev,
            [deviceID]: location
        }));
    };

    const value: ExperimentContextType = {
        experiments,
        isExperimentLoading,
        setExperimentLoading,
        getExperiment,
        setExperiment,
        registerProject,
        getSelectedLocation,
        setSelectedLocation,
        isExperimentDeviceOn,
        startExperiment,
        pauseExperiment,
        stopExperiment,
        resumeExperiment,
        hasAccessToExperiment,
    }

    if(isLoading) return <Loading/>
    return <ExperimentContext.Provider value={value}>
        <ExperimentComponent>
            {children}
        </ExperimentComponent>
    </ExperimentContext.Provider>
    
}



const ExperimentComponent = ({children}: {children: React.ReactNode})=>{
    return children
}