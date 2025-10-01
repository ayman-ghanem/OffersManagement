import React from 'react';
import { Check, DollarSign, Tag, MapPin, Settings } from 'lucide-react';

const DiscountApplicationScope = ({ formData, onInputChange }) => {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Discount Application Scope
                    </h3>
                    <p className="text-sm text-gray-600">
                        Select where this discount should be applied in the customer's order
                    </p>
                </div>
            </div>

            {/* Visual Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Order/Items Card */}
                <div
                    onClick={() => onInputChange('applyToOrderSubtotal', !formData.applyToOrderSubtotal)}
                    className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${formData.applyToOrderSubtotal
                        ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm'
                    }
                    `}
                >
                    <div className="absolute top-3 right-3">
                        <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${formData.applyToOrderSubtotal
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 bg-white'
                        }
                        `}>
                            {formData.applyToOrderSubtotal && (
                                <Check className="w-4 h-4 text-white" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                        <div className={`
                            w-12 h-12 rounded-lg flex items-center justify-center
                            ${formData.applyToOrderSubtotal ? 'bg-blue-100' : 'bg-gray-100'}
                        `}>
                            {([1, 2].includes(formData.offerType)) ? (
                                <Tag className={`w-6 h-6 ${formData.applyToOrderSubtotal ? 'text-blue-600' : 'text-gray-400'}`} />
                            ) : (
                                <DollarSign className={`w-6 h-6 ${formData.applyToOrderSubtotal ? 'text-blue-600' : 'text-gray-400'}`} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-semibold mb-1 ${formData.applyToOrderSubtotal ? 'text-blue-900' : 'text-gray-700'}`}>
                                {([1, 2].includes(formData.offerType)) ? 'Selected Items' : 'Order Subtotal'}
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {([1, 2].includes(formData.offerType))
                                    ? 'Discount applies only to the selected products or categories'
                                    : 'Discount applies to all items in the order (excluding delivery)'
                                }
                            </p>
                        </div>
                    </div>

                    <div className={`
                        mt-3 p-2 rounded-lg text-xs
                        ${formData.applyToOrderSubtotal ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                    `}>
                        <span className="font-medium">Example:</span>
                        {([1, 2].includes(formData.offerType))
                            ? ' 20% off on selected pizza items only'
                            : ' 15% off entire order (items total)'
                        }
                    </div>
                </div>

                {/* Delivery Fee Card */}
                <div
                    onClick={() => onInputChange('applyToDeliveryFee', !formData.applyToDeliveryFee)}
                    className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${formData.applyToDeliveryFee
                        ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                        : 'border-gray-300 bg-white hover:border-purple-300 hover:shadow-sm'
                    }
                    `}
                >
                    <div className="absolute top-3 right-3">
                        <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${formData.applyToDeliveryFee
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300 bg-white'
                        }
                        `}>
                            {formData.applyToDeliveryFee && (
                                <Check className="w-4 h-4 text-white" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                        <div className={`
                            w-12 h-12 rounded-lg flex items-center justify-center
                            ${formData.applyToDeliveryFee ? 'bg-purple-100' : 'bg-gray-100'}
                        `}>
                            <MapPin className={`w-6 h-6 ${formData.applyToDeliveryFee ? 'text-purple-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-semibold mb-1 ${formData.applyToDeliveryFee ? 'text-purple-900' : 'text-gray-700'}`}>
                                Delivery Fee
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Discount also applies to the delivery charges
                            </p>
                        </div>
                    </div>

                    <div className={`
                        mt-3 p-2 rounded-lg text-xs
                        ${formData.applyToDeliveryFee ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}
                    `}>
                        <span className="font-medium">Example:</span> Free delivery or 50% off delivery fee
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-2">
                {!formData.applyToOrderSubtotal && !formData.applyToDeliveryFee && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-600 font-bold text-xs">!</span>
                        </div>
                        <div className="text-sm text-red-700">
                            <span className="font-semibold">Selection Required:</span> You must select at least one application target for the discount to work.
                        </div>
                    </div>
                )}

                {formData.applyToOrderSubtotal && !formData.applyToDeliveryFee && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            This discount applies to <span className="font-semibold">
                                {([1, 2].includes(formData.offerType)) ? 'selected items' : 'order items'} only
                            </span> (delivery fee not discounted)
                        </div>
                    </div>
                )}

                {!formData.applyToOrderSubtotal && formData.applyToDeliveryFee && (
                    <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-purple-700">
                            This discount applies to <span className="font-semibold">delivery fee only</span> (order items not discounted)
                        </div>
                    </div>
                )}

                {formData.applyToOrderSubtotal && formData.applyToDeliveryFee && (
                    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-indigo-200 rounded-lg">
                        <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-indigo-600" />
                        </div>
                        <div className="text-sm text-indigo-700">
                            <span className="font-semibold">Comprehensive Discount:</span> This offer applies to both order items and delivery fee for maximum savings
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-bold text-xs">i</span>
                    </div>
                    <div className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-700">Tip:</span> You can select both options to create a comprehensive offer that maximizes customer value and incentivizes larger orders.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscountApplicationScope;