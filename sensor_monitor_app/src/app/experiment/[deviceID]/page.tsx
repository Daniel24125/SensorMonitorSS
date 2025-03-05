"use client"

import Loading from '@/app/components/Loading'
import { useUrlParams } from '@/hooks/use_url-params';
import React from 'react'
import ExperimentTemplate from './components/ExperimentTemplate';

const Page = ({params}: {params: Promise<{ deviceID: string }>}) => {
  const { param: deviceID, loading, error } = useUrlParams(params, "deviceID");
  
  if(loading) return <Loading/>
  if (error) throw error

  return <ExperimentTemplate deviceID={deviceID!}/>
}



export default Page