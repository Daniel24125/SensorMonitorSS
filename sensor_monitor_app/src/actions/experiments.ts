"use server"

import {db} from '@/lib/firebase';
import { parseError, parseFirestoreData } from '@/lib/utils';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth0 } from "@/lib/auth0";
import { ActionResponse } from './projects';
import { ExperimentType } from '@/contexts/experiments';
import { revalidatePath } from 'next/cache';

const collectionRef = collection(db, "experiments")


type GetExperimentsType = (projectID: string) => Promise<ActionResponse<ExperimentType[]>>
type GetExperimentByIDType = (experimentID: string) => Promise<ActionResponse<ExperimentType>>
type CreateExperimentType = (data: ExperimentType ) => Promise<boolean | ActionResponse<ExperimentType>>
type DeleteExperimentType = (experimentID: string) => Promise<boolean | ActionResponse<ExperimentType>>

export const getExperiments: GetExperimentsType = async (projectID) =>{
    
    try {
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get the experiments list")  
        }

        const q = query(collectionRef, where("userID", "==", session.user.sub), where("projectID", "==", projectID))
        const data = await getDocs(q)
        return {
            data: parseFirestoreData<ExperimentType>(data)
        }
    } catch (error) {
        return parseError(error as typeof Error | string)
    }
  
}


export const getExperimentByID: GetExperimentByIDType = async (experimentID) =>{
    
    try {
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to get the experiments list")  
        }
        const data = await getDoc(doc(db, "experiments",experimentID))
        return {data:{
            id: data.id, 
            ...data.data() as ExperimentType
        }}
    } catch (error) {
        return parseError(error as typeof Error | string)
    }
  
}

export const createExperiment: CreateExperimentType = async (data) =>{
    try{
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to create an experiment")   
        }
        // await addDoc(collectionRef, data)
        revalidatePath("/") 
        return true
    } catch(error){
        return parseError(error as typeof Error | string)
    }
}

export const deleteExperiment: DeleteExperimentType = async (experimentID) =>{
    try{
        const session = await auth0.getSession()
        if(!session){
           throw new Error("You must be logged in to delete an experiment")
            
        }
        await deleteDoc(doc(db, "experiments",experimentID));
        revalidatePath("/") 
        return true
    } catch(error){
        return parseError(error as typeof Error | string)
    }
 
}