"use client"
import React from 'react'
import WidgetCard from '../components/ui/WidgetCard'
import { DeviceConfigurationType, useDevices } from '@/contexts/devices'
import DeviceInformation, { DeviceConfigurationTabs, NoSelectedDevice } from './components/DeviceDetails'


interface ConfigurationContextType {
  selectedConfiguration: DeviceConfigurationType | null
  setSelectedConfiguration: React.Dispatch<React.SetStateAction<DeviceConfigurationType | null>>
}

const ConfigurationContext = React.createContext<ConfigurationContextType | null>(null)


// Custom hook to use socket context with type safety
export const useConfigurations = (): ConfigurationContextType => {
const context = React.useContext(ConfigurationContext);
if (!context) {
  throw new Error('useDevices must be used within a DevicesProvider');
}
return context;
};


const DevicePage = () => {
  const {selectedDevice, deviceList} = useDevices()
  const [selectedConfiguration, setSelectedConfiguration] = React.useState<null | DeviceConfigurationType>(null)
  
  React.useEffect(()=>{
    
  },[deviceList])

  const value: ConfigurationContextType = {
    selectedConfiguration,
    setSelectedConfiguration,
}

  return <ConfigurationContext.Provider value={value}>
    <WidgetCard secondaryAction={
      selectedDevice && <DeviceConfigurationTabs/>
    } className='w-full ml-5' title={"Device Details"} >
      {selectedDevice ? <DeviceInformation/> : <NoSelectedDevice/>}
    </WidgetCard>
  </ConfigurationContext.Provider> 
}




export default DevicePage