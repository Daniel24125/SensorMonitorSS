import { chartConfig } from '@/app/experiment/components/ExperimentData'
import { ChartContainer } from '@/components/ui/chart'
import { useProjectDetails } from '@/contexts/projectDetails'
import React from 'react'
import { CartesianGrid, Label, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'

const ProjectExperimentData = () => {
    const {selectedLocation} = useProjectDetails()

    return <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-1/2">
    <ScatterChart
        margin={{
            top: 20,
            right: 20,
            bottom: 0,
            left: 0,
        }}
    >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Time" unit="s" >
            <Label value="Time (s)" offset={0} position="insideBottom" />
        </XAxis>
        <YAxis type="number" dataKey="y" name="pH"  label={{ value: 'pH', angle: -90, position: 'insideLeft' }}/>
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="A school" data={selectedLocation!.data} fill="#8884d8" line shape="circle" />
    </ScatterChart>
    </ChartContainer>
}

export default ProjectExperimentData