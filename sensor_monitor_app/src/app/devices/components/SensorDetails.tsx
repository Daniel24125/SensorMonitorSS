import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DevicePortType, PhSensorModeType, PhSensorType, useDevices } from '@/contexts/devices'
import { useSocket } from '@/contexts/socket'
import React from 'react'
import { useLocations } from './LocationDetails'
import { NoSensorIlustration } from '@/components/ui/ilustrations'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useConfigurations } from '@/hooks/use-configurations';
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronsUpDown, CircleFadingArrowUp, Clock2, Edit, MoreVertical, Plug2, Repeat, ShieldCheck, Trash } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDeleteConfig } from '@/hooks/use-delete-config'
import moment from 'moment';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'


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
    const [open, setOpen] = React.useState<boolean>(false)
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

const defaultSensorData: PhSensorType = {
    mode: "acidic",
    margin: 0.1,
    maxValveTimeOpen: 30,
    targetPh: 7,
    phMonitorFrequency: 2,
    devicePort: "i1",
    checkInterval: 10
}

export const SensorForm = ()=>{
    const {emit} = useSocket()
    const {open, setOpen, selectedData, edit} = useSensors()
    const {selectedData:selectedConfiguration} = useConfigurations()
    const {selectedData:selectedLocation} = useLocations()
    const {selectedDevice} = useDevices()

    const [form, setForm] = React.useState<PhSensorType>(defaultSensorData)

    React.useEffect(()=>{
        if(edit){
            setForm(selectedData!)
        }else{
            setForm(defaultSensorData)
        }
    },[edit])

    const handleSubmit = ()=>{
    
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
                    sensorID: edit ? selectedData?.id : undefined
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
        <form  action={handleSubmit} className='mt-5 '>
            <ScrollArea>
                <div className='flex flex-col gap-5 h-[clamp(300px,75vh,500px)]'>
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
                                <SelectItem value="auto">Auto Mode</SelectItem>
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
                    <FormInput label='pH Monitor Frequency' description='The period of time to check if the pH is near the target pH value'>
                        <Input
                            placeholder='pH Monitor Frequency'
                            id="phMonitorFrequency"
                            name="phMonitorFrequency"
                            value={form.phMonitorFrequency}
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
                            step={0.1}
                            onChange={handleChange}
                        />
                    </FormInput>
                    
                    <FormInput label='Device Port' description='Select the device port'>
                        <Select value={form.devicePort} onValueChange={(value: DevicePortType)=>{
                            setForm(prev=>{
                                return {
                                    ...prev, 
                                    "devicePort": value
                                }
                            })
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Device Port" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="i1">Port 1 </SelectItem>
                                <SelectItem value="i2">Port 2 </SelectItem>
                                <SelectItem value="i3">Port 3 </SelectItem>
                                <SelectItem value="i4">Port 4 </SelectItem>
                                <SelectItem value="i5">Port 5 </SelectItem>
                                <SelectItem value="i6">Port 6 </SelectItem>
                                <SelectItem value="i7">Port 7 </SelectItem>
                                <SelectItem value="i8">Port 8 </SelectItem>
                                <SelectItem value="i9">Port 9 </SelectItem>
                                <SelectItem value="i10">Port 10 </SelectItem>
                                <SelectItem value="i11">Port 11 </SelectItem>
                                <SelectItem value="i12">Port 12 </SelectItem>
                            </SelectContent>
                        </Select>
                    </FormInput>
                    {/* <FormInput label='Check Measurment Interval' description='Period of time in which the device will compare the measured pH with the target pH'>
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
                    </FormInput> */}
                </div>
            </ScrollArea>
            <Button className='w-full mt-5'>
                Submit
            </Button>
        </form>
    </ResponsiveDialog>
}

type FormInputType = {
    children: React.ReactNode, 
    description?: string
    label?: string
}

export const FormInput = ({children, description, label}: FormInputType)=>{
    return <div className='flex flex-col gap-2'>
        <p className='text-xs font-bold'>{label}</p>
        {children}
        <p className='text-xs text-accent'>{description}</p>
    </div>
}


export const SensorDataList = ()=>{
    const {selectedData} = useLocations()
    
    return  <div className='w-full h-full pt-6'>
        {selectedData!.sensors.length === 0 ?<NoSensorRegistered/> :<>
            {selectedData?.sensors.length === 1 ? <SingleSensorTemplate/> : <MultipleSensorTemplate/>}
        </> }
    </div>
}

const SingleSensorTemplate = ({sensorData}: {sensorData?:PhSensorType})=>{
    const {selectedData} = useLocations()
    const {setSelectedData} = useSensors()
    
    const sensor = React.useMemo<PhSensorType>(()=>{
        return sensorData || selectedData!.sensors[0]
    },[selectedData!.sensors])

    return <div className='w-full h-full bg-background rounded-2xl p-6'>
        <header className='w-full flex justify-between items-start mb-5'>
            <div className='flex flex-col gap-2 items-start'>
                <p className='text-xl font-bold'>pH Sensor</p>
                <Badge
                    style={{
                        backgroundColor: sensor.mode === "alkaline" ? "#f1c40f" : 
                        sensor.mode === "auto" ? "#3498db" : "#2ecc71"
                    }}
                >{`${sensor.mode[0].toUpperCase()}${sensor.mode.substring(1,sensor.mode.length)}`}</Badge>
            </div>
            <div className='flex gap-2'>
                <TooltipWrapper title="Target pH">
                    <div className='w-14 h-8 flex justify-center items-center bg-primary rounded-xl cursor-default'>{Number(sensor.targetPh).toFixed(2)}</div>
                </TooltipWrapper>
                <SensorOptions onClick={()=>{setSelectedData(sensor)}}/>
            </div>
            
        </header>
        <div className='w-full flex justify-between py-6'>
            <SensorPropertieTemplate icon={Plug2} title='Electrode Port' info={`Port ${sensor.devicePort}`}/> 
            <SensorPropertieTemplate icon={ShieldCheck} title='Acceptance Margin' info={sensor.margin}/> 
        </div>
        <div className='w-full flex justify-between py-6'>
            <SensorPropertieTemplate icon={Clock2} title='Maximum Valve Time' info={`${sensor.maxValveTimeOpen} seconds`} /> 
            <SensorPropertieTemplate icon={Repeat} title='pH Monitor Frequency' info={`Every ${sensor.phMonitorFrequency} seconds`} /> 
        </div>
        <div className='w-full flex justify-between py-6'>
            <SensorPropertieTemplate icon={Calendar} title='Sensor registered At' info={moment(sensor.createdAt).format("DD/MM/YYYY - hh:mm a")}/> 
            <SensorPropertieTemplate icon={CircleFadingArrowUp} title='Last updated at' info={sensor.updatedAt ? moment(sensor.updatedAt).format("DD/MM/YYYY") : "Never updated"} /> 
        </div>
    </div>
}



const SensorPropertieTemplate = ({title, info, icon}:{title: string, info: string | React.ReactNode, icon: typeof Plug2})=>{
    return <div className='flex w-[clamp(150px,50%,300px)] gap-4'>
            <div className='bg-primary bg-opacity-20 w-10 h-10 flex justify-center items-center rounded-xl'>
                {React.createElement(icon)}
            </div>
        <div className='flex gap-2 flex-col'>
            <span className='text-primary text-xs'>{title}</span>
            <p className='font-bold text-xl'>{info}</p>
        </div>
    </div>
}

const SensorOptions = ({onClick}:{onClick: ()=>void})=>{
    const {setEdit, setOpen} = useSensors()
    const handleOpen = useDeleteConfig("sensor")
    
 

    return <DropdownMenu>
        <DropdownMenuTrigger  onClick={onClick}>
            <TooltipWrapper title="Device configuration options">
                {/* <Button onClick={onClick} variant="outline" size="icon"> */}
                    <MoreVertical/>
                {/* </Button> */}
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

            <DropdownMenuItem className="cursor-pointer" onClick={handleOpen}>
                <div className="flex items-center gap-2 text-destructive">
                    <Trash size={13}/>
                    <span>Delete</span>
                </div>

            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
}
const MultipleSensorTemplate = ()=>{
    const {selectedData} = useLocations()
    const {selectedData: selectedSensor, setSelectedData: setSelectedSensor} = useSensors()

    return selectedData?.sensors.map(s=>{
        return <Collapsible key={`callapsible-${s.id}`} onOpenChange={()=>{
            setSelectedSensor((prev: null | PhSensorType)=>prev ? prev.id === s.id ? null : s: s )
        }} open={selectedSensor?.id === s.id} className='mb-3'>
            <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between py-7">
                    <div className='flex flex-col items-start'>
                        <span className='text-lg'>pH Sensor</span>
                        <p>{s.id}</p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SingleSensorTemplate sensorData={s}/>
            </CollapsibleContent>
        </Collapsible>
    }) 
}

const NoSensorRegistered = ()=>{
    const {setOpen} = useSensors()

    return <div className='w-full h-full flex justify-center items-center flex-col gap-4'>
        <NoSensorIlustration width={250}/>
        <p className='text-2xl font-bold'>You didn&apos;t register a pH sensor yet.</p>
        <Button onClick={()=>{
            setOpen(true)
        }}>Register Sensor</Button>
    </div>
}

export default SensorProvider