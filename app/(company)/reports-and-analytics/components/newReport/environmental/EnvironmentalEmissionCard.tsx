import React from 'react'
import { FaArrowDown } from 'react-icons/fa'

interface Props {

}

export default function EnvironmentalEmissionCard() {
  return (
    <div className='rounded-md p-2 md:p-4 border-l border-4 border-green-600 grid'>
      <div className="flex items-center justify-between w-full">
        <text className=''> Total Emissions </text>
         <span
          className={` p-3 rounded-lg bg-green-200 text-green-600 flex items-center gap-2`}
          
        >
            <FaArrowDown />
            0.34
          
        </span>
      </div>
    </div>
  )
}
