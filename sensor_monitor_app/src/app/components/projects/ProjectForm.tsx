"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDevices } from '@/contexts/devices'
import { Button, ButtonProps } from '@/components/ui/button'
import { LoadingSpinner } from '../ui/Icons'
import { deviceIconColors } from '../DeviceWidget'
import { ProjectType, useProjects } from '@/contexts/projects'


const ProjectForm = ({
    size,
    variant,
    children
}:ButtonProps) => {
    const {registerProject, isLoading} = useProjects()
    async function handleSubmit(formData: FormData | ProjectType) {
        registerProject(formData as ProjectType)
    }

    return (<Dialog>
        <DialogTrigger>
            {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Project Registration*</DialogTitle>
                <DialogDescription> Fill the form to create your project </DialogDescription>
            </DialogHeader>
            <form className='flex flex-col gap-5' action={handleSubmit}>
                <Input
                    placeholder='Project title'
                    id="title"
                    name="title"
                    required
                />
                <DeviceSelection />
                <Input
                    placeholder='Data aquisition interval'
                    id="dataAquisitionInterval"
                    name="dataAquisitionInterval"
                    required
                    type='number'
                />
                <Button  disabled={isLoading}>
                    {isLoading ? <LoadingSpinner/>: "Submit"}
                </Button>
            </form>
        </DialogContent>
    </Dialog>
  )
}

const DeviceSelection = ()=>{
    const {deviceList} = useDevices()
    const [selectedValue, setSelectedValue] = React.useState("")

    return <>
        <input type="hidden" id='device' name="device" value={selectedValue}/>
        <Select onValueChange={setSelectedValue} required value={selectedValue}>
            <SelectTrigger>
                <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent >
                {deviceList.map(d=>{
                    const colorStatus = d.status !== "disconnected" ? deviceIconColors.disconnected : deviceIconColors[d.status]
                    return <SelectItem key={d.id} value={d.id}>
                        <div className='flex items-center gap-2'>
                            <div style={{
                                backgroundColor: colorStatus
                            }} className='w-3 h-3 rounded-full'></div>
                            {d.name}
                        </div>
                    </SelectItem>
                })}
            </SelectContent>
        </Select>
    </>
}

export default ProjectForm