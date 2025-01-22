import React from 'react'
import WidgetCard from '../ui/WidgetCard'
import { Button } from '@/components/ui/button'
import { ChevronRight, ExternalLink } from 'lucide-react'
import CardAvatar from '../ui/CardAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjects } from '@/contexts/projects'
import DashboardCard from '@/components/ui/dashboard-card'

const ProjectListWidget = () => {
  const { isLoading} = useProjects()

  return (<WidgetCard title='Your Projects' secondaryAction={
    <Button size="icon" variant="ghost">
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
  const {projectList, isLoading} = useProjects()
  return projectList.map(p=>{
    return <DashboardCard  
      title={p.title}
      subtitle={`${p.experiments.length} experiments`}
      color='#9C88FF'
      secondaryAction={<Button className='flex-shrink-0' size="icon" variant="ghost">
        <ChevronRight/>
      </Button>}
    >
      <p>{p.title[0].toUpperCase()}</p>
    </DashboardCard>
  })
}

export default ProjectListWidget