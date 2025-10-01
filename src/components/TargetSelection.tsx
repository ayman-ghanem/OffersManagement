import React from 'react';
import { Tag, Target, Search, Check, X } from 'lucide-react';

const TargetSelection = ({
                             formData,
                             products,
                             categories,
                             productSearch,
                             setProductSearch,
                             onToggleTarget,
                             getFilteredProductsByRestaurants
                         }) => {
    // Determine if showing products or categories
    const isProductTarget = formData.offerType === 1;
    const targetType = isProductTarget ? 'Products' : 'Categories';
    const IconComponent = isProductTarget ? Tag : Target;

    // Get filtered items
    const filteredItems = getFilteredProductsByRestaurants();

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Select {targetType}
                        </h3>
                        <p className="text-xs text-gray-600">
                            Choose which {targetType.toLowerCase()} this offer applies to
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Restaurant Filter Status */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs">
                        <span className="font-semibold text-blue-800">Restaurant Filter:</span>
                        {formData.RestaurantIds.length > 0 ? (
                            <div className="mt-1 text-blue-700">
                                Showing {targetType.toLowerCase()} from {formData.RestaurantIds.length} selected restaurant{formData.RestaurantIds.length !== 1 ? 's' : ''}
                            </div>
                        ) : (
                            <div className="mt-1 text-orange-700">
                                ⚠️ Select restaurants above first to see available {targetType.toLowerCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${targetType.toLowerCase()}...`}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Selected Items Summary */}
                {formData.Targets?.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-green-800">
                                Selected {targetType} ({formData.Targets.length})
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    // Clear all selections
                                    formData.Targets.forEach(id => onToggleTarget(id));
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.Targets.map(targetId => {
                                const item = (isProductTarget ? products : categories).find(i => i.id === targetId);
                                return (
                                    <span
                                        key={targetId}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs"
                                    >
                                        <span className="font-medium">{item ? item.name : `ID: ${targetId}`}</span>
                                        {isProductTarget && item?.price && (
                                            <span className="text-green-600">• {item.price} شيقل</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => onToggleTarget(targetId)}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Items List */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                        {filteredItems.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <IconComponent className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">
                                    {formData.RestaurantIds.length === 0
                                        ? `Select restaurants above to see ${targetType.toLowerCase()}`
                                        : productSearch
                                            ? `No ${targetType.toLowerCase()} found matching "${productSearch}"`
                                            : `No ${targetType.toLowerCase()} available for selected restaurants`
                                    }
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Total available: {isProductTarget ? products.length : categories.length} items
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredItems.map(item => {
                                    const isSelected = formData.Targets.includes(item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => onToggleTarget(item.id)}
                                            className={`p-3 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {/* Checkbox */}
                                                    <div className={`
                                                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                                        ${isSelected
                                                        ? 'border-green-500 bg-green-500'
                                                        : 'border-gray-300 bg-white'
                                                    }
                                                    `}>
                                                        {isSelected && (
                                                            <Check className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>

                                                    {/* Item Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {item.name}
                                                            </span>
                                                            {item.nameEn && (
                                                                <span className="text-xs text-gray-500">
                                                                    • {item.nameEn}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {/* Restaurant */}
                                                            <span className="text-xs text-gray-500">
                                                                {item.restaurantName || `Restaurant: ${item.restaurantId}`}
                                                            </span>

                                                            {/* Price for products */}
                                                            {isProductTarget && item.price && (
                                                                <>
                                                                    <span className="text-xs text-gray-400">•</span>
                                                                    <span className="text-xs font-medium text-green-600">
                                                                        {item.price} شيقل
                                                                    </span>
                                                                </>
                                                            )}

                                                            {/* Category name for products */}
                                                            {isProductTarget && item.categoryId && (
                                                                <>
                                                                    <span className="text-xs text-gray-400">•</span>
                                                                    <span className="text-xs text-purple-600">
                                                                        {categories.find(c => c.id === item.categoryId)?.name || 'Category'}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Selection Indicator */}
                                                {isSelected && (
                                                    <div className="ml-2">
                                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Footer */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-gray-600 font-bold text-xs">i</span>
                        </div>
                        <div className="text-xs text-gray-600">
                            {isProductTarget ? (
                                <>
                                    <span className="font-semibold">Tip:</span> Select specific products that should receive the discount.
                                    Customers will see the discount applied only to these items in their cart.
                                </>
                            ) : (
                                <>
                                    <span className="font-semibold">Tip:</span> Select product categories for the discount.
                                    All products within the selected categories will automatically receive the discount.
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TargetSelection;