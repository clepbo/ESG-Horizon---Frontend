import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { CustomButton } from '@/app/components/ui/reusables/CustomButton'
import { useFormattedNumber } from '@/hooks/useNumberFormater'
import { GeneralTargetData } from '@/types/target'
import { useEffect, useState } from 'react'
import { FaCaretRight } from 'react-icons/fa'
import { years } from './StepOne'


export default function SetTargetByScope() {
  const [scopeTargetData, setScopeTargetData] = useState<GeneralTargetData>({
    reductionPercentage: null,
    baselineYear: null,
    targetYear: null,
    description: '',
    targetEmission: null,
    totalReduction: null,
  });

  // Use the formatting hook for targetEmission
  const targetEmissionFormatter = useFormattedNumber(scopeTargetData.targetEmission || "");

  const handleInputChange = (field: keyof GeneralTargetData, value: string | number) => {
    let processedValue: any = value;
    
    if (field === 'reductionPercentage') {
      processedValue = value === '' ? null : Number(value);
      // Auto-calculate target emission when percentage changes
      if (processedValue !== null && scopeTargetData.baselineYear && scopeTargetData.targetYear) {
        const baselineEmission = 26830; // Fixed baseline from image
        const targetEmission = baselineEmission * (1 - processedValue / 100);
        const totalReduction = baselineEmission - targetEmission;
        
        setScopeTargetData(prev => ({
          ...prev,
          reductionPercentage: processedValue,
          targetEmission: Math.round(targetEmission),
          totalReduction: Math.round(totalReduction)
        }));
        return;
      }
    }
    
    if (field === 'baselineYear' || field === 'targetYear') {
      processedValue = value === '' ? null : Number(value);
    }

    // Handle targetEmission changes from formatted input
    if (field === 'targetEmission') {
      processedValue = value === '' ? null : Number(value);
    }

    setScopeTargetData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  // Handle the formatted target emission input specifically
  const handleTargetEmissionChange = (inputValue: string) => {
    targetEmissionFormatter.handleChange(inputValue);
    
    // Update the actual data with the raw numeric value
    const numericValue = targetEmissionFormatter.rawValue === '' ? null : Number(targetEmissionFormatter.rawValue);
    setScopeTargetData(prev => ({
      ...prev,
      targetEmission: numericValue
    }));
  };

  // Sync the formatter when data changes externally
  useEffect(() => {
    if (scopeTargetData.targetEmission !== Number(targetEmissionFormatter.rawValue)) {
      targetEmissionFormatter.setRawValue(String(scopeTargetData.targetEmission || ""));
    }
  }, [scopeTargetData.targetEmission]);

  return (
    <div className="space-y-6 text-left">
      <Card>
        <CardHeader className=''>
          <CardTitle className="text-lg text-left font-normal">Scope 1 Target </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600 text-left">
            Direct emissions from owned or controlled sources
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reductionPercentage">Reduction Percentage (%)</Label>
              <Input
                id="reductionPercentage"
                type="number"
                placeholder="e.g. 30"
                value={scopeTargetData.reductionPercentage ?? ''}
                onChange={(e) => handleInputChange('reductionPercentage', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baselineYear">Baseline Year</Label>
              <select
                id="baselineYear"
                value={scopeTargetData.baselineYear ?? ''}
                onChange={(e) => handleInputChange('baselineYear', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetYear">Target Year</Label>
              <select
                id="targetYear"
                value={scopeTargetData.targetYear ?? ''}
                onChange={(e) => handleInputChange('targetYear', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your scope-based reduction strategy..."
              value={scopeTargetData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
 
             <div className="flex flex-col w-full gap-2 justify-end">
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label>Baseline (2024):</Label>
                          <div className="text-sm text-gray-900 font-semibold">26,830 tCO₂e</div>
                        </div>
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label>Target (2030):</Label>
                          <div className="text-sm text-primary font-semibold">26,830 tCO₂e</div>
                        </div>
                        <hr className="text-gray-300"/>
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label >Total:</Label>
                          <div className="text-sm text-red-500 font-semibold">26,830 tCO₂e</div>
                        </div>
                        
                      </div>
            
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className=''>
          <CardTitle className="text-lg text-left font-normal">Scope 2 Target </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600 text-left">
            Indirect emissions from purchased energy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reductionPercentage">Reduction Percentage (%)</Label>
              <Input
                id="reductionPercentage"
                type="number"
                placeholder="e.g. 30"
                value={scopeTargetData.reductionPercentage ?? ''}
                onChange={(e) => handleInputChange('reductionPercentage', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baselineYear">Baseline Year</Label>
              <select
                id="baselineYear"
                value={scopeTargetData.baselineYear ?? ''}
                onChange={(e) => handleInputChange('baselineYear', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetYear">Target Year</Label>
              <select
                id="targetYear"
                value={scopeTargetData.targetYear ?? ''}
                onChange={(e) => handleInputChange('targetYear', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your scope-based reduction strategy..."
              value={scopeTargetData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
 
             <div className="flex flex-col w-full gap-2 justify-end">
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label>Baseline (2024):</Label>
                          <div className="text-sm text-gray-900 font-semibold">26,830 tCO₂e</div>
                        </div>
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label>Target (2030):</Label>
                          <div className="text-sm text-primary font-semibold">26,830 tCO₂e</div>
                        </div>
                        <hr className="text-gray-300"/>
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label >Total:</Label>
                          <div className="text-sm text-red-500 font-semibold">26,830 tCO₂e</div>
                        </div>
                        
                      </div>
            
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className=''>
          <CardTitle className="text-lg text-left font-normal">Scope 3 Target </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600 text-left">
            All othr indirect emissions in the value chain.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reductionPercentage">Reduction Percentage (%)</Label>
              <Input
                id="reductionPercentage"
                type="number"
                placeholder="e.g. 30"
                value={scopeTargetData.reductionPercentage ?? ''}
                onChange={(e) => handleInputChange('reductionPercentage', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baselineYear">Baseline Year</Label>
              <select
                id="baselineYear"
                value={scopeTargetData.baselineYear ?? ''}
                onChange={(e) => handleInputChange('baselineYear', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetYear">Target Year</Label>
              <select
                id="targetYear"
                value={scopeTargetData.targetYear ?? ''}
                onChange={(e) => handleInputChange('targetYear', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your scope-based reduction strategy..."
              value={scopeTargetData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
 
             <div className="flex flex-col w-full gap-2 justify-end">
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label>Baseline (2024):</Label>
                          <div className="text-sm text-gray-900 font-semibold">26,830 tCO₂e</div>
                        </div>
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label>Target (2030):</Label>
                          <div className="text-sm text-primary font-semibold">26,830 tCO₂e</div>
                        </div>
                        <hr className="text-gray-300"/>
                        <div className="space-y-2 flex items-center justify-between w-full">
                          <Label >Total:</Label>
                          <div className="text-sm text-red-500 font-semibold">26,830 tCO₂e</div>
                        </div>
                        
                      </div>
            
          </div>
        </CardContent>
      </Card>


      <div className="flex justify-center">
        <CustomButton icon={<FaCaretRight />} className="text-white px-6 py-2">
          Continue
        </CustomButton>
      </div>
    </div>
  )
}