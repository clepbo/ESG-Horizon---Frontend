import React from 'react'
import ReportSummary from '../components/ReportSummary'
import ReportSummarySkeleton from '../components/skeleton/ReportSummarySkeleton';

export default function pages() {
  const loading = true;

  if (loading) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ReportSummarySkeleton />
      </React.Suspense>
    );
  }
  return (
    <div className="grid">
       <ReportSummary reportingPeriod="January 2021 - June 2021" subsidiary="Dangote Sugar" status="In Progress" progress={70} totalEmissions={26230} scope1={16300} scope2={7500} scope3={3030} />
    </div>
  )
}
