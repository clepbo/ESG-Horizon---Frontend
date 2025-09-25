import React from 'react'
import FullReport from '../../FullReport'
import BackButton from '@/app/components/ui/reusables/BackButton'

export default function pages() {
  return (
    <div className="grid w-full gap-4">
      <BackButton />
      <FullReport />

    </div>
  )
}
