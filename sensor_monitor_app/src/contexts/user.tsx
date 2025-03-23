"use client"

import React, { createContext,  startTransition,  useContext } from 'react';
import { ProjectType, useProjects } from './projects';
import { ExperimentType, LocationChartDataType } from './experiments';
import { DeviceType, useDevices } from './devices';
import { deleteExperiment } from '@/actions/experiments';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getUser, UserType } from '@/actions/users';
import { useUser } from '@auth0/nextjs-auth0';





// Define types for the socket context
interface UserContextType {
    user: UserType | null;   
    isLoading: boolean
}

const UserContext = createContext<UserContextType | null>(null);

export const useUserProfile = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a ProjectsProvider');
  }
  return context;
};

export const UserProfileProvider = ({ 
  children
}:{children: React.ReactNode}) =>{
    const { isLoading: auth0Loading } = useUser()
    const [user, setUser] = React.useState<UserType | null>(null)
    const {toast} = useToast()
    const [isFetching, setIsFetching] = React.useState(true)

      React.useEffect(()=>{
        getUserProfile()
      },[])

    const getUserProfile = React.useCallback(async ()=>{
       startTransition(async () => {
         const result = await getUser()
         if (result.error) {
           toast({
               title: "An error occured",
               description: result.error as string,
               variant: "destructive"
           })
         } else {
           setUser(result.data ? result.data : null)
           
         }
         setIsFetching(false)
       })
     }, [])

     console.log(user)
    const isLoading = React.useMemo(()=>{
        return isFetching || auth0Loading
    },[isFetching, auth0Loading])

    const value: UserContextType = {
        user, 
        isLoading
    }

    return <UserContext value={value}>
        {children}

    </UserContext>
}