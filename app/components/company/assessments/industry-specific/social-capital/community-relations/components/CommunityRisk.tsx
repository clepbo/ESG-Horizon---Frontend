import { CustomBreadcrumbDynamic } from '@/app/components/ui/CustomBreadcrumb'
import React from 'react'

export default function CommunityRisk() {

    const features = [
        { label: 'Disclosure topics', href: '/assessments/hub' },
        { label: 'Community Relations', onclick: () => console.log('Community Relations clicked') },
    ];
  return (
    <section className='min-h-screen bg-green-50 p-6'>
      <CustomBreadcrumbDynamic features={features} />
    </section>
  )
}
