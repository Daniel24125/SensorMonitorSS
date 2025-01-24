"use client"

import { Button } from '@/components/ui/button'
import { useSocket } from '@/contexts/socket'
import React from 'react'
import { v4 } from "uuid";
import { Plus } from "lucide-react";
import { TooltipWrapper } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DeviceConfigurationType, useDevices } from '@/contexts/devices';
import { Input } from '@/components/ui/input';

type ConfigurationManagerProps= {
    children: React.ReactNode,
    editConfiguration?: null | DeviceConfigurationType
}


const ConfigurationManager = ({children, editConfiguration}: ConfigurationManagerProps) => {
    const {emit} = useSocket()
    const {selectedDevice} = useDevices()
    
    const handleSubmit = (data: FormData)=>{
        emit("updateDeviceConfig", {
            deviceID: selectedDevice?.id,
            data: {
                context: "configuration",
                operation: "create",
                data: {
                    id: v4(),
                    name: data.get("name"), 
                    createdAt: new Date().toJSON(),
                    locations: []
                }
            }
        })
    }

    return (
        <Dialog>
            <DialogTrigger>
                <TooltipWrapper title="Add configuration">
                    {children}
                </TooltipWrapper>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editConfiguration ? "Edit device configuration": "Register a new device configuration"}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className='flex flex-col gap-5'>
                    <Input
                        placeholder='Configuration Name'
                        id="name"
                        name="name"
                        required
                    />
                    <Button>
                        Submit
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// {
//     id: "ibugeiuebrg",
//     name: "odwsnfvowerkinvow", 
//     createdAt: new Date().toJSON(),
//     sensors: [
//         {
//             'id': "ehbvgihweribj",
//             'mode': "acidic",
//             'margin': 0.1,
//             'maxValveTimeOpen': 10,
//             'targetPh': 10.0,
//             'probePort': 17,
//             'checkInterval': 10,
//             'createdAt':  new Date().toJSON()
//         }
//     ]
// }


export default ConfigurationManager