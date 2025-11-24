import CustomTooltip from '@/app/(company)/ranking/create/components/CustomTooltip'
import { TooltipMessage } from '@/app/(company)/ranking/create/components/TooltipMessage'
import { Input } from '@/app/components/ui/input';
import React from 'react'

interface Props {
    title: string;
    tipTitle: string;
    tipMessage: string;
    count: number;
    countPlaceholder: string;
    setCount: (value: number) => void;
    unit?: string;
    unitPlaceholder?: string;
    setUnit?: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}

export default function OperationsDelayReusableInput({ 
    title, 
    tipTitle, 
    tipMessage, 
    count, 
    countPlaceholder, 
    unit, 
    unitPlaceholder, 
    setUnit, 
    setCount,
    disabled = false,
    required = false,
    error
}: Props) {
    
    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty or numeric values only
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            const numValue = value === '' ? 0 : parseFloat(value);
            setCount(numValue);
        }
    }

    const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUnit?.(e.target.value);
    }

    return (
        <div className='space-y-2'>
            <div className='flex items-center gap-1'>
                <label className='text-sm font-medium'>
                    {title}
                    {required && <span className='text-red-500 ml-1'>*</span>}
                </label>
                {tipTitle && tipMessage && (
                    <CustomTooltip detail={<TooltipMessage title={tipTitle} message={tipMessage} />} />
                )}
            </div>
            
            <div className="grid grid-cols-3 bg-gray-100 rounded-md p-3 gap-3 border border-gray-200 focus-within:border-blue-500 focus-within:bg-blue-50 transition-colors">
                {/* <label> Count </label> */}
                <div className="flex flex-col w-full col-span-2">
                    <label className='text-gray-400'> Count </label>
                    <Input 
                    className='col-span-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    type="number"
                    value={count === 0 ? '' : count}Communit
                    onChange={handleCountChange}
                    placeholder={countPlaceholder}
                    disabled={disabled}
                    min="0"
                    step="0.1"
                />
                </div>
                {/* <label> Unit </label> */}
                <div className="flex flex-col w-full col-span-1">
                 <label className='text-gray-400'> Unit </label>
                <Input 
                    className='col-span-1'
                    value={unit || ''}
                    placeholder={unitPlaceholder}
                    onChange={handleUnitChange}
                    disabled={disabled}
                />
                </div>
            </div>
            
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    )
}