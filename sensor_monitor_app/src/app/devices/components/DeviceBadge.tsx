import { useDevices } from "@/contexts/devices"
import { ProjectType } from "@/contexts/projects"
import { Badge } from "lucide-react"
import React from "react"


const DeviceBadge = ({project}: {project: ProjectType})=>{
    const {deviceList} = useDevices()
    
    const projectDevice = React.useMemo(()=>{
        return deviceList.filter(d=>d.id === project.device)[0]
    },[])

    return projectDevice && <Badge>
        {projectDevice.name}
    </Badge>
}

export default DeviceBadge