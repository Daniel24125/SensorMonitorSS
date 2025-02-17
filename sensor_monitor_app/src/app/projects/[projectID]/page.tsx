"use client"

import React from 'react'
import ProjectHeader from './components/ProjectHeader'
import ProjectExperiments from './components/ProjectExperiments'
import { ProjectDetailsProvider } from '@/contexts/projectDetails'
import Loading from '@/app/components/Loading'

const Page = ({params}: {params: Promise<{ projectID: string }>}) => {
    const [projectID, setProjectID] = React.useState<null | string>(null)
  
    React.useEffect(()=>{
        const getProjectID = async ()=>{
            const urlParams = await params
            setProjectID(urlParams.projectID) 
           
        }
        getProjectID()
    },[])

    if(!projectID) return <Loading/>


    return (<ProjectDetailsProvider projectID={projectID}>
        <div className='w-full flex-col pt-10 h-[calc(100%-100px)]'>
            <ProjectHeader/>
            <ProjectExperiments/>
        </div>
    </ProjectDetailsProvider>
    )
}

export default Page