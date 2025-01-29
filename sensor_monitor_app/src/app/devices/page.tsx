"use client"
import React from 'react'
import WidgetCard from '../components/ui/WidgetCard'
import { DeviceConfigurationType, useDevices } from '@/contexts/devices'
import DeviceInformation, { DeviceConfigurationTabs, NoSelectedDevice } from './components/DeviceDetails'
import ConfigurationManager from './components/ConfigurationManager'
import { NextPage } from 'next'
import { ConfigurationContext, useConfigurations } from '@/hooks/use-configurations'


export interface ConfigurationContextType {
  selectedData: DeviceConfigurationType | null
  setSelectedData: React.Dispatch<React.SetStateAction<DeviceConfigurationType | null>>
  open: boolean, 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  edit: boolean, 
  setEdit: React.Dispatch<React.SetStateAction<boolean>>
}


const DevicePage: NextPage = () => {
  const {selectedDevice} = useDevices()
  const [selectedData, setSelectedData] = React.useState<DeviceConfigurationType | null>(null)
  const [open, setOpen] = React.useState(false)
  const [edit, setEdit] = React.useState(false)

  React.useEffect(()=>{
    if(!open){
      setEdit(false)
    }
  }, [open])

  React.useEffect(()=>{
    if(selectedDevice){
      setSelectedData(selectedDevice.configurations[0])
    }
  },[selectedDevice])

  const value: ConfigurationContextType = {
    selectedData,
    setSelectedData,
    open, 
    setOpen,
    edit,
    setEdit
  }

  return <ConfigurationContext.Provider value={value}>
    <WidgetCard 
      secondaryAction={
        selectedDevice && <DeviceConfigurationTabs/>
      } 
      className='w-full' 
      title={"Device Details"} 
    >
      {selectedDevice ? <>
        <DeviceInformation/>
        <ConfigurationManager 
          useContext={useConfigurations}
          channelContext="configuration"
        />
      </> : <NoSelectedDevice/>}
    </WidgetCard>
  </ConfigurationContext.Provider> 
}




export default DevicePage