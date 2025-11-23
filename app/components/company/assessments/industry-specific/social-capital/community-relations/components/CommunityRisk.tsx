import { CustomBreadcrumbDynamic } from '@/app/components/ui/CustomBreadcrumb'
import { useAssessment } from '@/hooks/useAssessment';
import React from 'react'
import { PagetitleAndDescription } from './PagetitleAndDescription';
import { Card, CardContent } from '@/app/components/ui/card';
import { AssessmentProgressBar } from '../../../../AssessmentProgressBar';
import CustomTooltip from '@/app/(company)/ranking/create/components/CustomTooltip';
import { TooltipMessage } from '@/app/(company)/ranking/create/components/TooltipMessage';
import { Textarea } from '@/app/components/ui/textarea';
import { EvidenceItem } from './AddMoreFIles';


interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}
export default function CommunityRisk({ onBack, onDisclosureTopics, stepIndex, totalSteps, onNext }: Props) {

  const features = [

    { label: 'Dashboard', href: '/dashboard-esg' },
    { label: 'Assessments', href: '/assessments/hub' },
    { label: 'Disclosure topics', onClick: onDisclosureTopics },
    { label: 'Community Relations', onClick: onBack },
    { label: 'Community Risks...' },
  ];
  return (
    <section className='min-h-screen bg-green-50 p-6'>
      <CustomBreadcrumbDynamic features={features} />
      <div className="">
        <PagetitleAndDescription title={'Community Risk & Opportunity Management'} description={"Describe your organization's process for managing risks and opportunities related to the rights and interests of the communities where you operate."} />
        <Card className='p-3 space-y-2 my-2'>
          <CardContent className="space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={1}
              totalFields={2}
              isSubmitted={false}
            />

            <div className='space-y-4'>
              <p>Description of Community Risk Management Process
                <CustomTooltip
                  detail={
                    <TooltipMessage
                      title=""
                      message="Provide an overview of how your company identifies, evaluates, and manages risks related to local communities. This may include stakeholder engagement plans, grievance mechanisms, social impact assessments, conflict-prevention strategies, and processes for responding to community concerns. The goal is to show how your company protects community well-being while reducing operational and reputational risks."
                    />
                  }
                />
              </p>
              <Card className='bg-gray-100'>
                <CardContent className=''>
                  <Textarea className='mt-6'
                    // cols={4}
                    placeholder='e.g., Our primary process is the implementation of Host Community Development Trusts (HCDTs) as required by the PIA 2021, which funds community projects and provides a formal grievance mechanism...' /

                  >
                </CardContent>
              </Card>


            </div>


            <PagetitleAndDescription title={'Document/Evidence Upload'}
              description={'Upload supporting documents like  Host Community Development Trust (HCDT) annual reports, community grievance logs and resolution records, and minutes from HCDT board meetings.'} />

            <Card className='bg-gray-100 -mt-4'>
              <EvidenceItem index={0} onRemove={() => {}} />
            </Card>
          </CardContent>

        </Card>

      </div>
    </section>
  )
}
