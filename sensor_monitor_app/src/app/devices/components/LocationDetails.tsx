import { DeviceLocationType } from '@/contexts/devices'
import React from 'react'
import { useConfigurations } from '../page'
import { Button } from '@/components/ui/button'
import { NoLocationIlustration } from '@/components/ui/ilustrations'
import ConfigurationManager from './ConfigurationManager'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown } from 'lucide-react'


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
    throw new Error('useDevices must be used within a DevicesProvider');
  }
  return context;
};



const LocationDetails = () => {
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

        {selectedConfiguration!.locations.length === 0 ? <NoLocationSelected/>: <LocationInformation/>}
        <ConfigurationManager
            useContext={useLocations as typeof useConfigurations}
            channelContext='location'
            additionalSubmitData={{
                configurationID: selectedConfiguration!.id
            }}
        />
    </LocationContext.Provider>
    )
}


const NoLocationSelected = ()=>{
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
    return <div ref={containerRef} className='w-full h-full flex gap-4'>
        <LocationsList container={containerRef}/>
        <SelectedLocationDetails/>
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
                return <div onClick={()=>setSelectedData(l)} className={cn("w-full rounded hover:bg-indigo-950 cursor-pointer p-2",selectedData && selectedData.id === l.id ? "bg-indigo-950": "")} key={l.id}>
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

const SelectedLocationDetails = () =>{
    const {selectedData, setSelectedData, setOpen, setEdit} = useLocations()
    return <div className='w-full h-full bg-red-400'>

    </div>
}
export default LocationDetails