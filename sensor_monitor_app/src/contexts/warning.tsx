"use client"

import { Button } from "@/components/ui/button"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import React from "react"

type DialogOptions = {
    title: string 
    description?: string
    deleteFn: null | (()=>void )
}

interface WarningContextType {
    setOpen:  React.Dispatch<React.SetStateAction<boolean>>
    options: DialogOptions,
    setOptions: React.Dispatch<React.SetStateAction<DialogOptions>>
}
const WarningContext = React.createContext<WarningContextType | null>(null)

export const useWarningDialog = (): WarningContextType => {
  const context = React.useContext(WarningContext);
  if (!context) {
    throw new Error('useWarningDialog must be used within a DevicesProvider');
  }
  return context;
};

type WarningDialogProps ={
    children: React.ReactNode
}


 const WarningDialogProvider = ({children}:WarningDialogProps)=>{
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<DialogOptions>({
        title: "",
        description: "", 
        deleteFn: null
    })

    const value: WarningContextType = {
        setOpen,
        options,
        setOptions
    } 
    
    return <WarningContext.Provider value={value}>
        <ResponsiveDialog 
            title={options.title} 
            description={options.description}
            setIsOpen={setOpen}
            isOpen={open}
        >
            <div className="w-full flex flex-col">
                <p>Are you sure you want to proceed with this operation?</p>
                <div className="w-full flex justify-end">
                    <Button onClick={()=>{
                        if(options.deleteFn) options.deleteFn()
                    }}>Submit</Button>
                </div>
            </div>
        </ResponsiveDialog>
        {children}
    </WarningContext.Provider>
}

export default WarningDialogProvider