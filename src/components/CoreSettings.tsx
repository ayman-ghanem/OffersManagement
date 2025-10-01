import React from 'react';
import { Clock, Target, Award, Settings, Layers, Zap, Check } from 'lucide-react';

const CoreSettings = ({ formData, shouldShowField, onInputChange }) => {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Core Settings</h3>
                        <p className="text-xs text-gray-600">Configure scheduling, usage limits, and options</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* Date Range Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Offer Duration</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => onInputChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">When offer becomes active</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => onInputChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">When offer expires</p>
                        </div>
                    </div>

                    {/* Date validation */}
                    {formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate) && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-red-600 font-bold text-xs">!</span>
                            </div>
                            <p className="text-xs text-red-700">End date must be after start date</p>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Usage Limits */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Usage Limits</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Max Uses per User
                            </label>
                            <input
                                type="number"
                                value={formData.maxUsagePerUser}
                                onChange={(e) => onInputChange('maxUsagePerUser', e.target.value)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                min="0"
                                placeholder="Unlimited"
                            />
                            <p className="text-xs text-gray-500 mt-1">Per customer (0 = unlimited)</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Max Total Uses
                            </label>
                            <input
                                type="number"
                                value={formData.maxUsageTotal}
                                onChange={(e) => onInputChange('maxUsageTotal', e.target.value)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                min="0"
                                placeholder="Unlimited"
                            />
                            <p className="text-xs text-gray-500 mt-1">Total redemptions allowed</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Wheels Contribution
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.wheelsContribution}
                                    onChange={(e) => onInputChange('wheelsContribution', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all pr-8"
                                    min="0"
                                    step="0.01"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                                    %
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Platform contribution</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Advanced Options */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Advanced Options</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {shouldShowField('priority', formData.offerType, formData.discountType) && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Priority Level
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => onInputChange('priority', Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                                >
                                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                        <option key={num} value={num}>
                                            Priority {num} {num === 10 ? '(Highest)' : num === 1 ? '(Lowest)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Higher applies first when stacking</p>
                            </div>
                        )}

                        {shouldShowField('minItemQuantity', formData.offerType, formData.discountType) && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Min Item Quantity
                                </label>
                                <input
                                    type="number"
                                    value={formData.minItemQuantity}
                                    onChange={(e) => onInputChange('minItemQuantity', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                    min="0"
                                    placeholder="No minimum"
                                />
                                <p className="text-xs text-gray-500 mt-1">Min items to apply offer</p>
                            </div>
                        )}
                    </div>

                    {/* Toggle Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {shouldShowField('isStackable', formData.offerType, formData.discountType) && (
                            <div
                                onClick={() => onInputChange('isStackable', !formData.isStackable)}
                                className={`
                                    p-3 rounded-lg border-2 cursor-pointer transition-all
                                    ${formData.isStackable
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center
                                            ${formData.isStackable ? 'bg-green-100' : 'bg-gray-200'}
                                        `}>
                                            <Layers className={`w-4 h-4 ${formData.isStackable ? 'text-green-600' : 'text-gray-500'}`} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-900">Allow Stacking</div>
                                            <div className="text-xs text-gray-600">Combine with other offers</div>
                                        </div>
                                    </div>
                                    <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                                        ${formData.isStackable
                                        ? 'border-green-500 bg-green-500'
                                        : 'border-gray-300 bg-white'
                                    }
                                    `}>
                                        {formData.isStackable && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div
                            onClick={() => onInputChange('channelOffer', !formData.channelOffer)}
                            className={`
                                p-3 rounded-lg border-2 cursor-pointer transition-all
                                ${formData.channelOffer
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center
                                        ${formData.channelOffer ? 'bg-indigo-100' : 'bg-gray-200'}
                                    `}>
                                        <Zap className={`w-4 h-4 ${formData.channelOffer ? 'text-indigo-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">Channel Offer</div>
                                        <div className="text-xs text-gray-600">Special channel promotion</div>
                                    </div>
                                </div>
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${formData.channelOffer
                                    ? 'border-indigo-500 bg-indigo-500'
                                    : 'border-gray-300 bg-white'
                                }
                                `}>
                                    {formData.channelOffer && <Check className="w-3 h-3 text-white" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            {(formData.startDate || formData.endDate || formData.maxUsageTotal || formData.maxUsagePerUser) && (
                <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
                    <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 font-bold text-xs">i</span>
                        </div>
                        <div className="text-xs text-gray-700">
                            <span className="font-semibold">Summary:</span>
                            <div className="mt-1 space-y-0.5">
                                {formData.startDate && formData.endDate && (
                                    <div>Active: {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</div>
                                )}
                                {formData.maxUsagePerUser && <div>Max {formData.maxUsagePerUser} uses per customer</div>}
                                {formData.maxUsageTotal && <div>Max {formData.maxUsageTotal} total redemptions</div>}
                                {formData.isStackable && <div className="text-green-600">Can stack with other offers</div>}
                                {formData.channelOffer && <div className="text-indigo-600">Channel-specific offer</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoreSettings;