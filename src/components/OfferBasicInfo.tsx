import React from 'react';
import { FileText } from 'lucide-react';

const OfferBasicInfo = ({ formData, onInputChange }) => {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                        <p className="text-xs text-gray-600">Offer name and description in both languages</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Offer Name (Arabic) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => onInputChange('name', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="اسم العرض"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Primary display name for customers</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Offer Name (English)
                        </label>
                        <input
                            type="text"
                            value={formData.nameEn}
                            onChange={(e) => onInputChange('nameEn', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Offer Name"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional English translation</p>
                    </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description (Arabic)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => onInputChange('description', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-20 resize-none"
                            placeholder="وصف العرض..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Brief description of the offer</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description (English)
                        </label>
                        <textarea
                            value={formData.descriptionEn}
                            onChange={(e) => onInputChange('descriptionEn', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-20 resize-none"
                            placeholder="Offer description..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional English translation</p>
                    </div>
                </div>

                {/* Preview */}
                {formData.name && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-900">
                            <span className="font-semibold">Preview:</span> {formData.name}
                            {formData.nameEn && <span className="text-blue-700"> • {formData.nameEn}</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfferBasicInfo;