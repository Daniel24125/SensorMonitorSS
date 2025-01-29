import React from 'react'
import WidgetCard from '../ui/WidgetCard'
import { Button } from '@/components/ui/button'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjects } from '@/contexts/projects'
import DashboardCard from '@/components/ui/dashboard-card'
import { NoProjectsIlustration } from '@/components/ui/ilustrations'
import AddProjectButton from './AddProjectButton'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const ProjectListWidget = () => {
  const { isLoading} = useProjects()
  const router = useRouter()

  return (<WidgetCard title='Your Projects' secondaryAction={
    <Button onClick={()=>router.push("/projects")} size="icon" variant="ghost">
      <ExternalLink/>
  </Button>
  } className='w-80 flex-shrink-0'>
    {isLoading ? <ProjectLoadingCard/> : <ProjectListComponent/>}
  </WidgetCard>
  )
}

const ProjectLoadingCard = ()=>{
  return [...Array(3).keys()].map(s=>{
    return <DashboardCard 
      key={`skeleton-${s}`}
      title={<Skeleton className="bg-zinc-700 h-4 w-full" />}
      subtitle={<Skeleton className="bg-zinc-700 h-3 w-20" />}
    >
      <Skeleton className="h-14 w-14 rounded-full bg-zinc-700 flex-shrink-0" />
    </DashboardCard> 
  })
}

const ProjectListComponent = ()=>{
  const {projectList, setSelectedProject, selectedProject} = useProjects()

  return projectList.length === 0 ? <NoProjectsComponent size='sm'/> : projectList.map(p=>{
    return <DashboardCard 
      key={p.id}
      title={p.title}
      subtitle={`${p.experiments!.length} experiments`}
      color='#9C88FF'
      setSelected={()=>setSelectedProject(p)}
      active={selectedProject?.id === p.id}
      secondaryAction={<Button  className='flex-shrink-0' size="icon" variant="ghost">
        <ChevronRight/>
      </Button>}
    >
      <p>{p.title[0].toUpperCase()}</p>
    </DashboardCard>
  })
}

export const NoProjectsComponent = ({size}: {size: "sm" | "lg"})=>{
  const {setOpen} = useProjects()

  return <div className={cn(
    'w-full h-full flex flex-col items-center justify-center',
    size === "lg" ? "gap-5": "gap-2"
  )}>
    <h2 className={cn('font-bold', size === "lg" ? "text-8xl":"text-5xl")}>Oops!</h2>
    <h6 className={cn(
      'max-w-80 text-center', 
      size === "lg" ? "text-lg": "text-xs"
    )}>You don’t have any projects yet.</h6>
   <AddProjectButton>
      <Button size={size} onClick={()=>{
          setOpen(true)
        }} className='bg-secondary'>
          Create your first project
      </Button>
   </AddProjectButton>
    <NoProjectsIlustration width={size === "sm" ? 150 : 300}/>
  </div>
}

export default ProjectListWidget