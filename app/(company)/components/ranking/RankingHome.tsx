import { CustomButton } from '@/app/components/ui/reusables/CustomButton'
import React from 'react'
import PerformanceOverview from './PerformanceOverview'

export default function RankingHome() {
    return (
        <div className='w-full grid gap-2 lg:gap-4'>
            <div className='flex flex-wrap mx-auto items-center max-w-2xl p-3 gap-4 bg-white rounded-sm shadow-md'>
                <CustomButton variant={'outlined'}>
                    Targets and Performance
                </CustomButton>
                <CustomButton>
                    Leader boards
                </CustomButton>
            </div>
            <PerformanceOverview />

        </div>
    )
}
