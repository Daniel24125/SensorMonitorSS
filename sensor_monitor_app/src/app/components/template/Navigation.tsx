"use client"
import { LayoutDashboard, LucideProps, Menu, RadioReceiver, SquareDashedKanban, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { ThemeToggleButton } from './topbar/ThemeToggleButton'
import { Button } from '@/components/ui/button'
import { useUser } from '@auth0/nextjs-auth0'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

type NavigationButtonType = {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
  name: string, 
  href: string
}

const NavContext = React.createContext<{
  expand: boolean,
  setExpand?: React.Dispatch<React.SetStateAction<boolean>>
}>({expand: false})

const Navigation = () => {
  const [expand, setExpand] = React.useState(false)
  const {isLoading } = useUser()
  
  return (<NavContext.Provider value={{expand, setExpand}}>
      <nav style={{
        width: expand ? 240 : 60,
        borderRadius: expand ? 10 : "100px",
        transitionDelay: expand ? "0" : "300ms",
        padding: expand ? 20 : 14
      }} className={`mr-5 py-3 bg-secondary-background h-full flex flex-col items-center transition-all duration-300`}>
        <NavigationHeader/>
        <div style={{
          transitionDelay: expand ? "300ms" : "0",
        }} className={`transition-all duration-300 w-full flex flex-col gap-5 h-full mt-14`}>
          <NavigationButton icon={LayoutDashboard} name='Dashboard' href="/"/>
          <NavigationButton icon={SquareDashedKanban} name='Your Projects' href="/projects"/>
          <NavigationButton icon={RadioReceiver} name='Device Management' href="/devices"/>
        </div>
        
        <div className='flex flex-col gap-2 items-center'>
          <ThemeToggleButton/>
          {isLoading ? <Skeleton className="w-10 h-10 rounded-full" /> : <AccountComponent/>}
        </div>
      </nav>
  </NavContext.Provider>
  )
}

const NavigationHeader = ()=>{
  const {expand, setExpand} = React.useContext(NavContext)
  
  return  <div className='flex justify-between items-center w-full '>
    <Button style={{
      opacity: !expand ? 1: 0,
      visibility: !expand ? "visible": "hidden",
      transitionDelay: !expand ? "0" : "300ms",
    }}  onClick={()=>setExpand!(true)} size="icon" className='rounded-full transition-all duration-300 absolute' >
      <Menu/>
    </Button>
    <span style={{
      opacity: expand ? 1: 0,
      visibility: expand ? "visible": "hidden",
      transitionDelay: expand ? "0" : "300ms",
    }} className='rounded-full transition-all duration-300'>RTSM</span>
    <Button style={{
      opacity: expand ? 1: 0,
      visibility: expand ? "visible": "hidden",
      transitionDelay: expand ? "0" : "300ms",
    }}  onClick={()=>setExpand!(false)} size="icon" variant="ghost" className='rounded-full transition-all duration-300'>
      <X/>
    </Button>

  </div>
}


const NavigationButton = ({
  icon, 
  name, 
  href
}:NavigationButtonType)=>{
  const {expand} = React.useContext(NavContext)
  const pathname = usePathname()
  const isActive = React.useMemo(()=>{
    return href === pathname
  },[pathname])

  return <Link  className={`flex gap-2 ${isActive ? "text-primary": "text-foreground"} hover:text-primary`} href={href}>
    {React.createElement(icon)}
    <div className='relative h-fit'>
      <span style={{
        opacity: expand ? 1: 0,
        visibility: expand? "visible": "hidden",
        transitionDelay: expand ? "0" : "300ms",
      }} className='text-sm transition-all duration-300 whitespace-pre absolute'>{name}</span>
    </div>
  </Link>
}

const AccountComponent = ()=>{
  const { user } = useUser()

  const userInitials = React.useMemo(()=>{
    const words: string[] = (user!.name as string).split(" ") 
    return `${words[0][0].toUpperCase()}${words[words.length-1][0].toUpperCase()}`
  },[])
  
  return <div className='flex items-center gap-2'>
    <Avatar>
      <AvatarImage src={user!.picture}/>
      <AvatarFallback>{userInitials}</AvatarFallback>
    </Avatar>
 
  </div>
}

export default Navigation