import { DeviceLocationType, useDevices } from '@/contexts/devices'
import React from 'react'
import { useConfigurations } from '../page'
import { Button } from '@/components/ui/button'
import { NoLocationIlustration, NoLocationSelectedIlustration, NoSensorIlustration } from '@/components/ui/ilustrations'
import ConfigurationManager from './ConfigurationManager'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, Edit, PlusCircle, Trash } from 'lucide-react'
import { LoadingSpinner } from '@/app/components/ui/Icons'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDeleteConfig } from '@/hooks/use-delete-config'
import { SensorDataList, SensorForm, useSensors } from './SensorDetails'



interface LocationContextType {
    selectedData: null | DeviceLocationType
    setSelectedData: React.Dispatch<React.SetStateAction<null | DeviceLocationType>>
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    edit: boolean
    setEdit: React.Dispatch<React.SetStateAction<boolean>>
}

const LocationContext = React.createContext<LocationContextType | null>(null)

export const useLocations = (): LocationContextType => {
  const context = React.useContext(LocationContext);
  if (!context) {
    throw new Error('useLocations must be used within a LocationProvider');
  }
  return context;
};



const LocationDetails = ({children}: {children: React.ReactNode}) => {
    const [selectedData, setSelectedData] = React.useState<null | DeviceLocationType>(null)
    const [open, setOpen] = React.useState<boolean>(false)
    const [edit, setEdit] = React.useState<boolean>(false)
    const {selectedData: selectedConfiguration} = useConfigurations()
    

    const value: LocationContextType = {
        selectedData,
        setSelectedData,
        open, 
        setOpen, 
        edit, 
        setEdit
    }

    return (<LocationContext.Provider value={value}>
        {children}
        {selectedConfiguration!.locations.length === 0 ? <NoLocation/>: <LocationInformation/>}
        <ConfigurationManager
            useContext={useLocations as typeof useConfigurations}
            channelContext='location'
            additionalSubmitData={{
                configurationID: selectedConfiguration!.id,
                locationID: selectedData ? selectedData.id : undefined
            }}
        />
    </LocationContext.Provider>
    )
}


const NoLocation = ()=>{
    const {setOpen, setEdit} = useLocations()

    return <div className='w-full h-full flex flex-col gap-4 items-center justify-center'>
        <h2 className='text-3xl font-bold'>No Locations Yet!</h2>
        <h4>Add your first measurement location</h4>
        <Button onClick={()=>{
            setOpen(true)
            setEdit(false)
        }}>Add Location</Button>
        <NoLocationIlustration width={250}/>
    </div>
}

const LocationInformation = ()=>{
    const containerRef = React.useRef<HTMLDivElement>(null)
    const {selectedData} = useLocations()

    return <div ref={containerRef} className='w-full h-full flex gap-4 relative'>
        <div className={cn('w-full h-full flex justify-center items-center absolute top-0 bg-secondary-background z-10', containerRef.current ? " animate-fadeout": "")}>
            <LoadingSpinner className='w-12 h-12 text-primary'/>
        </div>
        <LocationsList container={containerRef}/>
        {selectedData ? <SelectedLocationDetails/>: <NoLocationSelected/> }
 
    </div>
}

const LocationsList = ({container}:{container: React.RefObject<HTMLDivElement | null>})=>{
    const {selectedData, setSelectedData, setOpen, setEdit} = useLocations()
    const {selectedData: selectedConfiguration} = useConfigurations()
    const scrollRef = React.useRef<HTMLDivElement>(null)
    
    const handleScroll = () => {
        if (scrollRef.current) {
            // Find the inner scrollable div
            const scrollableDiv = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
            if (scrollableDiv) {
                // OR
                scrollableDiv.scrollBy({
                    top: 56, // scroll down by 56 pixels
                    behavior: "smooth"
                });
            }
        }
    }
    return <div style={{
        height: container.current ? container.current.offsetHeight : 0
    }} className='w-64 rounded-xl border border-muted flex flex-col gap-4 p-4 flex-shrink-0'>
        <p className='text-sm font-bold'>Available Locations</p>
        <Button onClick={()=>{
            setOpen(true)
            setEdit(false)
        }} variant="outline">Add Location</Button>

        <ScrollArea ref={scrollRef}   className='h-full'>
            {selectedConfiguration!.locations.map((l)=>{
                return <div onClick={()=>setSelectedData(l)} className={cn("w-full rounded hover:bg-emerald-950 cursor-pointer p-2",selectedData && selectedData.id === l.id ? "bg-emerald-950": "")} key={l.id}>
                    <p>{l.name}</p>
                    <p className='text-xs text-accent'>{l.sensors.length} sensors registered</p>
                </div>
            })}
        </ScrollArea>

        <Button className='hover:bg-transparent hover:text-primary' onClick={handleScroll} variant="ghost">
            <ChevronDown/>
        </Button>
    </div>
}

const NoLocationSelected = ()=>{
    return <div className='w-full h-full flex justify-center items-center flex-col gap-4'>
        <NoLocationSelectedIlustration width={250}/>
        <h2 className='text-2xl font-bold'>No Location Selected</h2>
    </div>
}

const SelectedLocationDetails = () =>{
    const {selectedData,  setOpen, setEdit} = useLocations()
    const {setOpen: setOpenSensorForm, setEdit: setEditSensor} = useSensors()
    const handleOpen = useDeleteConfig("location")
    
   

    return <div className='w-full h-full flex flex-col'>
        <header className='w-full flex justify-between items-center'>
            <div>
                <p className='text-xl'>{selectedData?.name}</p>
                <h6 className='text-xs text-accent'>{selectedData?.id}</h6>
            </div>
            <div className='flex gap-2'>
                <TooltipWrapper title="Add Sensor">
                    <Button onClick={()=>{
                        setOpenSensorForm(true)
                        setEditSensor(false)
                    }} size="icon" variant="ghost">
                        <PlusCircle/>
                    </Button>
                </TooltipWrapper>
                <TooltipWrapper title="Edit Location">
                    <Button onClick={()=>{
                        setOpen(true)
                        setEdit(true)
                    }} size="icon" variant="ghost">
                        <Edit/>
                    </Button>
                </TooltipWrapper>
                <TooltipWrapper title="Delete Location">
                    <Button onClick={handleOpen} className='text-destructive' size="icon" variant="ghost">
                        <Trash/>
                    </Button>
                </TooltipWrapper>
            </div>
        </header>
        <SensorDataList/>
        <SensorForm/>
    </div>
}

export default LocationDetails