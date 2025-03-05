"use client"

import React from 'react'
import ProjectHeader from './components/ProjectHeader'
import ProjectExperiments from './components/ProjectExperiments'
import { ProjectDetailsProvider } from '@/contexts/projectDetails'
import Loading from '@/app/components/Loading'
import { useUrlParams } from '@/hooks/use_url-params'

const Page = ({params}: {params: Promise<{ projectID: string }>}) => {
    const { param: projectID, loading, error } = useUrlParams(params, "projectID");
  
  

    if(loading) return <Loading/>
    if(error) throw error

    return (<ProjectDetailsProvider projectID={projectID!}>
        <div className='w-full flex-col pt-10 h-[calc(100%-100px)]'>
            <ProjectHeader/>
            <ProjectExperiments/>
        </div>
    </ProjectDetailsProvider>
    )
}

export default Page