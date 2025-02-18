"use client"

import { NoSelectedDeviceIlustration } from "@/components/ui/ilustrations"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDevices } from "@/contexts/devices"
import React from "react";
import { useConfigurations } from '@/hooks/use-configurations';
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical, Plus, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TooltipWrapper } from "@/components/ui/tooltip";
import LocationDetails from "./LocationDetails";
import { useDeleteConfig } from "@/hooks/use-delete-config";
import SensorProvider from "./SensorDetails";

const DeviceInformation = ()=>{
  const {selectedData} = useConfigurations()

  return selectedData && <div className="flex w-full flex-col gap-5 h-full">
    <SensorProvider>
      <LocationDetails>
        <header className="w-full flex justify-between">
          <div className="flex flex-col gap-1 h-14">
            <h2 className="text-2xl font-bold">{selectedData?.name} </h2>
            {selectedData!.lastUpdatedAt && <h5 className="text-accent text-sm">Configuration last updated {new Intl.DateTimeFormat().format(new Date(selectedData!.lastUpdatedAt))}</h5>}
          </div>
          <div className="flex gap-3 items-center">
            <DeviceConfigurationTabs/>
            <ConfigurationOptions/>
          </div>
        </header>
      </LocationDetails>
    </SensorProvider>
  </div>
}

export const ConfigurationOptions = ()=>{
  const handleOpen = useDeleteConfig("configuration")
  const {setOpen, setEdit} = useConfigurations()

  return <DropdownMenu>
    <DropdownMenuTrigger>
      <TooltipWrapper title="Device configuration options">
        <Button variant="outline" size="icon">
          <MoreVertical/>
        </Button>
      </TooltipWrapper>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer" onClick={()=>{
          setOpen(true)
          setEdit(true)
        }}>
          <div className="flex items-center gap-2">
            <Edit size={13}/>
            <span>Edit</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer" onClick={()=>handleOpen()}>
          <div className="flex items-center gap-2 text-destructive">
            <Trash size={13}/>
            <span>Delete</span>
          </div>

        </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}

export const DeviceConfigurationTabs = ()=>{
  const {selectedDevice} = useDevices()
  const {setSelectedData, setOpen} = useConfigurations()


  return selectedDevice?.configurations && <>
    {selectedDevice.configurations.length > 0 && <Tabs defaultValue={selectedDevice.configurations[0].id} className="w-full justify-end flex mr-3">
      <TabsList>
        {selectedDevice.configurations.map(conf => {
          return <TabsTrigger onClick={()=>setSelectedData(conf)} key={conf.id} value={conf.id}>{conf.name}</TabsTrigger>
        })}        
      </TabsList>
    </Tabs> }
      <Button className="flex-shrink-0" size="icon" onClick={()=>setOpen(true)}>
          <Plus/>
      </Button>
  </>
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