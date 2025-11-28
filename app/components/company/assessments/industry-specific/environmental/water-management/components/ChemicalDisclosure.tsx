import React from 'react'
import { WastewaterProps } from './FreshWaterWithdrawalAndConsumption'
import { CustomBreadcrumbDynamic } from '@/app/components/ui/CustomBreadcrumb'

function ChemicalDisclosure({backToAssessment, backToDisclosureTopic, backToWaterWasteManagement}: WastewaterProps) {
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
      label: "Chemical Disclosure"
    },
  ]
  return (
    <div className='min-h-screen bg-green-50 p-6'>
      <CustomBreadcrumbDynamic features={features} />
    </div>
  )
}

export default ChemicalDisclosure
