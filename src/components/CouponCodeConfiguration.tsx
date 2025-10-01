import React from 'react';
import { Tag, Check } from 'lucide-react';

const CouponCodeConfiguration = ({ formData, onInputChange }) => {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Coupon Code</h3>
                        <p className="text-xs text-gray-600">Optional code requirement for this offer</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Enable Coupon Toggle */}
                <div
                    onClick={() => onInputChange('requiresCouponCode', !formData.requiresCouponCode)}
                    className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${formData.requiresCouponCode
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center
                                ${formData.requiresCouponCode ? 'bg-purple-100' : 'bg-gray-200'}
                            `}>
                                <Tag className={`w-5 h-5 ${formData.requiresCouponCode ? 'text-purple-600' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Require Coupon Code</div>
                                <div className="text-xs text-gray-600">Customers must enter a code to use this offer</div>
                            </div>
                        </div>
                        <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${formData.requiresCouponCode
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300 bg-white'
                        }
                        `}>
                            {formData.requiresCouponCode && (
                                <Check className="w-4 h-4 text-white" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Coupon Code Input */}
                {formData.requiresCouponCode && (
                    <div className="space-y-3 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coupon Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.couponCode}
                                onChange={(e) => onInputChange('couponCode', e.target.value.toUpperCase())}
                                className="w-full px-4 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono text-base uppercase tracking-wider"
                                placeholder="e.g., SAVE20"
                                maxLength={20}
                            />
                            <p className="mt-2 text-xs text-gray-600">
                                Enter a unique code that customers will use. Code will be automatically converted to uppercase.
                            </p>
                        </div>

                        {/* Code Preview */}
                        {formData.couponCode && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-purple-800">Code Preview</span>
                                    <span className="text-xs text-purple-600">{formData.couponCode.length}/20</span>
                                </div>
                                <div className="bg-white border-2 border-purple-300 rounded-lg p-3 text-center">
                                    <div className="font-mono text-2xl font-bold text-purple-600 tracking-widest">
                                        {formData.couponCode}
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-purple-700">
                                    Customers will enter this code at checkout to activate the offer
                                </p>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 font-bold text-xs">i</span>
                                </div>
                                <div className="text-xs text-blue-700">
                                    <span className="font-semibold">Tips for good codes:</span>
                                    <ul className="mt-1 space-y-0.5 ml-2">
                                        <li>• Keep it short and memorable (6-10 characters)</li>
                                        <li>• Make it descriptive (e.g., SUMMER20, WELCOME10)</li>
                                        <li>• Avoid confusing characters (0/O, 1/I, etc.)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* When disabled */}
                {!formData.requiresCouponCode && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-xs text-gray-600">
                            This offer will be automatically applied to eligible orders without requiring a coupon code.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponCodeConfiguration;