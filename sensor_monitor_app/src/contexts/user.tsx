"use client"

import React, { createContext,  startTransition,  useContext, useTransition } from 'react';
import { useDevices } from './devices';
import { useToast } from '@/hooks/use-toast';
import { getUser, subscribeToDevice, updateAskToSubscribe, UserType } from '@/actions/users';
import { useUser } from '@auth0/nextjs-auth0';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deviceIconColors } from '@/app/components/DeviceWidget';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/app/components/ui/Icons';
import { ProjectProvider } from './projects';
import { ExperimentProvider } from './experiments';





// Define types for the socket context
interface UserContextType {
    user: UserType | null;   
    isLoading: boolean;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    getUserProfile: ()=>void
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
    const [open, setOpen] = React.useState(false)

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



    const isLoading = React.useMemo(()=>{
        return isFetching || auth0Loading
    },[isFetching, auth0Loading])

    const value: UserContextType = {
        user, 
        isLoading,
        open, 
        setOpen,
        getUserProfile
    }

    return <UserContext value={value}>
        <ProjectProvider>
            <ExperimentProvider>
                {children}
                {user && <SubscriptionDialog open={open} setOpen={setOpen}/>}
            </ExperimentProvider>
        </ProjectProvider>
    </UserContext>

}

const SubscriptionDialog = ({open, setOpen}: {open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>})=>{
    const {user, getUserProfile} = useUserProfile()
    const [selectedDevice, setSelectedDevice] = React.useState("")
    const [dontAsk, setDontAsk] = React.useState(false)
    const {toast} = useToast()
    const [isPending, startTransition] = useTransition()
   
    React.useEffect(()=>{
        if(!user) return 
        if(!user.askedToSubscribe) setOpen(true)
    },[user])


    
    async function handleSubmit() {
        startTransition(async () => {
            const subFunc = !dontAsk ? subscribeToDevice(user!, selectedDevice) : updateAskToSubscribe(user!)
            const response = await subFunc
            if(response.error){
                toast({
                    title: "Error",
                    description: response.error as string,
                    variant: "destructive"
                })
            }else{
                setOpen(false)
            }
            getUserProfile()
        })
        
    }

    return <ResponsiveDialog
        isOpen={open}
        setIsOpen={setOpen}
        title='Device Subscriton'
        description='We notice that you did not subscribe to any device. Please select a device from the list'
    >
        <form className='flex flex-col gap-5' action={handleSubmit}>
            <DeviceSelection
                value={selectedDevice}
                onValueChange={(val)=>setSelectedDevice(val)}
            />
            <div className='w-full flex justify-end items-center'>
                <Button >{isPending ?  <LoadingSpinner className='w-11 h-11'/> : "Submit"}</Button>
                <Button onClick={()=>{
                    setDontAsk(true)
                }} variant={"ghost"}>Don&apos;t ask again</Button>
            </div>
        </form>
    </ResponsiveDialog>
}

const DeviceSelection = ({value, onValueChange}: {value: string,onValueChange: (value: string)=> void})=>{
    const {deviceList} = useDevices()
    const {user} = useUserProfile()

    const renderedDeviceList = React.useMemo(()=> {
        return deviceList.filter(d=>!user?.deviceSubscriptions.find(ud => ud === d.id))
    },[user])

    return <Select disabled={renderedDeviceList.length === 0} onValueChange={onValueChange} required value={value}>
        <SelectTrigger>
            <SelectValue placeholder="Select device" />
        </SelectTrigger>
        <SelectContent >
            {renderedDeviceList.map(d=>{
                const colorStatus = d.status === "disconnected" ? deviceIconColors.disconnected : deviceIconColors[d.status]
                return <SelectItem key={d.id} value={d.id}>
                    <div className='flex items-center gap-2'>
                        <div style={{
                            backgroundColor: colorStatus
                        }} className='w-3 h-3 rounded-full'></div>
                        {d.name}
                    </div>
                </SelectItem>
            })}
        </SelectContent>
        {renderedDeviceList.length === 0 && <p>No available device to subscribe</p>}
    </Select>
}