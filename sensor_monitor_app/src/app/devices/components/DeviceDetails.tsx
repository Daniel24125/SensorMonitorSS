"use client"

import { NoSelectedDeviceIlustration } from "@/components/ui/ilustrations"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDevices } from "@/contexts/devices"
import React from "react";
import { useConfigurations } from "../page";


const DeviceInformation = ()=>{
  return "HELLO"
}

export const DeviceConfigurationTabs = ()=>{
  const {selectedDevice} = useDevices()
  const {setSelectedConfiguration} = useConfigurations()
  
  console.log(selectedDevice)
  return selectedDevice?.configurations && <Tabs defaultValue={selectedDevice.configurations[0].id} className="w-full justify-end flex">
  <TabsList>
    {selectedDevice.configurations.map(conf => {
      return <TabsTrigger onClick={()=>setSelectedConfiguration(conf)} key={conf.id} value={conf.id}>{conf.name}</TabsTrigger>
    })}
    
  </TabsList>
</Tabs>
}

export const NoSelectedDevice = ()=>{
  return <div className='flex items-center justify-center flex-col gap-3 w-full h-full'>
    <h2 className='text-3xl font-bold'>No device was selected yet</h2>
    <h4 className='text-xl'>Please select a device from the device list</h4>
    <h6>The selected device information will appear here.</h6>
    <NoSelectedDeviceIlustration width={300}/>
  </div>
}
  export default DeviceInformation