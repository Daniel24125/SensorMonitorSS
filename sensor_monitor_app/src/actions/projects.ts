"use server"

import { ProjectType } from "@/contexts/projects";

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }



type GetProjectType = (userID: string) => Promise<{
    data: ProjectType[], 
    error: boolean
}>
type CreateProjectType = (data: FormData | ProjectType ) => Promise<boolean>
type EditProjectType = (data: ProjectType) => Promise<boolean>
type DeleteProjectType = (projectID: string) => Promise<boolean>

const projectList: ProjectType[] = [
    {
        id: "powengfvpiwenfg", 
        title: "Monitoring the growth of micro alge pH through time",
        experiments: [],
        device: "dojvfnbowejdvn",
        dataAquisitionInterval: 10,
        createdAt: new Date().toJSON()
    }
]

export const getProjects: GetProjectType = async (userID) =>{
    await delay(1000)
    console.log(projectList)
    return {
        data: projectList, 
        error: false
    }
}

export const createProject: CreateProjectType = async (data) =>{
    await delay(3000)
    console.log(data)
    projectList.push(data as ProjectType)
    return true
}

export const editProject: EditProjectType = async (data) =>{
    return new Promise((resolve, reject)=>{
        const index = projectList.findIndex(p =>p.id === data.id)
        projectList[index] = data
        resolve(true)
    })
}

export const deleteProject: DeleteProjectType = async (projectID) =>{
    return new Promise((resolve, reject)=>{
        const index = projectList.findIndex(p =>p.id === projectID)
        
        resolve(true)
    })
}