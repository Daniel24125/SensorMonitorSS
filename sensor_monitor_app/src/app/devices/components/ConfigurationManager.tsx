"use client"

import { Button } from '@/components/ui/button'
import { useSocket } from '@/contexts/socket'
import React from 'react'
import { useDevices } from '@/contexts/devices';
import { Input } from '@/components/ui/input';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { useConfigurations } from '@/hooks/use-configurations';

type UpperLevelDataManagerProps = {
    useContext: typeof useConfigurations
    channelContext: "configuration" | "location" | "device" ,
    additionalSubmitData?: {
        configurationID?: string, 
        locationID?: string, 
        sensorID?: string, 
    }
}


const ConfigurationManager = ({useContext, channelContext, additionalSubmitData}: UpperLevelDataManagerProps) => {
    const {emit} = useSocket()
    const {selectedDevice} = useDevices()
    const {open, setOpen, selectedData, edit} = useContext()
    const ref = React.useRef<HTMLFormElement>(null)
    const [name, setName] = React.useState(edit? selectedData!.name : "")

    React.useEffect(()=>{
        if(edit){
            setName(selectedData!.name)
        }else{
            setName("")
        }
    },[edit])

    const handleSubmit = (data: FormData)=>{
    
        emit("updateDeviceConfig", {
            deviceID: selectedDevice!.id,
            data: {
                context: channelContext,
                operation: edit ? "update" : "create",
                data: {
                    ...selectedData,
                    ...additionalSubmitData,
                    name: data.get("name"),
                }
            }
        })
        setOpen(false)
        setName("")
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setName(e.target.value)
    }

    return (
        <ResponsiveDialog
            isOpen={open}
            setIsOpen={setOpen}
            title={`${edit ? "Edit the": "Register a"} ${channelContext}`}
        >
            <form ref={ref} action={handleSubmit} className='flex flex-col gap-5'>
                <Input
                    placeholder='Name'
                    id="name"
                    name="name"
                    value={name}
                    required
                    onChange={handleChange}
                />
                <Button>
                    Submit
                </Button>
            </form>
        </ResponsiveDialog>
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