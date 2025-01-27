"use client"

import React, { createContext,  useContext, useTransition } from 'react';

import { useUser } from '@auth0/nextjs-auth0';
import { useToast } from '@/hooks/use-toast';
import { createProject, getProjects } from '@/actions/projects';

// Define types for the socket context
interface ProjectsContextType {
    projectList: ProjectType[] | [];
    selectedProject: ProjectType | null
    setSelectedProject: React.Dispatch<React.SetStateAction<null | ProjectType>>
    isLoading: boolean;
    registerProject: (data: ProjectType) => void
    updateProject: (data: ProjectType) => void
    deleteProject: (projectID: string) => void
}
export type ExperimentType = {
  id: string
} 

export type ProjectType = {
    id?: string 
    title: string 
    device: string
    dataAquisitionInterval: number
    experiments: ExperimentType[]
    createdAt?: string
    updatedAt?: string
}



// Create context with type
const ProjectsContext = createContext<ProjectsContextType | null>(null);

// Custom hook to use socket context with type safety
export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

export const ProjectProvider = ({ 
  children 
}:{children: React.ReactNode}) => {
    
  const [projectList, setProjectList] = React.useState<[] | ProjectType[]>([])
  const [selectedProject, setSelectedProject] = React.useState<ProjectType | null>(null)
  const [isPending, startTransition] = useTransition()
  const { isLoading } = useUser()
  const {toast} = useToast()

    React.useEffect(()=>{
        startTransition(async () => {
        const result = await getProjects("")
        if (result.error) {
            toast({
                title: "An error occured",
                description: result.error,
                variant: "destructive"
            })
        } else {
            setProjectList(result.data)
        }
        })
    },[])


    const registerProject = React.useCallback(async (data: FormData | ProjectType)=>{
        startTransition(async () => {
            const success = await createProject(data)
            if(success){
                toast({
                    title: "Project Submission",
                    description: "Your project information was successfuly submited!",
                })
            }
        })
    },[])

    const updateProject = React.useCallback(async ()=>{

    },[])

    const deleteProject = React.useCallback(async ()=>{

    },[])


  const value: ProjectsContextType = {
    projectList,
    selectedProject,
    setSelectedProject,
    isLoading: isLoading || isPending,
    registerProject,
    updateProject,
    deleteProject
  };

  return (
    <ProjectsContext.Provider value={value}>
        {children}
    </ProjectsContext.Provider>
  );
};