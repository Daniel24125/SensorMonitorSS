"use client"

import React from 'react'
import DeviceWidget from '../components/DeviceWidget'

const DeviceLayout = ({children}: {children: React.ReactNode}) => {
    return (
    <div className='w-full h-full flex justify-evenly'>
      <DeviceWidget />
      {children}
    </div>
  )
}

export default DeviceLayout