"use client"

import DeviceWidget from "./components/DeviceWidget"
import OnGoingExperimentWidget from "./components/OnGoingExperimentWidget"
import ProjectListWidget from "./components/projects/ProjectListWidget"
import ProjectDetails from "./components/projects/ProjectDetailsWidget"
import { useUserProfile } from "@/contexts/user"
import Loading from "./components/Loading"


const rowClass: string = "w-full flex justify-between h-[calc(50%-35px)] mt-5 gap-5"

export default function Home() {
 const {isLoading} = useUserProfile()

  if(isLoading) return <Loading/>
  

  return <>
    <div className={`${rowClass}`}>
      <DeviceWidget showHeaderIcon={true}/>
      <OnGoingExperimentWidget/>  
    </div>
    <div className={`${rowClass}`}>
      <ProjectListWidget/>
      <ProjectDetails/>
    </div>
  </>
}
