import { CustomBreadcrumbDynamic } from '@/app/components/ui/CustomBreadcrumb'
import React from 'react'

export default function OperationalDelay() {
    const features = [
        { label: 'Disclosure topics', href: '/assessments/hub' },
        { label: 'Community Relations', href: '/company/assessments/industry-specific/social-capital/community-relations' },
        { label: 'Operational Delays', onclick: () => console.log('Operational Delays clicked') },
    ];
  return (
    <div>
      <CustomBreadcrumbDynamic features={features} />
    </div>
  )
}
