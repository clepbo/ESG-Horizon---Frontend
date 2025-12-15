import { Card } from '@/app/components/ui/card'
import React from 'react'
import { FaArrowRight, FaLeaf, FaArrowDown } from 'react-icons/fa'

export default function EsgAssignmrntReportCard() {
    return (
        <Card className='p-4 grid gap-4 border-t-2 border-t-green-600'>
            <div className="flex items-center justify-between w-full">
                <span className={`bg-green-200 p-3 rounded-md`}>
                    <FaLeaf className='text-green-600 text-2xl' />

                </span>
                <FaArrowRight />


            </div>
            <h6 className=''> Environmental </h6>
            <hr className='text-gray-200'/>
            <div className="flex items-center justify-between">
                <text className=''>
                    Total Emission
                </text>
                <span className='bg-green-200 flex items-center gap-2 rounded-2xl text-green-600 text-sm p-1'>
                    <FaArrowDown />
                    0.04%

                </span>
            </div>

            <h5 className='font-bold'>
                154,000 <sub className='text-xs font-normal text-gray-400'> tCO2e</sub>
            </h5>
            <small className=''>
                On plan to meet 2030 targets. Scope 2 emission show significant improvement.
            </small>
        </Card>
    )
}
