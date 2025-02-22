import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDevices } from '@/contexts/devices'
import { LogSeverityType, LogType } from '@/contexts/experiments'
import { Filter } from 'lucide-react'
import React from 'react'


type LogFilterProps = {
    logs: LogType[] | null
    setDisplayLogs: React.Dispatch<React.SetStateAction<LogType[] | null>>
    deviceID: string
    configurationID: string
}

type SeverityConfig = {
    value: LogSeverityType;
    color: string;
    label: string;
}

type SeverityColors = {
    [K in LogSeverityType]: SeverityConfig;
}

export const severityColors: SeverityColors = {
    "info": {
        value: "info",
        color: "#004CCE",
        label: "Information"
    },
    "warning": {
        value: "warning",
        color: "#E1A325",
        label: "Warning"
    },
    "error": {
        value: "error",
        color: "#F42E25",
        label: "Error"
    }, 
}

const LogFilter = ({logs, setDisplayLogs, deviceID, configurationID}: LogFilterProps) => {
    const {getConfigurationByID} = useDevices()
    const [severity, setSeverity] = React.useState<string | null>(null)
    const [location, setLocation] = React.useState<string>("all")

    const configuration = React.useMemo(()=>getConfigurationByID(deviceID, configurationID),[])
    React.useEffect(()=>{
        setDisplayLogs(()=>{
            if(!logs) return logs
            if(!severity && location === "all") return logs
            if(!severity && location !== "all") return logs.filter(l=>l.location === location)
           
            return logs.filter(log=>{
                return log.type === severity && (location === "all" ? true : log.location === location)
            }) 
        })
    },[severity, location])

    const handleClearFilters = ()=>{
        setDisplayLogs(logs)
        setSeverity(null)
        setLocation("all")
    }

    return (
        <Popover>
            <PopoverTrigger disabled={!logs}>
                <Button variant={"ghost"} size={"icon"}>
                    <Filter/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className='flex flex-col gap-4'>
                
                <div className='flex flex-col gap-2'>
                    <p>Location</p>
                    <Select value={location} onValueChange={(loc)=>setLocation(loc)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Show all" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Show all</SelectItem>
                            <SelectItem value="Device">Device</SelectItem>
                            {configuration?.locations.map(l=>{
                                return <SelectItem key={l.id} value={l.name}>{l.name} </SelectItem>
                            })}

                        </SelectContent>
                    </Select>
                </div>
                <div className='flex flex-col gap-2'>
                    <p>Log severity</p>
                    <div className='w-full flex justify-between'>
                        {Object.values(severityColors).map((d)=>{
                            return <SeverityBadge
                                key={d.label}
                                onClick={()=>{
                                    setSeverity(prev => prev === d.value ? null : d.value)
                                }}
                                severity={d.value}
                                style={{color: severity === d.value ? d.color: "CaptionText"}}
                            /> 
                            
                        })}
                    </div>
                </div>
                <div className='w-full flex justify-end'>
                    <Button variant="ghost" onClick={handleClearFilters}>
                        Clear filters
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
  )
}

export const SeverityBadge = ({onClick, severity, style}:{onClick?: ()=>void, severity: LogSeverityType, style?: React.CSSProperties})=>{
    const d = severityColors[severity]
    
    return <Badge onClick={onClick} key={d.label} 
        className='bg-card hover:bg-card-hover cursor-pointer'
    >
        <span style={style ? style : {color: d.color}}>
            {d.label}
        </span>
    </Badge>
}
export default LogFilter