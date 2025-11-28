import { CustomBreadcrumbDynamic } from '@/app/components/ui/CustomBreadcrumb'
import React from 'react'
import { WastewaterProps } from './FreshWaterWithdrawalAndConsumption'

export default function ProducedWaterManagement({backToAssessment, backToDisclosureTopic, backToWaterWasteManagement} : WastewaterProps) {
  const features = [
      {
        label: "Assessments",
        onClick: backToAssessment
      },
      {
        label: "Disclosure Topic",
        onClick: backToDisclosureTopic
      },
       {
      label: "Water and Waterwaste management",
      onClick: backToWaterWasteManagement
    },
      {
        label: "Freshwater Withdrawal & Consumption"
      },
    ]
  
    return (
      <div className='min-h-screen bg-green-50 p-6'>
        <CustomBreadcrumbDynamic features={features} />
      </div>
    )
}
