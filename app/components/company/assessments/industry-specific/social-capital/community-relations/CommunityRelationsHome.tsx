import Header from '@/app/components/layout/Header'
import { Card } from '@/app/components/ui/card'
import { CustomBreadcrumb } from '@/app/components/ui/CustomBreadcrumb'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useAssessment } from '@/hooks/useAssessment'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'


interface Props {
    onBack?: () => void;
}
export default function CommunityRelationsHome({ onBack }: Props) {
    const items = [
        { label: 'Disclosure topics', href: '/assessments/hub' },
        { label: 'Community Relations', href: '/company/assessments/industry-specific/social-capital/community-relations' },]

    const router = useRouter();
    const { state, dispatch } = useAssessment();
    const { user } = useAuth();

    return (
        <section className='min-h-screen bg-green-50 p-6'>
            <div className="flex flex-row md:flex-col md:justify-between w-full">


                <Button
                    className="mb-3 text-sm flex gap-1 text-gray-800 shadow rounded px-4 py-2 w-fit bg-white hover:bg-gray-100 cursor-pointer"
                    onClick={onBack ? onBack : () => router.push('/assessments/hub')}
                >
                    <ArrowLeft size={18} /> <span className="text-sm">Back</span>
                </Button>
                <Card className="w-full p-6 flex flex-col bg-white rounded-md shadow-md">
                    
                </Card>
                    


            </div>
        </section>
    )
}
