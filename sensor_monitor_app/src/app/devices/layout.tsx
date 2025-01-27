"use client"

import React from 'react'

const DeviceLayout = ({children}: {children: React.ReactNode}) => {
    return (
    <div className='w-full h-full flex '>
      {/* <DeviceWidget /> */}
      {children}
    </div>
  )
}

export default DeviceLayout