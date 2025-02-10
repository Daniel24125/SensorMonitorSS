"use client"

import React, { createContext,  useContext, useTransition } from 'react';
import { ProjectType, useProjects } from './projects';
import { ExperimentType, LocationChartDataType } from './experiments';
import { DeviceType, useDevices } from './devices';


// Define types for the socket context
interface ProjectContextType {
    project: ProjectType | null;   
    device: DeviceType |undefined |  null
    selectedLocation: LocationChartDataType |  null
    setSelectedLocation: React.Dispatch<React.SetStateAction<LocationChartDataType | null>>
    selectedExperiment: ExperimentType | null
    setSelectedExperiment: React.Dispatch<React.SetStateAction<ExperimentType | null>>
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjectDetails = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectDetails must be used within a ProjectsProvider');
  }
  return context;
};

export const ProjectDetailsProvider = ({ 
  children,
  projectID
}:{children: React.ReactNode, projectID: string}) =>{
    const [selectedExperiment, setSelectedExperiment] = React.useState<ExperimentType | null>(null)
    const [selectedLocation, setSelectedLocation] = React.useState<LocationChartDataType | null>(null)
    const {getProjectByID, isLoading} = useProjects()
    const {getDeviceByID} = useDevices()

    const project = React.useMemo(()=>{
        return getProjectByID(projectID)
    }, [projectID])

    const device: DeviceType |undefined |  null = React.useMemo(()=>{
        return project ? getDeviceByID(project?.device): null
    }, [projectID])

    React.useEffect(()=>{
        if(!project || !project.experiments || project.experiments?.length === 0 || selectedExperiment) return 
        const experiment = project.experiments[0]
        setSelectedLocation(experiment.locations[0])
        setSelectedExperiment(experiment)
    },[project])
    
    React.useEffect(()=>{
        if(!project || !project.experiments || project.experiments?.length === 0 || !selectedExperiment) return 
        setSelectedLocation(selectedExperiment.locations[0])
    },[selectedExperiment])

    if(!isLoading && (!project || !device)) throw Error("No project found") 
    if(isLoading) return ""
    
    const value: ProjectContextType = {
        project, 
        device,
        selectedExperiment,
        setSelectedExperiment,
        selectedLocation,
        setSelectedLocation,
    }

    return <ProjectContext value={value}>
        {children}

    </ProjectContext>
}