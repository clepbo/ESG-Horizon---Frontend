import React from 'react'
import Report from './components/Report'
import HeadingAndSubheading from '@/app/components/common/reports/HeadingAndSubheading'

export default function page() {
  return (
    <div className='grid gap-2 '>
      <HeadingAndSubheading heading='Reports' subheading='Access comprehensive insights into your company’s ESG performance' />
     <Report />
      
    </div>
  )
}
