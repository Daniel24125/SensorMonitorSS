import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjectDetails } from '@/contexts/projectDetails'
import React from 'react'

const LocationSelection = () => {
    const {project, selectedLocation, selectedExperiment, device, setSelectedLocation} = useProjectDetails()

    const configuration = React.useMemo(()=>{
        return device?.configurations.find(c=>c.id === project!.configuration)
    },[project])

    return <Select value={selectedLocation!.id} onValueChange={value=>{
        const locationData = selectedExperiment?.locations.find(l=>l.id === value)
        setSelectedLocation(locationData!)
    }}>
    <SelectTrigger  className="bg-[#8C7AE6] bg-opacity-10 text-[#8C7AE6] border-none rounded-full">
      <SelectValue placeholder="Select a location" />
    </SelectTrigger>
    <SelectContent>
        {selectedExperiment!.locations.map(l=>{
            const locationData = configuration?.locations.find(loc=>loc.id === l.id)
            return <SelectItem key={l.id} value={l.id}>{locationData?.name}</SelectItem>
        })}
      
    </SelectContent>
  </Select>
}

export default LocationSelection