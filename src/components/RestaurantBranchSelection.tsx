import React from 'react';
import { MapPin, Check, ChevronRight, Building2 } from 'lucide-react';

const RestaurantBranchSelection = ({
                                       formData,
                                       restaurants,
                                       restaurantSearch,
                                       setRestaurantSearch,
                                       expandedRestaurants,
                                       showCitySelector,
                                       setShowCitySelector,
                                       onToggleRestaurantExpansion,
                                       onToggleBranchSelection,
                                       onSelectAllInCity,
                                       onDeselectAllInCity,
                                       getUniqueCities,
                                       getRestaurantsInCity,
                                       getUniqueRestaurants,
                                       getBranchesForRestaurant,
                                       isBranchSelected,
                                       isRestaurantExpanded,
                                       getRestaurantBranchesForRestaurant
                                   }) => {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Restaurant & Branch Selection</h3>
                        <p className="text-xs text-gray-600">Choose which locations this offer applies to</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Search Bar */}
                <div>
                    <input
                        type="text"
                        placeholder="Search restaurants..."
                        value={restaurantSearch}
                        onChange={(e) => setRestaurantSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Selected Summary */}
                {formData.RestaurantBranches.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800 mb-2">
                            Selected: {formData.RestaurantIds.length} restaurants, {formData.RestaurantBranches.length} branches
                        </p>
                        <div className="space-y-1">
                            {formData.offerType === 3 ? (
                                // City-based summary for order offers
                                Object.entries(
                                    formData.RestaurantBranches.reduce((acc, branch) => {
                                        const restaurant = restaurants.find(r =>
                                            r.id === branch.restaurantId && r.branchId === branch.branchId
                                        );
                                        const city = restaurant?.cityName || 'Unknown City';
                                        if (!acc[city]) acc[city] = 0;
                                        acc[city]++;
                                        return acc;
                                    }, {})
                                ).map(([city, count]) => (
                                    <div key={city} className="text-xs">
                                        <span className="font-medium text-blue-700">{city}: </span>
                                        <span className="text-blue-600">{parseInt(count as string, 10)} branches</span>
                                    </div>
                                ))
                            ) : (
                                // Restaurant-based summary for other offers
                                formData.RestaurantIds.map(restaurantId => {
                                    const restaurant = getUniqueRestaurants().find(r => r.id === restaurantId);
                                    const selectedBranches = getRestaurantBranchesForRestaurant(restaurantId);
                                    const totalBranches = getBranchesForRestaurant(restaurantId).length;

                                    return (
                                        <div key={restaurantId} className="text-xs">
                                            <span className="font-medium text-blue-700">
                                                {restaurant?.name || 'Unknown'}: 
                                            </span>
                                            <span className="text-blue-600 ml-1">
                                                {selectedBranches.length} of {totalBranches} branches
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* City Quick Select - For Order/Delivery Offers */}
                {(formData.offerType === 3 || formData.offerType === 4) && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-semibold text-orange-800">City-Wide Selection</h4>
                            <button
                                type="button"
                                onClick={() => setShowCitySelector(!showCitySelector)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    showCitySelector
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
                                }`}
                            >
                                {showCitySelector ? 'Hide Cities' : 'Show Cities'}
                            </button>
                        </div>

                        <p className="text-xs text-orange-700 mb-3">
                            Quickly select all restaurants in specific cities
                        </p>

                        {showCitySelector && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {getUniqueCities().map(city => {
                                    const cityRestaurants = getRestaurantsInCity(city);
                                    const totalBranches = cityRestaurants.length;
                                    const selectedBranches = cityRestaurants.filter(restaurant =>
                                        formData.RestaurantBranches.some(b =>
                                            b.restaurantId === restaurant.id && b.branchId === restaurant.branchId
                                        )
                                    ).length;

                                    const isFullySelected = selectedBranches === totalBranches && totalBranches > 0;
                                    const hasPartialSelection = selectedBranches > 0 && selectedBranches < totalBranches;

                                    return (
                                        <div key={city} className={`p-2 border rounded-lg ${
                                            isFullySelected ? 'bg-green-50 border-green-300' :
                                                hasPartialSelection ? 'bg-yellow-50 border-yellow-300' :
                                                    'bg-white border-gray-300'
                                        }`}>
                                            <div className="text-center mb-2">
                                                <div className="text-xs font-semibold">{city}</div>
                                                <div className="text-xs text-gray-600">
                                                    {totalBranches} branches
                                                </div>
                                                {selectedBranches > 0 && (
                                                    <div className="text-xs font-medium text-blue-600">
                                                        {selectedBranches}/{totalBranches}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onSelectAllInCity(city)}
                                                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                        isFullySelected
                                                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                            : 'bg-orange-600 text-white hover:bg-orange-700'
                                                    }`}
                                                    disabled={isFullySelected}
                                                >
                                                    {isFullySelected ? 'All Selected' : 'Select All'}
                                                </button>

                                                {selectedBranches > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeselectAllInCity(city)}
                                                        className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Restaurant List */}
                {restaurants.length === 0 ? (
                    <div className="border rounded-lg p-4 text-center text-gray-500">
                        <p>Loading restaurants...</p>
                    </div>
                ) : (
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                        {getUniqueRestaurants()
                            .filter(restaurant =>
                                !restaurantSearch ||
                                restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
                                (restaurant.nameEn && restaurant.nameEn.toLowerCase().includes(restaurantSearch.toLowerCase()))
                            )
                            .map(restaurant => {
                                const isExpanded = isRestaurantExpanded(restaurant.id);
                                const selectedBranches = getRestaurantBranchesForRestaurant(restaurant.id);
                                const totalBranches = restaurant.branches.length;

                                return (
                                    <div key={restaurant.id} className="border-b last:border-b-0">
                                        {/* Restaurant Header */}
                                        <div
                                            className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                selectedBranches.length > 0 ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
                                            }`}
                                            onClick={() => onToggleRestaurantExpansion(restaurant.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`transform transition-transform ${
                                                        isExpanded ? 'rotate-90' : 'rotate-0'
                                                    }`}>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-sm">{restaurant.name}</span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            ({totalBranches} branch{totalBranches !== 1 ? 'es' : ''})
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedBranches.length > 0 && (
                                                    <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                                                        {selectedBranches.length} selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Branches */}
                                        {isExpanded && (
                                            <div className="bg-gray-50">
                                                {restaurant.branches.map(branch => (
                                                    <div
                                                        key={branch.branchId}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleBranchSelection(restaurant.id, branch.branchId);
                                                        }}
                                                        className={`p-3 border-b cursor-pointer hover:bg-white transition-colors ml-6 ${
                                                            isBranchSelected(restaurant.id, branch.branchId)
                                                                ? 'bg-green-50 border-green-200'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isBranchSelected(restaurant.id, branch.branchId)}
                                                                    onChange={() => onToggleBranchSelection(restaurant.id, branch.branchId)}
                                                                    className="rounded"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <div>
                                                                    <span className="text-sm font-medium">
                                                                        {branch.branchName || 'Main Branch'}
                                                                    </span>
                                                                    {branch.cityName && (
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                            <MapPin className="w-3 h-3" />
                                                                            {branch.cityName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isBranchSelected(restaurant.id, branch.branchId) && (
                                                                <Check className="w-4 h-4 text-green-600" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantBranchSelection;