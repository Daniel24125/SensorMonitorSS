import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeviceType, PhSensorModeType, PhSensorType, useDevices } from '@/contexts/devices'
import { useSocket } from '@/contexts/socket'
import React from 'react'
import { useLocations } from './LocationDetails'
import { NoSensorIlustration } from '@/components/ui/ilustrations'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useConfigurations } from '../page'


interface SensorContextType {
    selectedData: null | PhSensorType
    setSelectedData: React.Dispatch<React.SetStateAction<null | PhSensorType>>
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    edit: boolean
    setEdit: React.Dispatch<React.SetStateAction<boolean>>
}

const SensorContext = React.createContext<SensorContextType | null>(null)

export const useSensors = (): SensorContextType => {
  const context = React.useContext(SensorContext);
  if (!context) {
    throw new Error('useSensors must be used within a LocationProvider');
  }
  return context;
};

const SensorProvider = ({children}: {children: React.ReactNode}) => {
    const [selectedData, setSelectedData] = React.useState<null | PhSensorType>(null)
    const [open, setOpen] = React.useState<boolean>(true)
    const [edit, setEdit] = React.useState<boolean>(false)
        
    const value: SensorContextType = {
        selectedData,
        setSelectedData,
        open, 
        setOpen, 
        edit, 
        setEdit
    }

  return <SensorContext.Provider value={value}>
    {children}
  </SensorContext.Provider>
}

export const SensorForm = ()=>{
    const {emit} = useSocket()
    const {open, setOpen, selectedData, edit} = useSensors()
    const {selectedData:selectedConfiguration} = useConfigurations()
    const {selectedData:selectedLocation} = useLocations()
    const {selectedDevice} = useDevices()
    const [form, setForm] = React.useState<PhSensorType>({
        mode: "acidic",
        margin: 0.1,
        maxValveTimeOpen: 30,
        targetPh: 7,
        probePort: 17,
        valvePort: 18,
        checkInterval: 10
    })

    const handleSubmit = (data: FormData)=>{
    
        emit("updateDeviceConfig", {
            deviceID: selectedDevice!.id,
            data: {
                context: "sensor",
                operation: edit ? "update" : "create",
                data: {
                    ...selectedData,
                    ...form,
                    configurationID:  selectedConfiguration!.id,
                    locationID: selectedLocation!.id,
                }
            }
        })
        setOpen(false)
    }
     const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
           setForm(prev=>{
            return {
                ...prev, 
                [e.target.id]: e.target.value
            }
           })
        }

    return <ResponsiveDialog  
        isOpen={open}
        setIsOpen={setOpen}
        title={`${edit ? "Edit the": "Register a"} sensor`}
    >
        <ScrollArea>
            <form  action={handleSubmit} className='flex flex-col gap-5 mt-5 h-[75vh]'>
                <FormInput label='Measurement Mode' description='Select the measurement mode for the pH sensor: acidic (only adjusts the pH for values > 7); alkaline (only adjusts the pH for values < 7); auto (only adjusts the pH for values below and above 7)'>
                    <Select value={form.mode} onValueChange={(value: PhSensorModeType)=>{
                        setForm(prev=>{
                            return {
                                ...prev, 
                                "mode": value
                            }
                        })
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Measurement Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="acidic">Acidic Mode</SelectItem>
                            <SelectItem value="alkaline">Alkaline Mode</SelectItem>
                            <SelectItem value="both">Auto Mode</SelectItem>
                        </SelectContent>
                    </Select>
                </FormInput>
                <FormInput label='Measurement Margin' description='The acceptance margin for the pH sensor, e.g., a margin of 0.1 with a pH target of 7.0 means that pH values of 7.0 ± 0.1 is acceptable'>
                    <Input
                        placeholder='Measurement Margin'
                        id="margin"
                        name="margin"
                        value={form.margin}
                        required
                        type='number'
                        step={0.1}
                        onChange={handleChange}
                    />
                </FormInput>
                <FormInput label='Maximum Valve Openning Time' description='The maximum amount of time the valve will be open'>
                    <Input
                        placeholder='Maximum Valve Openning Time'
                        id="maxValveTimeOpen"
                        name="maxValveTimeOpen"
                        value={form.maxValveTimeOpen}
                        required
                        type='number'
                        step={1}
                        onChange={handleChange}
                    />
                </FormInput>
                <FormInput label='Target pH'>
                    <Input
                        placeholder='Target pH'
                        id="targetPh"
                        name="targetPh"
                        value={form.targetPh}
                        required
                        type='number'
                        step={1}
                        onChange={handleChange}
                    />
                </FormInput>
                <FormInput label='pH Electrode Port'>
                    <Input
                        placeholder='pH Electrode Port'
                        id="probePort"
                        name="probePort"
                        value={form.probePort}
                        required
                        type='number'
                        step={1}
                        onChange={handleChange}
                    />
                </FormInput>
                <FormInput label='Actuation Valve Port' >
                    <Input
                        placeholder='Actuation Valve Port'
                        id="valvePort"
                        name="valvePort"
                        value={form.valvePort}
                        required
                        type='number'
                        step={1}
                        onChange={handleChange}
                    />
                </FormInput>
                <FormInput label='Check Measurment Interval' description='Period of time in which the device will compare the measured pH with the target pH'>
                    <Input
                        placeholder='Check Measurment Interval'
                        id="checkInterval"
                        name="checkInterval"
                        value={form.checkInterval}
                        required
                        type='number'
                        step={1}
                        onChange={handleChange}
                    />
                </FormInput>
                <Button>
                    Submit
                </Button>
            </form>
        </ScrollArea>
    </ResponsiveDialog>
}

type FormInputType = {
    children: React.ReactNode, 
    description?: string
    label?: string
}

const FormInput = ({children, description, label}: FormInputType)=>{
    return <div className='flex flex-col gap-2'>
        <p className='text-xs font-bold'>{label}</p>
        {children}
        <p className='text-xs text-accent'>{description}</p>
    </div>
}


export const SensorDataList = ()=>{
    const {selectedData} = useLocations()
    return  <div className='w-full h-full py-6'>
        {selectedData!.sensors.length === 0 ?<NoSensorRegistered/> :<>
            SENSOR DATA
        </> }
    </div>
}

const NoSensorRegistered = ()=>{
    const {setOpen} = useSensors()

    return <div className='w-full h-full flex justify-center items-center flex-col gap-4'>
        <NoSensorIlustration width={250}/>
        <p className='text-2xl font-bold'>You didn't register a pH sensor yet.</p>
        <Button onClick={()=>{
            setOpen(true)
        }}>Register Sensor</Button>
    </div>
}

export default SensorProvider