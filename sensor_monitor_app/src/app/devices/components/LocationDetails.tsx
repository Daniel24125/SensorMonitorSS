import { DeviceLocationType } from '@/contexts/devices'
import React from 'react'
import { useConfigurations } from '../page'
import { Button } from '@/components/ui/button'
import { NoLocationIlustration } from '@/components/ui/ilustrations'


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
    return "LOCATION INFORMATION"
}
export default LocationDetails