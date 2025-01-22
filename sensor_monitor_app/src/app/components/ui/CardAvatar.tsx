import React from 'react'

const CardAvatar = ({
    color,
    children
}:{color: string, children: React.ReactNode}) => {
  return (
    <div style={{
        backgroundColor: `${color}4D`,
        borderColor: `${color}33`,
        color: color
    }} className='w-14 h-14 flex-shrink-0 round-full border-solid border-8 rounded-full flex justify-center items-center'>
        {children}
    </div>
  )
}

export default CardAvatar