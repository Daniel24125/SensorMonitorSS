"use client"

import { useUser } from "@auth0/nextjs-auth0"
import DeviceWidget from "./components/DeviceWidget"
import OnGoingExperimentWidget from "./components/OnGoingExperimentWidget"
import ProjectListWidget from "./components/projects/ProjectListWidget"
import ProjectDetails from "./components/projects/ProjectDetailsWidget"

const rowClass: string = "w-full flex justify-between h-1/2 mt-5 gap-5"

export default function Home() {
  const { user, isLoading, error } = useUser()

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
