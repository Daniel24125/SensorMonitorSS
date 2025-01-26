import { useLocations } from "@/app/devices/components/LocationDetails"
import { useConfigurations } from "@/app/devices/page"
import { useDevices } from "@/contexts/devices"
import { useSocket } from "@/contexts/socket"
import { useWarningDialog } from "@/contexts/warning"
import React from "react"

type DeleteConfigProps = "device" | "configuration" | "location" | "sensor" 

export const useDeleteConfig = (context: DeleteConfigProps)=>{
    const {emit} = useSocket()
    const {selectedDevice} = useDevices()
    const {setOpen: setWarningOpen, setOptions, open} =  useWarningDialog()
    const {selectedData: selectedConfiguration} = useConfigurations()
    const {selectedData: selectedLocation} = useLocations()

    React.useEffect(()=>{
        if(open){
            setOptions({
                title: "Delete " + context,
                deleteFn: ()=>{
                    emit("updateDeviceConfig", {
                        deviceID: selectedDevice!.id,
                        data: {
                            context,
                            operation: "delete",
                            data: {
                                configurationID: selectedConfiguration!.id,
                                locationID: context !== "configuration" ? selectedLocation!.id : undefined,
                                sensorID: context === "sensor" ? "": undefined
                            }
                        }
    
                    })
                    setWarningOpen(false)
                }
            })
        }
    },[open])

    return setWarningOpen
}   