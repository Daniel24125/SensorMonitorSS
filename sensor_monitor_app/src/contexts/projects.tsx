"use client"

import React, { createContext,  useContext, useTransition } from 'react';

import { useUser } from '@auth0/nextjs-auth0';
import { useToast } from '@/hooks/use-toast';
import { createProject, deleteProject, editProject, getProjects } from '@/actions/projects';
import ProjectForm from '@/app/components/projects/ProjectForm';
import { useWarningDialog } from './warning';

// Define types for the socket context
interface ProjectsContextType {
    projectList: ProjectType[] | [];
    selectedProject: ProjectType | null
    setSelectedProject: React.Dispatch<React.SetStateAction<null | ProjectType>>
    isLoading: boolean;
    handleProjectRegistration: (data: ProjectType) => void
    handleUpdateProject: (data: ProjectType) => void
    handleDeleteProject: (projectID: string) => void
    open: boolean, 
    edit: boolean, 
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    setEdit: React.Dispatch<React.SetStateAction<boolean>>

}
export type ExperimentType = {
  id: string,
  projectID: string, 
  userID: string,
  createdAt: string, 
  updatedAt?: string 

} 

export type ProjectType = {
    id?: string 
    title: string 
    device: string
    dataAquisitionInterval: number
    experiments?: ExperimentType[]
    createdAt?: string
    updatedAt?: string
    userID?: string
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
  const [open, setOpen] = React.useState<boolean>(false)
  const [edit, setEdit] = React.useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const { isLoading } = useUser()
  const {toast} = useToast()
  const {setOpen: setOpenWarning} = useWarningDialog()

  React.useEffect(()=>{
    getProjectList()
  },[])

  const getProjectList = React.useCallback(async ()=>{
    startTransition(async () => {
      const result = await getProjects()
      if (result.error) {
          toast({
              title: "An error occured",
              description: result.error as string,
              variant: "destructive"
          })
      } else {
          setProjectList(result.data ? result.data : [])
          if(result.data && !selectedProject){
            setSelectedProject(result.data[0])
          }
      }
      })
  }, [])

  const handleProjectRegistration = React.useCallback(async (data: ProjectType)=>{
      startTransition(async () => {
          const success = await createProject(data)
          if(success){
              toast({
                  title: "Project Submission",
                  description: "Your project information was successfuly submited!",
              })
              setOpen(false)
          }
          getProjectList()
      })
  },[])

  const handleUpdateProject = React.useCallback(async (data: ProjectType)=>{
    startTransition(async () => {
      const success = await editProject(data)
      if(success){
          toast({
              title: "Project Submission",
              description: "Your project information was successfuly updated!",
          })
          getProjectList()
          setOpen(false)
        }
      })
  },[])

  const handleDeleteProject = React.useCallback(async (projectID: string)=>{
      const isSussess = await deleteProject(projectID)
      if(isSussess){
          setOpenWarning(false)
           toast({
              title: "Project Deletion",
              description: "Your project was successfuly deleted!",
          })
      }
  
    getProjectList()
  },[])


  const value: ProjectsContextType = {
    projectList,
    selectedProject,
    setSelectedProject,
    isLoading: isLoading || isPending,
    handleProjectRegistration,
    handleUpdateProject,
    handleDeleteProject,
    open,
    setOpen,
    edit,
    setEdit
  };

  return (
    <ProjectsContext.Provider value={value}>
        {children}
        <ProjectForm/>
    </ProjectsContext.Provider>
  );
};