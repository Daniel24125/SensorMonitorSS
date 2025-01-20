"use server"

import { DeviceType, User } from "@/contexts/devices"

export type ProjectType = {
    id: string 
    title: string 
    device: DeviceType
    dataAquisitionInterval: number
    createdAt: string
    updatedAt?: string
}


type GetProjectType = (userID: User) => Promise<ProjectType[]>

export const getProjectList: GetProjectType = async (userID) =>{
    return new Promise((resolve, reject)=>{
        resolve([
            {
                id: "powengfvpiwenfg", 
                title: "Monitoring the growth of micro alge pH through time",
                device: {
                    id: "wojnfvowejknfowef", 
                    name: "pH Monitor Device",
                    createdAt: new Date().toJSON(),
                    isConnected: true,
                    status: "ready",
                    locations: [
                        {
                            id: "sdkjvbirkejwbvweiojrg",
                            name: "R1",
                            createdAt: new Date().toJSON(),
                            sensor: [
                                {
                                    id: "wfwefvwecvwevwev",
                                    mode: "acidic",
                                    margin: 0.1,
                                    maxValveTimeOpen: 30,
                                    targetPh: 7.0,
                                    probePort: 17,
                                    valvePort: 18,
                                    checkInterval: 5,
                                    createdAt: new Date().toJSON()
                                }
                            ],
                        }
                    ]
                },
                dataAquisitionInterval: 10,
                createdAt: new Date().toJSON()
            }
        ])
    })
}