"use server"

import { ProjectType } from "@/contexts/projects";
import { auth0 } from "@/lib/auth0";
import { revalidatePath } from "next/cache";
import {db} from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { parseFirestoreData } from "@/lib/utils";

const collectionRef = collection(db, "projects")

const parseError = (error: typeof Error | string)=>{
    const message = error instanceof Error ? error.message : error   
    console.error("An error occured on the projects actions: ", message) 
    return {
        data: null,
        error: message
    }
}

// Define the return type interface
interface ProjectsResponse {
    data: ProjectType[] | null
    error?: string | ErrorConstructor
  }
  

type GetProjectsType = () => Promise<ProjectsResponse>

type CreateProjectType = (data: ProjectType ) => Promise<boolean | ProjectsResponse>
type EditProjectType = (data: ProjectType) => Promise<boolean | ProjectsResponse>
type DeleteProjectType = (projectID: string) => Promise<boolean | ProjectsResponse>

// let projectList: ProjectType[] = [
//     {
//         id: "3735ddca-c421-446c-b8e4-vsdsd1516sdv", 
//         title: "Monitoring the growth of micro alge pH through time",
//         experiments: [],
//         device: "3735ddca-c421-446c-b8e4-cabf408e9cc4",
//         dataAquisitionInterval: 10,
//         createdAt: new Date().toJSON()
//     }
// ]

export const getProjects: GetProjectsType = async () =>{
    
    try {
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get the projects list")  
        }

        const q = query(collectionRef, where("userID", "==", session.user.sub))
        const data = await getDocs(q)
        return {
            data: parseFirestoreData<ProjectType>(data)
        }
    } catch (error) {
        return parseError(error as typeof Error | string)
    }
  
}

export const createProject: CreateProjectType = async (data) =>{
    try{
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get the projects list")   
        }
        await addDoc(collectionRef, {
            ...data, 
            createdAt: new Date().toJSON(),
            experiments: [],
            userID: session.user.sub
        })
        revalidatePath("/") 
        return true
    } catch(error){

        return parseError(error as typeof Error | string)
    }
}

export const editProject: EditProjectType = async (project) =>{
    try{
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get the projects list")
            
        }
        const projectRef = doc(db, "projects", project.id!);
        await updateDoc(projectRef, {
            ...project,
            updatedAt: new Date().toJSON()
        });
        revalidatePath("/") 
        return true
    } catch(error){
        return parseError(error as typeof Error | string)
    }
 
}

export const deleteProject: DeleteProjectType = async (projectID) =>{
    try{
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get the projects list")
            
        }
        await deleteDoc(doc(db, "projects",projectID));
        revalidatePath("/") 
        return true
    } catch(error){
        return parseError(error as typeof Error | string)
    }
 
}