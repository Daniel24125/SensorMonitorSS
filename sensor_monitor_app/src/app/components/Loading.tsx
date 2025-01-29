import React from 'react'
import { LoadingSpinner } from './ui/Icons'

const Loading = () => {
  return (
    <div className='w-full h-full flex justify-center items-center bg-background z-50 fixed top-0'>
        <LoadingSpinner className='w-11 h-11'/>
    </div>
  )
}

export default Loading