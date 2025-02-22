import { LogType } from '@/contexts/experiments'
import { Bell } from 'lucide-react'
import React from 'react'
import LogFilter from './LogFilter'
import LogTable from './LogTable'

type ProjectExperimentLogsProps = {
  logs: LogType[] | null 
  deviceID: string
  configurationID: string
}

const ProjectExperimentLogs = ({
  logs, 
  deviceID,
  configurationID
}: ProjectExperimentLogsProps) => {
  const [displayLogs, setDisplayLogs] = React.useState<LogType[] | null>(null)

  React.useEffect(()=>{
    setDisplayLogs(logs ? logs : [])  
  },[logs])

  return (
    <div className='p-3 w-full flex flex-col border rounded-2xl gap-4'>
      <header className='w-full flex justify-between items-center'>
        <div className='flex gap-2 items-center'>
          <Bell/>
          <h5>Experiment Events</h5>
        </div>
    	  <LogFilter
          logs={logs}
          setDisplayLogs={setDisplayLogs}
          deviceID={deviceID}
          configurationID={configurationID}
        />
      </header>
      <LogTable logs={displayLogs}/>
    </div>
  )
}


export default ProjectExperimentLogs