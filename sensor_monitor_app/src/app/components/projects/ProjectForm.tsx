"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDevices } from '@/contexts/devices'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '../ui/Icons'
import { deviceIconColors } from '../DeviceWidget'
import { ProjectType, useProjects } from '@/contexts/projects'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { useToast } from '@/hooks/use-toast'
import { FormInput } from '@/app/devices/components/SensorDetails'
import { useUserProfile } from '@/contexts/user'


const ProjectForm = () => {
    const {handleProjectRegistration, handleUpdateProject, isLoading, selectedProject, open, setOpen, edit} = useProjects()
    const {toast} = useToast()
    const [form, setForm] = React.useState<ProjectType>({
        title: "", 
        device: "", 
        configuration: "",
        dataAquisitionInterval: 2
    }) 

    React.useEffect(()=>{
        if(!open){
            setForm({
                title: "", 
                device: "", 
                configuration: "",
                dataAquisitionInterval: 2
            })
        }
    }, [open])

    React.useEffect(()=>{
        if(edit && selectedProject){
            setForm({
                ...form, 
                ...selectedProject
            }) 
        }
    },[selectedProject, edit])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setForm(prev=>{
            return {
                ...prev, 
                [e.target.id]: e.target.value
            }
        })
    }
    
    async function handleSubmit() {
        if(form.title === "" || form.device === "" || form.dataAquisitionInterval <= 0 || form.configuration === ""){
            toast({
                title: "Error",
                description: "Make sure you filled all the required fields",
                variant: "destructive"
            })
            return 
        }
        const execFn = edit ? handleUpdateProject : handleProjectRegistration
        execFn(form)
    }

    

    return (<ResponsiveDialog
        isOpen={open}
        setIsOpen={setOpen}
        title={edit? "Update Project Information": "Project Registration"}
        description={`Fill the form to ${edit? "update" : "create"} your project`}
    >
        <form className='flex flex-col gap-5' action={handleSubmit}>
            <Input
                placeholder='Project title'
                id="title"
                name="title"
                required
                onChange={handleInputChange}
                value={form.title}
            />
            <DeviceSelection form={form} setForm={setForm} />
            {form.device !== "" && <ConfigurationSelection form={form} setForm={setForm}/>}
            <FormInput label='Data aquisition interval' description='Period of time, in seconds,to aquire data points'>
                <Input
                    placeholder='Data aquisition interval'
                    id="dataAquisitionInterval"
                    name="dataAquisitionInterval"
                    required
                    type='number'
                    onChange={handleInputChange}
                    value={form.dataAquisitionInterval}
                />
            </FormInput>
            <Button  disabled={isLoading}>
                {isLoading ? <LoadingSpinner/>: "Submit"}
            </Button>
        </form>
    </ResponsiveDialog>
    
  )
}

const DeviceSelection = ({form, setForm}: {form: ProjectType, setForm: React.Dispatch<React.SetStateAction<ProjectType>>})=>{
    const {getDeviceByID} = useDevices()
    const {user} = useUserProfile()
    return <>
        <Select onValueChange={value=>{
            setForm(prev=>{
                return {
                    ...prev, 
                    device: value
                }
            })
        }} required value={form.device}>
            <SelectTrigger>
                <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent >
                {user!.deviceSubscriptions.map(deviceID=>{
                    const d = getDeviceByID(deviceID)
                    const colorStatus = d!.status === "disconnected" ? deviceIconColors.disconnected : deviceIconColors[d.status]
                    return <SelectItem key={d!.id} value={d!.id}>
                        <div className='flex items-center gap-2'>
                            <div style={{
                                backgroundColor: colorStatus
                            }} className='w-3 h-3 rounded-full'></div>
                            {d!.name}
                        </div>
                    </SelectItem>
                })}
            </SelectContent>
        </Select>
    </>
}

const ConfigurationSelection = ({form, setForm}: {form: ProjectType, setForm: React.Dispatch<React.SetStateAction<ProjectType>>})=>{
    const {getDeviceByID} = useDevices()
    
    const device = React.useMemo(()=>{
        return getDeviceByID(form.device)
    },[form.device])


    return <>
        <Select
            onValueChange={value=>{
                setForm(prev=>{
                    return {
                        ...prev, 
                        configuration: value
                    }
                })
            }} 
            required 
            value={form.configuration} 
        >
            <SelectTrigger className='h-auto'>
                <SelectValue  placeholder="Select the device configuration" />
            </SelectTrigger>
            <SelectContent>
                {device?.configurations.map(c=>{
                    return <SelectItem  key={c.id} value={c.id}>
                        <div className='flex flex-col gap-2'>
                            <p>
                                {c.name}
                            </p>
                            <p className='text-xs text-primary'>{c.locations.length} locations defined</p>
                        </div>
                    </SelectItem>
                })}
            </SelectContent>
        </Select>
    </>
}
export default ProjectForm