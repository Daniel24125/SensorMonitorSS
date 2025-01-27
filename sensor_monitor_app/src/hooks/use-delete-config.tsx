import { useLocations } from "@/app/devices/components/LocationDetails"
import { useSensors } from "@/app/devices/components/SensorDetails"
import { useDevices } from "@/contexts/devices"
import { useSocket } from "@/contexts/socket"
import { useWarningDialog } from "@/contexts/warning"
import React from "react"
import { useConfigurations } from "./use-configurations"

type DeleteConfigProps = "device" | "configuration" | "location" | "sensor" 

export const useDeleteConfig = (context: DeleteConfigProps)=>{
    const {emit} = useSocket()
    const {selectedDevice} = useDevices()
    const {setOpen: setWarningOpen, setOptions} =  useWarningDialog()
    const {selectedData: selectedConfiguration} = useConfigurations()
    const {selectedData: selectedLocation} = useLocations()
    const {selectedData: selectedSensor} = useSensors()

    const handleOpen = React.useCallback(() => {
        setOptions({
            title: "Delete " + context,
            deleteFn: () => {
                emit("updateDeviceConfig", {
                    deviceID: selectedDevice!.id,
                    data: {
                        context,
                        operation: "delete",
                        data: {
                            configurationID: selectedConfiguration!.id,
                            locationID: context !== "configuration" ? selectedLocation!.id : undefined,
                            sensorID: context === "sensor" ? selectedSensor!.id: undefined
                        }
                    }
                })
                setWarningOpen(false)
            }
        })
        setWarningOpen(true)
    }, [
        context, 
        emit, 
        selectedDevice, 
        selectedConfiguration, 
        selectedLocation, 
        selectedSensor, 
        setOptions, 
        setWarningOpen
    ])

    return handleOpen
}   