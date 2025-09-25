import { GoDotFill } from "react-icons/go";

import React from 'react'
import { CustomProgress } from "./charts/ProgressBar";
import { emissionsData } from "./data/reportData";


export default function DirectEmission() {
  return (
    <div className="grid gap-3">
        <div className={`flex gap-2 justify-start items-center w-full `}>

        <GoDotFill className="h-6 text-orange-500 rounded-full"/>
        <h5 className={`text-orange-500`}> Scope 1: Direct Emissions {`${emissionsData[0].value}`}tCO<sub>2</sub>e </h5>
        </div>
        {
            emissionsData.map((item, i) => (
                <CustomProgress value={item.value} title={item.title} total={item.total} percent={item.percent}
                key={i}
                />
            ))
        }
        
        
        
    </div>
  )
}
