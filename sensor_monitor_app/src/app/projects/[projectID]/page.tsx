
import React from 'react'
import ProjectHeader from './components/ProjectHeader'
import ProjectExperiments from './components/ProjectExperiments'
import { ProjectDetailsProvider } from '@/contexts/projectDetails'

const Page = async ({params}: {params: Promise<{ projectID: string }>}) => {
    const projectID = await React.useMemo(async ()=>{
        return (await params).projectID
    }, [])

    


    return (<ProjectDetailsProvider projectID={projectID}>
        <div className='w-full h-full flex-col pt-10'>
            <ProjectHeader/>
            <ProjectExperiments/>
        </div>
    </ProjectDetailsProvider>
    )
}

export default Page