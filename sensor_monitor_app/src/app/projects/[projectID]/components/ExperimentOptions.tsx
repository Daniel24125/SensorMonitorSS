import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useWarningDialog } from '@/contexts/warning'
import { MoreVertical, Save, Trash2 } from 'lucide-react'
import React from 'react'

const ExperimentOptions = ({onClick, deleteProjectExperiment}: {onClick?: ()=>void, deleteProjectExperiment: ()=>void}) => {
    const {setOptions, setOpen: setOpenWarning} = useWarningDialog()

    return <DropdownMenu>
    <DropdownMenuTrigger  asChild>
        <Button onClick={onClick} variant="ghost" size="icon">
            <MoreVertical/>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() =>{
            console.log("Export Data")
        }}>
            <Save/>
            <span> Export Data</span>
        </DropdownMenuItem>
       
            <DropdownMenuItem  className='text-destructive' onClick={() =>{
                setOptions({
                    title: "Delete Experiment",
                    description: "This operation is not reversible!", 
                    deleteFn: async ()=>{
                        deleteProjectExperiment()
                        setOpenWarning(false)
                    }
                })
                setOpenWarning(true)
            }}>
            <Trash2/>
            <span> Delete Experiment</span>
        </DropdownMenuItem>
    </DropdownMenuContent>
    </DropdownMenu>
    }

export default ExperimentOptions