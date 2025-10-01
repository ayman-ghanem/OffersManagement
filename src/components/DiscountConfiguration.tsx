import React from 'react';

const DiscountConfiguration = ({ formData, shouldShowField, onInputChange }) => {
    if (![1, 2].includes(formData.discountType)) {
        return null;
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
                Discount Configuration
            </label>

            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Discount Value */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Discount Value <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => onInputChange('discountValue', e.target.value)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                min="1"
                                step="1"
                                placeholder={formData.discountType === 1 ? "20" : "10"}
                                required
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                                {formData.discountType === 1 ? '%' : 'شيقل'}
                            </span>
                        </div>
                    </div>

                    {/* Max Discount (Percentage only) */}
                    {shouldShowField('maxDiscountAmount', formData.offerType, formData.discountType) && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Max Discount Cap
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.maxDiscountAmount}
                                    onChange={(e) => onInputChange('maxDiscountAmount', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                    min="0"
                                    step="1"
                                    placeholder="Optional"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                                    شيقل
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Min Order Amount */}
                    {shouldShowField('minOrderAmount', formData.offerType, formData.discountType) && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Min Order Amount
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => onInputChange('minOrderAmount', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                    min="0"
                                    step="1"
                                    placeholder="Optional"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                                    شيقل
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Calculation Preview */}
                {formData.discountValue && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-900">
                            <span className="font-semibold">Preview:</span>
                            {formData.discountType === 1 ? (
                                <span> Customer saves {formData.discountValue}%
                                    {formData.maxDiscountAmount && ` (up to ${formData.maxDiscountAmount} شيقل)`}
                                    {formData.minOrderAmount && ` on orders above ${formData.minOrderAmount} شيقل`}
                                </span>
                            ) : (
                                <span> Customer saves {formData.discountValue} شيقل
                                    {formData.minOrderAmount && ` on orders above ${formData.minOrderAmount} شيقل`}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscountConfiguration;