import React from 'react';
import { Check, Tag, Target, DollarSign } from 'lucide-react';

const OfferTypeSelector = ({ formData, offerTypes, onOfferTypeChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
                Offer Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
                {offerTypes.map(type => {
                    const isSelected = formData.offerType === type.value;
                    const isEnabled = type.enabled !== false;

                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => isEnabled && onOfferTypeChange(type.value)}
                            disabled={!isEnabled}
                            className={`
                                relative p-3 rounded-lg border transition-all text-left
                                ${!isEnabled
                                ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                                : isSelected
                                    ? 'border-red-500 bg-red-50 shadow-md'
                                    : 'border-gray-300 bg-white hover:border-red-300 hover:shadow-sm'
                            }
                            `}
                        >
                            {isEnabled && isSelected && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}

                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                                isSelected ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                                <div className={`${isSelected ? 'text-red-600' : 'text-gray-500'} [&>svg]:w-4 [&>svg]:h-4`}>
                                    {type.icon}
                                </div>
                            </div>

                            <div className={`text-xs font-semibold mb-1 ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>
                                {type.label}
                            </div>
                            <div className={`text-xs leading-tight ${isSelected ? 'text-red-700' : 'text-gray-600'}`}>
                                {type.description}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default OfferTypeSelector;