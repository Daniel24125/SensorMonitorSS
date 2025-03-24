"use server"

import { ProjectType } from "@/contexts/projects";
import { auth0 } from "@/lib/auth0";
import { revalidatePath } from "next/cache";
import {db} from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { parseError, parseFirestoreData } from "@/lib/utils";
import { getExperiments } from "./experiments";

const collectionRef = collection(db, "projects")



// Define the return type interface
export interface ActionResponse<T> {
    data: T | null
    error?: string | ErrorConstructor | null
}
  

type GetProjectsType = () => Promise<ActionResponse<ProjectType[]>>
type CreateProjectType = (data: ProjectType ) => Promise<boolean | ActionResponse<ProjectType>>
type EditProjectType = (data: ProjectType) => Promise<boolean | ActionResponse<ProjectType>>
type DeleteProjectType = (projectID: string) => Promise<boolean | ActionResponse<ProjectType>>

export const getProjects: GetProjectsType = async () =>{
    
    try {
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get the projects list")  
        }

        const q = query(collectionRef, where("userID", "==", session.user.sub))
        const data = await getDocs(q)
        const parsedData = parseFirestoreData<ProjectType>(data)

        for (const i in parsedData){
            const p = parsedData[i]
            const {data: experiments} = await getExperiments(p.id!)
            if(!experiments){
                throw Error("It was not possible to fetch the experiments for this project")
            }
            parsedData[i] = {
                ...p, 
                experiments
            }
        }
      
        return {data: parsedData}

    } catch (error) {
        return parseError(error as typeof Error | string)
    }
  
}

export const createProject: CreateProjectType = async (data) =>{
    try{
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get create a project")   
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
           throw new Error("You must be logged in to edit a project")
            
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
           throw new Error("You must be logged in to delete a project")
            
        }
        await deleteDoc(doc(db, "projects",projectID));
        revalidatePath("/") 
        return true
    } catch(error){
        return parseError(error as typeof Error | string)
    }
 
}