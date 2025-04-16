"use client"

import DeviceWidget from "./components/DeviceWidget"
import OnGoingExperimentWidget from "./components/OnGoingExperimentWidget"
import ProjectListWidget from "./components/projects/ProjectListWidget"
import ProjectDetails from "./components/projects/ProjectDetailsWidget"
import { useUserProfile } from "@/contexts/user"
import Loading from "./components/Loading"


// const rowClass: string = "w-full h-[calc(50%-35px)] mt-5 gap-5 grid grid-cols-2"

export default function Home() {
 const {isLoading} = useUserProfile()

  if(isLoading) return <Loading/>
  

  return <div className="w-full 2xl:h-[calc(100%-35px)]  mt-5 gap-y-5 grid grid-cols-1 2xl:grid-cols-4 grid-rows-4 2xl:grid-rows-2 2xl:gap-x-5">
    {/* <div className={`${rowClass} `}> */}
      <DeviceWidget className="col-span-1 min-w-80 max-h-96"  showHeaderIcon={true}/>
      <OnGoingExperimentWidget className="col-span-3 max-h-96"/>  
    {/* </div> */}
    {/* <div className={`${rowClass}`}> */}
      <ProjectListWidget className="col-span-1  min-w-80 max-h-96"/>
      <ProjectDetails className="col-span-3 max-h-96"/>
    {/* </div> */}
  </div>
}
