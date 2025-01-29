import { Button } from '@/components/ui/button';
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useDevices } from '@/contexts/devices'
import React from 'react'

interface ChildProps {
    disabled?: boolean;
    // Add any other props that your children components might have
  }

const AddProjectButton = ({children}: {children: React.ReactNode}) => {
    const {deviceList} = useDevices()

    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement<ChildProps>(child)) {
          return React.cloneElement(child, {disabled: deviceList.length === 0 });
        }
        return child;
      });

    return (
        <TooltipWrapper title={deviceList.length === 0 ? "Please connect a device so that you can start a project": ""}>
            <>
                {childrenWithProps}
            </>
            
        </TooltipWrapper>
    )
}

export default AddProjectButton