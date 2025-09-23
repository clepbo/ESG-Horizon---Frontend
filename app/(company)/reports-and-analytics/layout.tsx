import React from 'react'
import Header from '../components/Header';

interface ReportLayoutProps {
  children: React.ReactNode;
}
export default function ReportLayout({ children }: ReportLayoutProps) {
  return (

    <div className=" py-4 gap-8 md:gap-16 md:py-8 px-8 bg-[#DFF9E6] w-full min-h-screen">
      <Header />
      {/* <HeadingAndSubheading heading={heading} subheading={subheading} /> */}

      {children}
    </div>
  )
}
