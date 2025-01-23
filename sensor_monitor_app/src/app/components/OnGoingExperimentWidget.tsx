import React from 'react'
import WidgetCard from './ui/WidgetCard'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

const OnGoingExperimentWidget = () => {
  return (
    <WidgetCard title='On going Experiment' className='w-full' secondaryAction={<>
      <Button size="icon" variant="ghost">
          <ExternalLink/>
      </Button>
    </>}>
        OnGoingExperimentWidget
    </WidgetCard>
  )
}

export default OnGoingExperimentWidget