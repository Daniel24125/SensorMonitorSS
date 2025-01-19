import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { Plus } from 'lucide-react'
import React from 'react'

const Topbar = () => {
  return (
    <div className='w-full flex justify-between items-center p-3 flex-grow-0 flex-shrink basis-auto'>
        <SearchProject/>
        <CreateProject/>
    </div>
  )
}

export const SearchProject = ()=>{
    return <Input placeholder="Search for a project title" className='w-80 bg-secondary-background'/>
}

export const CreateProject = ()=>{
    return <TooltipWrapper title={"Create a new project"}>
      <Button size="icon" className='rounded-full'>
        <Plus/>
      </Button>
    </TooltipWrapper>
}

export default Topbar