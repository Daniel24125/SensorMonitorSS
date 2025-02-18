import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LogType } from '@/contexts/experiments'
import moment from 'moment'
import React from 'react'
import { SeverityBadge, severityColors } from './LogFilter'
import { ScrollArea } from '@/components/ui/scroll-area'

type LogTableProps = {
  logs: LogType[] | null 
}
const LogTable = ({logs}:LogTableProps) => {
    if(!logs) return <h1>No data to display</h1>
    return (<ScrollArea className='h-[400px]'>
        <Table>
            <TableCaption>A list of all experiment logs.</TableCaption>
            <TableHeader>
                <TableRow>
                <TableHead></TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead >Location</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
        
                {logs!.map((l,i)=>{
                    return<TableRow key={l.id}>
                        <TableCell className='text-accent'>{i}</TableCell>
                        <TableCell>{l.desc}</TableCell>
                        <TableCell>{moment(l.createdAt).format("DD/MM/YYYY - hh:mm:ss a")}</TableCell>
                        <TableCell>
                            <SeverityBadge
                                severity={l.type}
                            />
                        </TableCell>
                        <TableCell>{l.location}</TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>
    </ScrollArea>
    )
}

export default LogTable