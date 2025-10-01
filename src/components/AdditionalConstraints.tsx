import React from 'react';
import { Users, Clock, Shield } from 'lucide-react';

const AdditionalConstraints = ({ formData, userTiers, daysOfWeek, onInputChange, onMultiSelect }) => {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Additional Constraints</h3>
                        <p className="text-xs text-gray-600">Optional restrictions for when and who can use this offer</p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* User Constraints */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <Users className="w-4 h-4 text-green-600" />
                            <h4 className="text-sm font-semibold text-gray-900">Customer Requirements</h4>
                        </div>

                        {/* First Order Only */}
                        <div
                            onClick={() => onInputChange('isFirstOrderOnly', !formData.isFirstOrderOnly)}
                            className={`
                                p-3 rounded-lg border-2 cursor-pointer transition-all
                                ${formData.isFirstOrderOnly
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center
                                        ${formData.isFirstOrderOnly ? 'bg-green-100' : 'bg-gray-200'}
                                    `}>
                                        <Users className={`w-4 h-4 ${formData.isFirstOrderOnly ? 'text-green-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">First-time Customers</div>
                                        <div className="text-xs text-gray-600">New customers only</div>
                                    </div>
                                </div>
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                    ${formData.isFirstOrderOnly
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-300 bg-white'
                                }
                                `}>
                                    {formData.isFirstOrderOnly && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Loyalty Tiers */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Loyalty Tier Restrictions
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {userTiers.map(tier => (
                                    <label
                                        key={tier}
                                        className={`
                                            flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-all
                                            ${formData.userTiers.includes(tier)
                                            ? 'bg-green-100 border-2 border-green-500 text-green-800'
                                            : 'bg-gray-50 border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                                        }
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.userTiers.includes(tier)}
                                            onChange={() => onMultiSelect('userTiers', tier)}
                                            className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="font-medium">{tier}</span>
                                    </label>
                                ))}
                            </div>
                            {formData.userTiers.length > 0 && (
                                <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                                    Available to: {formData.userTiers.join(', ')} members
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time Constraints */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-gray-900">Time Restrictions</h4>
                        </div>

                        {/* Days of Week */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Specific Days Only
                            </label>
                            <div className="grid grid-cols-4 gap-1">
                                {daysOfWeek.map(day => (
                                    <label
                                        key={day}
                                        className={`
                                            flex items-center justify-center gap-1 p-2 rounded-lg text-xs cursor-pointer transition-all
                                            ${formData.dayOfWeek.includes(day)
                                            ? 'bg-blue-100 border-2 border-blue-500 text-blue-800'
                                            : 'bg-gray-50 border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                                        }
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.dayOfWeek.includes(day)}
                                            onChange={() => onMultiSelect('dayOfWeek', day)}
                                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="font-semibold">{day.substring(0, 3)}</span>
                                    </label>
                                ))}
                            </div>
                            {formData.dayOfWeek.length > 0 && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                    Active on: {formData.dayOfWeek.join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Time Range */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Time Window
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={formData.startTime || ''}
                                        onChange={(e) => onInputChange('startTime', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={formData.endTime || ''}
                                        onChange={(e) => onInputChange('endTime', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            {formData.startTime && formData.endTime && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                    Active: {formData.startTime} - {formData.endTime}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Constraints Summary */}
                {(formData.isFirstOrderOnly || formData.userTiers.length > 0 ||
                    formData.dayOfWeek.length > 0 || (formData.startTime && formData.endTime)) && (
                    <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <h5 className="text-xs font-semibold text-amber-800 mb-2">
                            Active Constraints:
                        </h5>
                        <div className="text-xs text-amber-700 space-y-1">
                            {formData.isFirstOrderOnly && (
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                                    First-time customers only
                                </div>
                            )}
                            {formData.userTiers.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                                    Loyalty tiers: {formData.userTiers.join(', ')}
                                </div>
                            )}
                            {formData.dayOfWeek.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                                    Days: {formData.dayOfWeek.join(', ')}
                                </div>
                            )}
                            {formData.startTime && formData.endTime && (
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                                    Time: {formData.startTime} - {formData.endTime}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdditionalConstraints;