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
import { EvidenceList } from './ItemCards';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from 'lucide-react';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';


interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}
export default function CommunityRisk({ onBack, onDisclosureTopics, stepIndex, totalSteps, onNext }: Props) {

  const [isSaving, setIsSaving] = React.useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { state, dispatch } = useAssessment();

  const features = [

    { label: 'Dashboard', href: '/dashboard-esg' },
    { label: 'Assessments', href: '/assessments/hub' },
    { label: 'Disclosure topics', onClick: onDisclosureTopics },
    { label: 'Community Relations', onClick: onBack },
    { label: 'Community Risks...' },
  ];

  function handlePrevious() {
    onBack();
  }
  function handleSaveAndContinue() {
    // Save logic here
    console.log('Saving progress...');
  }
  function handleSubmit() {
    onNext();
  }

  function handleNext() {
    onNext();
  }
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

            <div className="bg-gray-100 p-4 rounded-lg">
              <EvidenceList />
            </div>

          </CardContent>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="justify-self-start hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="justify-self-center bg-primary hover:cursor-pointer text-white hover:bg-teal-300 transition-colors"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Saving...
                </>
              ) : showSaveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save & Continue Later
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={isSaving}
              className="justify-self-end border-primary cursor-pointer text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              aria-label="Next step"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
            {/* <Button
                variant="outline"
                onClick={() => handleSubmit()}
                disabled={isSaving || isSubmitting}
                className="justify-self-end hover:cursor-pointer border-primary text-primary bg-transparent hover:bg-green-50 flex items-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button> */}
          </div>

        </Card>



      </div>
    </section>
  )
}
