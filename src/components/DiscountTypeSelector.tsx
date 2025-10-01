import React from 'react';
import { Check, Percent, DollarSign } from 'lucide-react';

const DiscountTypeSelector = ({ formData, discountTypes, compatibleTypes, onDiscountTypeChange }) => {
    const filteredDiscountTypes = discountTypes.filter(type =>
        compatibleTypes.includes(type.value)
    );

    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
                Discount Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
                {filteredDiscountTypes.map(type => {
                    const isSelected = formData.discountType === type.value;

                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => onDiscountTypeChange(type.value)}
                            className={`
                                relative p-3 rounded-lg border transition-all text-left
                                ${isSelected
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-sm'
                            }
                            `}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isSelected ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                    <div className={`${isSelected ? 'text-green-600' : 'text-gray-500'} [&>svg]:w-4 [&>svg]:h-4`}>
                                        {type.icon}
                                    </div>
                                </div>
                                <div className={`text-xs font-semibold ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                                    {type.label}
                                </div>
                            </div>

                            <div className={`text-xs px-2 py-1 rounded ${
                                isSelected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {type.value === 1 && 'e.g., 20% off'}
                                {type.value === 2 && 'e.g., 10 شيقل off'}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DiscountTypeSelector;