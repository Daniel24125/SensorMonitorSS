import { clsx, type ClassValue } from "clsx"
import { QuerySnapshot } from "firebase/firestore"
import { twMerge } from "tailwind-merge"

type ParseFirestoreDataType = <T>(data: QuerySnapshot) => T[]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseFirestoreData: ParseFirestoreDataType = <T>(data: QuerySnapshot): T[] => data.docs.map(d=>{
  return {
    id: d.id, 
    ...d.data()
  } as T
})

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const parseError = (error: typeof Error | string)=>{
    const message = error instanceof Error ? error.message : error   
    console.error("An error occured on the projects actions: ", message) 
    return {
        data: null,
        error: message
    }
}

export const getformatedExperimentTime: (duration: number, showSeconds?:boolean)=>string = (duration, showSeconds=true)=>{
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const secs = duration % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${showSeconds ? `:${secs.toString().padStart(2, '0')}`: ""}`;
}