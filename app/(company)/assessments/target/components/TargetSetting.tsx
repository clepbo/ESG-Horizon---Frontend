'use client';

import { GeneralTargetData, TargetType } from '@/types/target';
import { useState } from 'react';
import { GeneralTargetForm } from './GeneralSetTarget';
import { TargetTypeSelector } from './TargetTypeSelector';
import SetTargetByScope from './SetTargetByScope';


export function TargetSetting() {
  const [selectedType, setSelectedType] = useState<TargetType>('general');
  const [generalTargetData, setGeneralTargetData] = useState<GeneralTargetData>({
    reductionPercentage: null,
    baselineYear: null,
    targetYear: null,
    description: '',
    targetEmission: null,
    totalReduction: null,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          <TargetTypeSelector 
            selectedType={selectedType} 
            onTypeChange={setSelectedType} 
          />
          
          {selectedType === 'general' && (
            <GeneralTargetForm 
              data={generalTargetData}
              onChange={setGeneralTargetData}
              
            />
          )}
          
          {selectedType === 'scope' && (
            <div className="text-center py-12 text-gray-500">
              <SetTargetByScope />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}