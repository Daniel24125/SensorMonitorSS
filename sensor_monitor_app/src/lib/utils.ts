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

