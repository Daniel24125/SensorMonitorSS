"use server"

import {db} from '@/lib/firebase';
import { collection, getDocs, query, where } from "firebase/firestore";
import { ActionResponse } from './projects';
import { auth0 } from "@/lib/auth0";
import { parseError, parseFirestoreData } from '@/lib/utils';

interface Auth0UserProfile {
    email?: string;
    email_verified?: boolean;
    name?: string;
    nickname?: string;
    picture?: string;
    sub?: string;
    updated_at?: string;
    [key: string]: any;
}


interface UserSubscriptions{
    deviceSubscriptions: string[]
}

export interface UserType  extends Auth0UserProfile, UserSubscriptions{}

const collectionRef = collection(db, "users")


type GetUserType = () => Promise<ActionResponse<UserType>>


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