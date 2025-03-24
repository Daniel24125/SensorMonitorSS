"use server"

import {db} from '@/lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc} from "firebase/firestore";
import { ActionResponse } from './projects';
import { auth0 } from "@/lib/auth0";
import { ErrorType, parseError, parseFirestoreData } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

interface Auth0UserProfile {
    email?: string;
    email_verified?: boolean;
    name?: string;
    nickname?: string;
    picture?: string;
    sub?: string;
    updated_at?: string;
    [key: string]: unknown;
}


interface UserSubscriptions{
    id: string;
    deviceSubscriptions: string[]; 
    askedToSubscribe: boolean;
}

export interface UserType  extends Auth0UserProfile, UserSubscriptions{}

const collectionRef = collection(db, "users")


type GetUserType = () => Promise<ActionResponse<UserType>>
type SubscribeToDeviceType = (user: UserType, deviceID: string) => Promise<ActionResponse<void | ErrorType>>
type UpdateAskToSubscribeType = (user: UserType) => Promise<ActionResponse<void | ErrorType>>


export const getUser: GetUserType = async ()=>{
    try {
        const session = await auth0.getSession()
        if(!session){
            throw new Error("You must be logged in to get the experiments list")  
        }
        const q = query(collectionRef, where("user_id", "==", session.user.sub))
        const data = await getDocs(q)
        return {
            data: {
                ...parseFirestoreData<UserType>(data)[0],
                ...session.user
            }
        }
    } catch (error) {
        return parseError(error as typeof Error | string)
    }    
}

export const subscribeToDevice: SubscribeToDeviceType = async (user, deviceID)=>{
    try {
        const session = await auth0.getSession()
        if(!session){
            throw new Error("You must be logged in to get the experiments list")  
        }
        if(!deviceID){
            throw new Error("Please make sure you fill all the required fields")  
        }
        const userRef = doc(db, "users", user.id);
        
        await updateDoc(userRef, {
            askedToSubscribe: true,
            deviceSubscriptions: [...user.deviceSubscriptions, deviceID]
         });
        revalidatePath("/") 
        
        return { data: undefined, error: null };
    } catch (error) {
        return parseError(error as typeof Error | string)
    }    
}

export const updateAskToSubscribe: UpdateAskToSubscribeType = async (user)=>{
    try {
        const session = await auth0.getSession()
        if(!session){
            throw new Error("You must be logged in to get the experiments list")  
        }
        const userRef = doc(db, "users", user.id);

        await updateDoc(userRef, {
            askedToSubscribe: true,
         });
        
        return { data: undefined, error: null };
    } catch (error) {
        return parseError(error as typeof Error | string)
    }    
}