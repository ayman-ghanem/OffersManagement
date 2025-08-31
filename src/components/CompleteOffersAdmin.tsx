import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, Percent, DollarSign, Gift, Users, MapPin, Tag, Clock, X, Zap, Award, Package, Check } from 'lucide-react';
import { Play, Minus, RefreshCw } from 'lucide-react';
import {Layers, CheckCircle, XCircle } from 'lucide-react';
import { BarChart } from 'lucide-react';
import { Settings } from 'lucide-react';

const CompleteOffersAdmin = () => {

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');

        if (!token || role !== 'admin') {
            // Redirect to login or show unauthorized
            window.location.reload(); // This will trigger the auth check in MainApp
            return;
        }
    }, []);
    
    const [activeTab, setActiveTab] = useState('list');
    const [offers, setOffers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = 'https://wheelsnow-api.onrender.com';
    //const API_BASE_URL = 'http://localhost:5159';

    const [expandedRestaurants, setExpandedRestaurants] = useState([]); // Which restaurants show branches

    const [showCitySelector, setShowCitySelector] = useState(false);

    // Complete form state for ALL offer types
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        offerType: 1, // Product, Category, Order, Delivery, FirstOrder, LoyaltyTier, TimeSlot, Combo, Flash
        discountType: 1, // Percentage, Fixed, BuyXGetY, FreeDelivery
        discountValue: '',
        maxDiscountAmount: '',
        minOrderAmount: '',
        priority: 1,
        isStackable: false,
        maxUsagePerUser: '',
        wheelsContribution: 0 ,
        maxUsageTotal: '',
        startDate: null,
        endDate: null,
        isActive: true,

        // BuyXGetY properties
        buyQuantity: '',
        getQuantity: '',
        getDiscountPercent: 100,

        // Enhanced properties
        isFirstOrderOnly: false,
        userTiers: [],
        dayOfWeek: [],
        startTime: null,
        endTime: null,
        minItemQuantity: '',
        isComboOffer: false,
        comboItems: [],
        couponCode: '',
        requiresCouponCode: false,
        flashSaleQuantity: '',

        // Targeting
        RestaurantIds: [],
        RestaurantBranches: [], // Add this

        Targets: []
    });
    
    const offerTypes = [
        { value: 1, label: 'Product Specific', icon: <Tag className="w-4 h-4" />, description: 'Discount on specific products' },
        { value: 2, label: 'Category', icon: <Target className="w-4 h-4" />, description: 'Discount on product categories' },
        { value: 3, label: 'Order Total', icon: <DollarSign className="w-4 h-4" />, description: 'Discount on entire order' },
        { value: 4, label: 'Delivery', icon: <MapPin className="w-4 h-4" />, description: 'Discount on delivery fee' },
        { value: 5, label: 'First Order', icon: <Users className="w-4 h-4" />, description: 'New customer specials (Product/Category/Order level)' },
        { value: 6, label: 'Loyalty Tier', icon: <Award className="w-4 h-4" />, description: 'VIP rewards (Product/Category/Order level)' },
        { value: 7, label: 'Time-Based', icon: <Clock className="w-4 h-4" />, description: 'Time restricted offers (Product/Category/Order level)' },
        { value: 8, label: 'Combo Deal', icon: <Package className="w-4 h-4" />, description: 'Bundle offers with restaurant-specific items' },
        { value: 9, label: 'Flash Sale', icon: <Zap className="w-4 h-4" />, description: 'Limited quantity offers' }
    ];

    const discountTypes = [
        { value: 1, label: 'Percentage (%)', icon: <Percent className="w-4 h-4" /> },
        { value: 2, label: 'Fixed Amount (شيقل)', icon: <DollarSign className="w-4 h-4" /> },
        { value: 3, label: 'Buy X Get Y', icon: <Gift className="w-4 h-4" /> },
        { value: 4, label: 'Free Delivery', icon: <MapPin className="w-4 h-4" /> }
    ];
    const userTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [enhancedTestConfig, setEnhancedTestConfig] = useState({
        selectedOffers: [],
        userId: '022b5474-db3d-47eb-9d5d-cf7880ee194f',
        restaurantId: '',
        branchId: '',
        deliveryFee: 10,
        couponCode: '',
        testMode: 'single' // 'single' or 'multiple'
    });

    const getOfferTypeName = (offerType) => {
        const names = {
            1: 'Product Specific',
            2: 'Category',
            3: 'Order Total',
            4: 'Delivery',
            5: 'First Order',
            6: 'Loyalty Tier',
            7: 'Time-Based',
            8: 'Combo Deal',
            9: 'Flash Sale'
        };
        return names[offerType] || 'Unknown';
    };

    const getDiscountTypeName = (discountType) => {
        const names = {
            1: 'Percentage',
            2: 'Fixed Amount',
            3: 'Buy X Get Y',
            4: 'Free Delivery'
        };
        return names[discountType] || 'Unknown';
    };
    const [enhancedOrderItems, setEnhancedOrderItems] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [itemSearch, setItemSearch] = useState('');
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [enhancedTestResults, setEnhancedTestResults] = useState([]);
    const [enhancedLoading, setEnhancedLoading] = useState(false);
    const [stackingTestResults, setStackingTestResults] = useState(null);
    const [stackingTestLoading, setStackingTestLoading] = useState(false);
    const [showCityOnlyOffers, setShowCityOnlyOffers] = useState(false);

    const loadItemsForRestaurant = async (restaurantId) => {
        console.log('🔄 Loading products for restaurant:', restaurantId);

        if (!restaurantId) {
            setAvailableItems([]);
            return;
        }

        try {
            // Load only products for the selected restaurant
            await loadProductsForRestaurants([restaurantId]);

            // Wait for state to update, then set available items to products only
            setTimeout(() => {
                const restaurantProducts = products
                    .filter(p => p.restaurantId === restaurantId)
                    .map(p => ({ ...p, type: 'product' }));

                console.log('✅ Found products:', restaurantProducts.length);
                setAvailableItems(restaurantProducts);
            }, 500);

        } catch (error) {
            console.error('❌ Error loading products:', error);
        }
    };

    const addEnhancedOrderItem = (item) => {
        // Find the category for this product
        const productCategory = categories.find(c => c.id === item.categoryId);

        const newItem = {
            productId: item.id,
            categoryId: item.categoryId || '', // Use the product's category
            name: item.name,
            type: 'product', // Always product since we only show products for selection
            price: item.price || 10.00,
            quantity: 1,
            total: item.price || 10.00,
            categoryName: productCategory?.name || 'Unknown Category' // For display
        };

        setEnhancedOrderItems(prev => [...prev, newItem]);
        setShowItemSelector(false);
        setItemSearch('');

        console.log('✅ Added item:', newItem);
    };

    const updateEnhancedOrderItem = (index, field, value) => {
        setEnhancedOrderItems(prev => prev.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    updatedItem.total = updatedItem.quantity * updatedItem.price;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const testOfferStacking = async () => {
        if (!enhancedTestConfig.restaurantId) {
            alert('Please select a restaurant first');
            return;
        }

        if (!enhancedTestConfig.branchId) {
            alert('Please select a branch first');
            return;
        }

        if (enhancedOrderItems.length === 0) {
            alert('Please add items to test');
            return;
        }


        setStackingTestLoading(true);
        setStackingTestResults(null);

        try {
            console.log('🧪 Testing offer stacking for restaurant:', enhancedTestConfig.restaurantId);

            const testData = {
                userId: enhancedTestConfig.userId,
                restaurantId: enhancedTestConfig.restaurantId,
                branchId: enhancedTestConfig.branchId,

                items: enhancedOrderItems.map(item => ({
                    productId: item.productId,
                    categoryId: item.categoryId || '',
                    price: item.price,
                    quantity: item.quantity,
                    total: item.total
                })),
                deliveryFee: enhancedTestConfig.deliveryFee,
                couponCode: enhancedTestConfig.couponCode
            };

            // Call your existing API to test all offers for this restaurant
            const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/test-multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            if (response.ok) {
                const results = await response.json();
                // Filter out inactive expired offers before stacking
                const activeResults = results.filter(result => {
                    const offer = offers.find(o =>
                        o.offerId === (result.offerId || result.details?.offerId)
                    );

                    if (!offer) return false;

                    const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
                    const isInactive = !offer.isActive;

                    if (isInactive || isExpired) {
                        console.log(`Excluding ${isInactive ? 'inactive' : 'expired'} offer from stacking:`, offer.name);
                        return false;
                    }
                    return true;
                });

                // Process only active offers for stacking
                const normalizedResults = activeResults.map(result => {
                    const offer = offers.find(o =>
                        o.offerId === (result.offerId || result.details?.offerId)
                    );

                    return {
                        ...result,
                        details: {
                            ...result.details,
                            offerId: result.offerId || result.details?.offerId,
                            offerName: offer?.name || result.details?.offerName || 'Unknown Offer',
                            name: offer?.name || result.details?.offerName || 'Unknown Offer',
                            offerType: offer?.offerType || result.details?.offerType || 1,
                            priority: offer?.priority || result.details?.priority || 1,
                            isStackable: offer?.isStackable !== undefined ? offer.isStackable : (result.details?.isStackable !== false)
                        },
                        offer: offer
                    };
                });

                // Apply stacking logic to the results
                const stackedResults = applyStackingLogic(normalizedResults);
                console.log('🔄 After stacking logic:', stackedResults);

                const orderTotal = enhancedOrderItems.reduce((sum, item) => sum + item.total, 0);
                const finalPrice = orderTotal + enhancedTestConfig.deliveryFee - stackedResults.totalSavings;

                setStackingTestResults({
                    offers: stackedResults.processedOffers,
                    totalSavings: stackedResults.totalSavings,
                    orderTotal: orderTotal,
                    finalPrice: finalPrice,
                    applicableCount: stackedResults.appliedCount,
                    stoppingReason: stackedResults.stoppingReason
                });

            } else {
                const errorText = await response.text();
                alert('API Error: ' + errorText);
            }

        } catch (error) {
            console.error('❌ Stacking test error:', error);
            alert('Error testing stacking: ' + error.message);
        } finally {
            setStackingTestLoading(false);
        }
        
    };

    const removeEnhancedOrderItem = (index) => {
        setEnhancedOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const toggleOfferSelection = (offerId) => {
        setEnhancedTestConfig(prev => ({
            ...prev,
            selectedOffers: prev.selectedOffers.includes(offerId)
                ? prev.selectedOffers.filter(id => id !== offerId)
                : [...prev.selectedOffers, offerId]
        }));
    };
    const isOrderLevelOffer = (offer) => {
        // Check if offer has no specific product/category targets
        const hasNoTargets = !offer.targets || offer.targets.length === 0;

        // Check if it's order-level offer types (3=Order Total, 4=Delivery)
        const isOrderType = [3, 4].includes(offer.offerType);

        // Check if it's sub-targeted offer but set to 'order' level
        const isSubOrderLevel = [5, 6, 7, 9].includes(offer.offerType) &&
            (offer.subTargetType === 'order' || (!offer.subTargetType && hasNoTargets));

        return isOrderType || isSubOrderLevel;
    };
    const deselectAllRestaurantsInCity = (cityName) => {
        const cityRestaurants = getRestaurantsInCity(cityName);

        if (!cityRestaurants || cityRestaurants.length === 0) {
            console.log('No restaurants found for city:', cityName);
            return;
        }

        const cityBranches = cityRestaurants.map(r => ({
            restaurantId: r.id,
            branchId: r.branchId
        }));

        console.log('Deselecting city:', cityName);
        console.log('City branches to remove:', cityBranches);
        console.log('Current selected branches:', formData.RestaurantBranches);

        setFormData(prev => {
            // Filter out all branches from this city
            const updatedBranches = prev.RestaurantBranches.filter(selectedBranch => {
                const shouldRemove = cityBranches.some(cityBranch =>
                    cityBranch.restaurantId === selectedBranch.restaurantId &&
                    cityBranch.branchId === selectedBranch.branchId
                );
                return !shouldRemove; // Keep branches that should NOT be removed
            });

            console.log('Updated branches after deselect:', updatedBranches);

            // Update restaurant IDs based on remaining branches
            const updatedRestaurantIds = [...new Set(updatedBranches.map(b => b.restaurantId))];

            // Update expanded restaurants - collapse restaurants that no longer have selected branches
            const cityRestaurantIds = [...new Set(cityBranches.map(b => b.restaurantId))];
            setExpandedRestaurants(prevExpanded =>
                prevExpanded.filter(restaurantId => {
                    // Keep expanded only if restaurant still has selected branches
                    const stillHasSelectedBranches = updatedBranches.some(b => b.restaurantId === restaurantId);
                    return stillHasSelectedBranches;
                })
            );

            return {
                ...prev,
                RestaurantBranches: updatedBranches,
                RestaurantIds: updatedRestaurantIds
            };
        });
    };    
    const getUniqueRestaurants = () => {
        // Group restaurants by ID to show each restaurant once
        const uniqueRestaurants = restaurants.reduce((acc, restaurant) => {
            const existing = acc.find(r => r.id === restaurant.id);
            if (!existing) {
                acc.push({
                    id: restaurant.id,
                    name: restaurant.name,
                    nameEn: restaurant.nameEn,
                    branches: restaurants.filter(r => r.id === restaurant.id)
                });
            }
            return acc;
        }, []);
        return uniqueRestaurants;
    };
    const getBranchesForRestaurant = (restaurantId) => {
        return restaurants.filter(r => r.id === restaurantId);
    };


    const getUniqueCities = () => {
        const cities = [...new Set(restaurants.map(r => r.cityName).filter(Boolean))];
        return cities.sort();
    };

    const getRestaurantsInCity = (cityName) => {
        return restaurants.filter(r => r.cityName === cityName);
    };

    const selectAllRestaurantsInCity = (cityName) => {
        const cityRestaurants = getRestaurantsInCity(cityName);

        if (!cityRestaurants || cityRestaurants.length === 0) {
            console.log('No restaurants found for city:', cityName);
            return;
        }

        const cityBranches = cityRestaurants.map(r => ({
            restaurantId: r.id,
            branchId: r.branchId
        }));

        console.log('Selecting all for city:', cityName);
        console.log('City branches to add:', cityBranches);

        setFormData(prev => {
            // Add to existing selection (avoiding duplicates)
            const existingBranches = prev.RestaurantBranches;
            const newBranches = cityBranches.filter(newBranch =>
                !existingBranches.some(existing =>
                    existing.restaurantId === newBranch.restaurantId &&
                    existing.branchId === newBranch.branchId
                )
            );

            const updatedBranches = [...existingBranches, ...newBranches];
            const updatedRestaurantIds = [...new Set(updatedBranches.map(b => b.restaurantId))];

            console.log('New branches added:', newBranches);
            console.log('Updated total branches:', updatedBranches);

            // Auto-expand restaurants in this city
            const cityRestaurantIds = [...new Set(cityRestaurants.map(r => r.id))];
            setExpandedRestaurants(prevExpanded =>
                [...new Set([...prevExpanded, ...cityRestaurantIds])]
            );

            return {
                ...prev,
                RestaurantBranches: updatedBranches,
                RestaurantIds: updatedRestaurantIds
            };
        });
    };    
    const toggleRestaurantExpansion = (restaurantId) => {
        setExpandedRestaurants(prev => {
            const isExpanded = prev.includes(restaurantId);
            if (isExpanded) {
                // Collapsing - remove all branches for this restaurant
                setFormData(prevForm => ({
                    ...prevForm,
                    RestaurantBranches: prevForm.RestaurantBranches.filter(
                        b => b.restaurantId !== restaurantId
                    ),
                    RestaurantIds: prevForm.RestaurantIds.filter(id => id !== restaurantId)
                }));
                return prev.filter(id => id !== restaurantId);
            } else {
                // Expanding
                return [...prev, restaurantId];
            }
        });
    };

    const toggleBranchSelection = (restaurantId, branchId) => {
        setFormData(prev => {
            const isSelected = prev.RestaurantBranches.some(
                b => b.restaurantId === restaurantId && b.branchId === branchId
            );

            let newRestaurantBranches;
            if (isSelected) {
                // Remove branch
                newRestaurantBranches = prev.RestaurantBranches.filter(
                    b => !(b.restaurantId === restaurantId && b.branchId === branchId)
                );
            } else {
                // Add branch
                newRestaurantBranches = [...prev.RestaurantBranches, { restaurantId, branchId }];
            }

            // Update RestaurantIds to include only restaurants that have selected branches
            const newRestaurantIds = [...new Set(newRestaurantBranches.map(b => b.restaurantId))];

            // Load data for new restaurant selection
            if (newRestaurantIds.length > 0) {
                loadCategoriesForRestaurants(newRestaurantIds);
                loadProductsForRestaurants(newRestaurantIds);
            } else {
                loadCategories();
                loadProducts();
            }

            return {
                ...prev,
                RestaurantBranches: newRestaurantBranches,
                RestaurantIds: newRestaurantIds
            };
        });
    };

    const isBranchSelected = (restaurantId, branchId) => {
        return formData.RestaurantBranches.some(
            b => b.restaurantId === restaurantId && b.branchId === branchId
        );
    };

    const renderRestaurantBranchSelection = () => (
        <div>
            <label className="block text-sm font-medium mb-2">Select Restaurants & Branches</label>

            {/* Search bar */}
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Search restaurants..."
                    value={restaurantSearch}
                    onChange={(e) => setRestaurantSearch(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                />
            </div>

            {/* Selected summary */}
            {formData.RestaurantBranches.length > 0 && (
                <div className="mb-3 p-3 bg-red-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                        Selected: {formData.RestaurantIds.length} restaurants, {formData.RestaurantBranches.length} branches
                    </p>
                    <div className="space-y-1">
                        {formData.RestaurantIds.map(restaurantId => {
                            const restaurant = getUniqueRestaurants().find(r => r.id === restaurantId);
                            const RestaurantBranches = getRestaurantBranchesForRestaurant(restaurantId);
                            const totalBranches = getBranchesForRestaurant(restaurantId).length;

                            return (
                                <div key={restaurantId} className="text-xs">
                                <span className="font-medium text-red-700">
                                    {restaurant?.name || 'Unknown'}: 
                                </span>
                                    <span className="text-red-600 ml-1">
                                    {RestaurantBranches.length} of {totalBranches} branches
                                </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {/* City Quick Select */}
            {(formData.offerType === 3 || formData.offerType === 4 ||
                ([5, 6, 7, 9].includes(formData.offerType) && subOfferType === 'order')) && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">

                    {showCitySelector && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                                    <div key={city} className={`p-3 border rounded-lg ${
                                        isFullySelected ? 'bg-green-50 border-green-300' :
                                            hasPartialSelection ? 'bg-yellow-50 border-yellow-300' :
                                                'bg-white border-gray-300'
                                    }`}>
                                        <div className="text-center mb-2">
                                            <div className="font-medium text-sm">📍 {city}</div>
                                            <div className="text-xs text-gray-600">
                                                {totalBranches} branches
                                            </div>
                                            {selectedBranches > 0 && (
                                                <div className="text-xs font-medium text-red-600">
                                                    {selectedBranches}/{totalBranches} selected
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-1">
                                            {/* SELECT ALL BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => selectAllRestaurantsInCity(city)}
                                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                    isFullySelected
                                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                                }`}
                                                disabled={isFullySelected}
                                            >
                                                {isFullySelected ? 'All Selected' : 'Select All'}
                                            </button>

                                            {/* DESELECT ALL BUTTON */}
                                            {selectedBranches > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => deselectAllRestaurantsInCity(city)}
                                                    className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                >
                                                    Deselect
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
            
            
            {/* Restaurant and branch list */}
            {restaurants.length === 0 ? (
                <div className="border rounded-md p-4 text-center text-gray-500">
                    <p>Loading restaurants...</p>
                </div>
            ) : (
                <div className="border rounded-md max-h-96 overflow-y-auto">
                    {getUniqueRestaurants()
                        .filter(restaurant =>
                            !restaurantSearch ||
                            restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
                            (restaurant.nameEn && restaurant.nameEn.toLowerCase().includes(restaurantSearch.toLowerCase()))
                        )
                        .map(restaurant => {
                            const isExpanded = isRestaurantExpanded(restaurant.id);
                            const RestaurantBranches = getRestaurantBranchesForRestaurant(restaurant.id);
                            const totalBranches = restaurant.branches.length;

                            return (
                                <div key={restaurant.id} className="border-b">
                                    {/* Restaurant Header */}
                                    <div
                                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            RestaurantBranches.length > 0 ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-gray-50'
                                        }`}
                                        onClick={() => toggleRestaurantExpansion(restaurant.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`transform transition-transform ${
                                                    isExpanded ? 'rotate-90' : 'rotate-0'
                                                }`}>
                                                    ▶
                                                </div>
                                                <div>
                                                    <span className="font-medium">{restaurant.name}</span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                    ({totalBranches} branch{totalBranches !== 1 ? 'es' : ''})
                                                </span>
                                                </div>
                                            </div>
                                            {RestaurantBranches.length > 0 && (
                                                <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
                                                {RestaurantBranches.length} selected
                                            </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Branches (shown only when expanded) */}
                                    {isExpanded && (
                                        <div className="bg-white border-l-4 border-l-gray-200">
                                            {restaurant.branches.map(branch => (
                                                <div
                                                    key={branch.branchId}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBranchSelection(restaurant.id, branch.branchId);
                                                    }}
                                                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ml-6 ${
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
                                                                onChange={() => toggleBranchSelection(restaurant.id, branch.branchId)}
                                                                className="rounded"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <div>
                                                            <span className="text-sm font-medium">
                                                                {branch.branchName || 'Main Branch'}
                                                            </span>
                                                                {branch.cityName && (
                                                                    <span className="text-xs text-gray-500 block">
                                                                    📍 {branch.cityName}
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
    );
    const getRestaurantBranchesForRestaurant = (restaurantId) => {
        return formData.RestaurantBranches.filter(b => b.restaurantId === restaurantId);
    };

    const isRestaurantExpanded = (restaurantId) => {
        return expandedRestaurants.includes(restaurantId);
    };
    const runEnhancedTests = async () => {
        if (!enhancedTestConfig.restaurantId) {
            alert('Please select a restaurant first');
            return;
        }

        if (!enhancedTestConfig.branchId) {
            alert('Please select a branch first');
            return;
        }

        if (enhancedOrderItems.length === 0) {
            alert('Please add at least one item to test');
            return;
        }

        setEnhancedLoading(true);
        setEnhancedTestResults([]);

        try {
            const testData = {
                userId: enhancedTestConfig.userId,
                restaurantId: enhancedTestConfig.restaurantId,
                branchId: enhancedTestConfig.branchId,
                items: enhancedOrderItems.map(item => ({
                    productId: item.productId,
                    categoryId: item.categoryId || '',
                    price: item.price,
                    quantity: item.quantity,
                    total: item.total
                })),
                deliveryFee: enhancedTestConfig.deliveryFee,
                couponCode: enhancedTestConfig.couponCode
            };

            if (enhancedTestConfig.testMode === 'multiple') {
                // Test multiple offers
                const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/test-multiple`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                });

                if (response.ok) {
                    const results = await response.json();
                    const normalizedResults = results
                        .map(result => {
                            const offer = offers.find(o =>
                                o.offerId === (result.offerId || result.details?.offerId)
                            );

                            // Check if offer is active and not expired
                            const isExpired = offer?.endDate && new Date(offer.endDate) < new Date();
                            const isInactive = !offer?.isActive;

                            return {
                                ...result,
                                offer: offer,
                                isInactive: isInactive,
                                isExpired: isExpired,
                                shouldSkip: isInactive || isExpired
                            };
                        })
                        .filter(result => {
                            if (result.shouldSkip) {
                                console.log(`Skipping ${result.isInactive ? 'inactive' : 'expired'} offer:`, result.offer?.name);
                                return false;
                            }
                            return true;
                        })
                        .map(result => ({
                            isApplicable: result.isApplicable || false,
                            message: result.message || 'No message provided',
                            discountAmount: result.discountAmount || 0,
                            offerId: result.offerId || result.details?.offerId,
                            offer: result.offer || {
                                offerId: result.offerId || 'unknown',
                                name: result.details?.offerName || 'Unknown Offer',
                                offerType: result.details?.offerType || 1,
                                discountType: result.details?.discountType || 1,
                                discountValue: result.details?.discountValue || 0
                            }
                        }));
                    setEnhancedTestResults(normalizedResults);
                } else {
                    throw new Error('Failed to test multiple offers');
                }
            } else {
                // Test selected offers individually
                const results = [];
                const offersToTest = (enhancedTestConfig.selectedOffers.length > 0
                    ? offers.filter(o => enhancedTestConfig.selectedOffers.includes(o.offerId))
                    : getApplicableOffers())
                    .filter(offer => {
                        const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
                        const isInactive = !offer.isActive;

                        if (isInactive || isExpired) {
                            console.log(`Skipping ${isInactive ? 'inactive' : 'expired'} offer:`, offer.name);
                            return false;
                        }
                        return true;
                    });

                for (const offer of offersToTest) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/test`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...testData,
                                offerId: offer.offerId
                            })
                        });

                        if (response.ok) {
                            const result = await response.json();
                            results.push({
                                ...result,
                                offer: offer // Ensure offer data is always present
                            });

                        } else {
                            results.push({
                                offer: offer,
                                isApplicable: false,
                                message: 'Test failed',
                                discountAmount: 0
                            });
                        }
                    } catch (error) {
                        results.push({
                            offer: offer,
                            isApplicable: false,
                            message: 'Error: ' + error.message,
                            discountAmount: 0
                        });
                    }
                }

                //const raw = await response.json();
                const normalized = results.map(r => ({
                    ...r,
                    offer: offers.find(o => o.offerId === (r?.details?.offerId ?? r?.offerId)) || null
                }));
                setEnhancedTestResults(normalized);
            }
        } catch (error) {
            console.error('Error running enhanced tests:', error);
            alert('Error running tests: ' + error.message);
        } finally {
            setEnhancedLoading(false);
        }
    };

    const applyStackingLogic = (apiResults) => {
        console.log('🔄 Applying stacking logic to', apiResults.length, 'offers');

        // Filter only applicable offers and sort by priority (highest first)
        const applicableOffers = apiResults
            .filter(result => result.isApplicable && result.discountAmount > 0)
            .map(result => ({
                ...result,
                priority: result.details?.priority || 1,
                isStackable: result.details?.isStackable !== false // Default to true if not specified
            }))
            .sort((a, b) => b.priority - a.priority);
        console.log("tttt", applicableOffers);
        console.log('📊 Applicable offers sorted by priority:', applicableOffers.map(o => ({
            name: o.details?.offerName,
            priority: o.priority,
            stackable: o.isStackable,
            discount: o.discountAmount
        })));

        const processedOffers = [];
        let totalSavings = 0;
        let appliedCount = 0;
        let stoppingReason = 'All offers processed';
        let processingContinues = true;

        // Process all offers (both applicable and non-applicable) for display
        apiResults.forEach(result => {
            const isApplicable = applicableOffers.find(a => a.details?.offerId === result.details?.offerId);

            if (isApplicable && processingContinues) {
                // This offer can be applied
                processedOffers.push({
                    ...result,
                    applied: true,
                    stackingStatus: 'Applied'
                });

                totalSavings += result.discountAmount || 0;
                appliedCount++;

                console.log(`✅ Applied: ${result.details?.name} - ${result.discountAmount} JOD (Stackable: ${result.details?.isStackable})`);

                // Check if this offer is non-stackable
                if (result.details?.isStackable === false) {
                    console.log(`🚫 "${result.details?.name}" is NON-STACKABLE - stopping further processing`);
                    stoppingReason = `Non-stackable offer "${result.details?.name}" applied - remaining offers ignored`;
                    processingContinues = false;
                }

            } else if (isApplicable && !processingContinues) {
                // This offer would apply but was blocked by non-stackable offer
                processedOffers.push({
                    ...result,
                    applied: false,
                    stackingStatus: 'Blocked by non-stackable offer',
                    ignoredReason: 'Previous non-stackable offer was applied'
                });

                console.log(`❌ Blocked: ${result.details?.name} - would save ${result.discountAmount} JOD but blocked`);

            } else {
                // This offer doesn't apply due to business rules
                processedOffers.push({
                    ...result,
                    applied: false,
                    stackingStatus: 'Not applicable'
                });
            }
        });

        console.log('🎯 Stacking Summary:');
        console.log(`  Applied: ${appliedCount} offers`);
        console.log(`  Total Savings: ${totalSavings} JOD`);
        console.log(`  Reason: ${stoppingReason}`);

        return {
            processedOffers,
            totalSavings,
            appliedCount,
            stoppingReason
        };
    };
    const getFilteredAvailableItems = () => {
        console.log('🔍 Filtering items. Available items:', availableItems.length);
        if (!itemSearch) return availableItems;
        const filtered = availableItems.filter(item =>
            item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
            (item.nameEn && item.nameEn.toLowerCase().includes(itemSearch.toLowerCase()))
        );
        console.log('🔍 After search filter:', filtered.length);
        return filtered;
    };

    const getApplicableOffers = () => {
        if (!enhancedTestConfig.restaurantId) return offers;

        return offers.filter(offer => {
            const rIds = offer.restaurantIds ?? offer.RestaurantIds ?? [];
            const rBranches = offer.restaurantBranches ?? offer.RestaurantBranches ?? [];

            const appliesToRestaurant = rIds.includes(enhancedTestConfig.restaurantId) || rIds.length === 0;
            if (!appliesToRestaurant) return false;

            if (enhancedTestConfig.branchId && rBranches.length > 0) {
                return rBranches.some(rb => {
                    const rid = rb.id ?? rb.Id ?? rb.restaurantId;
                    const bid = rb.branchId ?? rb.BranchId ?? rb.branchID;
                    return rid === enhancedTestConfig.restaurantId && bid === enhancedTestConfig.branchId;
                });
            }
            return true;
        }).sort((a, b) => {
            // Sort active offers first
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return 0;
        });
    };
    
    const [restaurantSearch, setRestaurantSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [comboProductSearch, setComboProductSearch] = useState('');
    const [selectedComboRestaurant, setSelectedComboRestaurant] = useState('');
    const [selectedProductRestaurants, setSelectedProductRestaurants] = useState([]);
    const [subOfferType, setSubOfferType] = useState('order'); // 'product', 'category', 'order'
    const [comboTargetType, setComboTargetType] = useState('Product'); // 'product' or 'category'
   
    // Add these functions to your admin component
    const loadRestaurants = async () => {
        try {
            const loadRestaurantsurl = API_BASE_URL.concat('/api/admin/OffersManagement/restaurants');
            const response = await fetch(loadRestaurantsurl);
            const data = await response.json();
            setRestaurants(data);
        } catch (error) {
            console.error('Error loading restaurants:', error);
        }
    };

    const loadProducts = async (restaurantIds = null, categoryId = null) => {
        try {

            if (restaurantIds && Array.isArray(restaurantIds)) {
                await loadProductsForRestaurants(restaurantIds);
                return;
            }

            let loadProductsUrl = API_BASE_URL.concat('/api/admin/OffersManagement/products?');

            if (restaurantIds && !Array.isArray(restaurantIds)) {
                loadProductsUrl += `restaurantId=${restaurantIds}&`;
            }

            if (categoryId) loadProductsUrl += `categoryId=${categoryId}&`;

            console.log('Loading products from:', loadProductsUrl);
            const response = await fetch(loadProductsUrl);
            const data = await response.json();

            const productsWithRestaurantId = data.map(product => ({
                ...product,
                restaurantId: product.restaurantId || 'unknown'
            }));

            console.log('Loaded products:', productsWithRestaurantId.length);
            setProducts(productsWithRestaurantId);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const loadCategories = async (restaurantIds = null) => {
        try {

            if (restaurantIds && Array.isArray(restaurantIds)) {
                await loadCategoriesForRestaurants(restaurantIds);
                return;
            }

            let loadCategoriesurl = API_BASE_URL.concat('/api/admin/OffersManagement/categories');

            if (restaurantIds && !Array.isArray(restaurantIds)) {
                loadCategoriesurl += `?restaurantId=${restaurantIds}`;
            }

            console.log('Loading categories from:', loadCategoriesurl);
            const response = await fetch(loadCategoriesurl);
            const data = await response.json();

            const categoriesWithRestaurantId = data.map(category => ({
                ...category,
                restaurantId: category.restaurantId || 'unknown'
            }));

            console.log('Loaded categories:', categoriesWithRestaurantId.length);
            setCategories(categoriesWithRestaurantId);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadCategoriesForRestaurants = async (restaurantIds) => {
        try {
            console.log('Loading categories for restaurants:', restaurantIds);
            const allCategories = [];

            for (const restaurantId of restaurantIds) {
                const loadCategoriesurl = `${API_BASE_URL}/api/admin/OffersManagement/categories?restaurantId=${restaurantId}`;
                const response = await fetch(loadCategoriesurl);
                const data = await response.json();

                // Add restaurant info to each category INCLUDING RESTAURANT NAME
                const restaurant = restaurants.find(r => r.id === restaurantId);
                const categoriesWithRestaurant = data.map(category => ({
                    ...category,
                    restaurantId: restaurantId,
                    restaurantName: restaurant?.name || 'Unknown Restaurant', // ADD THIS LINE
                    restaurantNameEn: restaurant?.nameEn || '' // ADD THIS LINE TOO
                }));


                allCategories.push(...categoriesWithRestaurant);
            }

            // Remove duplicates based on category ID, keeping the first occurrence
            const uniqueCategories = allCategories.filter((category, index, self) =>
                index === self.findIndex(c => c.id === category.id)
            );

            console.log('Loaded unique categories:', uniqueCategories.length);
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error loading categories for restaurants:', error);
        }
    };

    const loadProductsForRestaurants = async (restaurantIds) => {
        try {
            console.log('Loading products for restaurants:', restaurantIds);
            const allProducts = [];

            for (const restaurantId of restaurantIds) {
                const loadProductsUrl = `${API_BASE_URL}/api/admin/OffersManagement/products?restaurantId=${restaurantId}`;
                const response = await fetch(loadProductsUrl);
                const data = await response.json();

                // Add restaurant info to each product INCLUDING RESTAURANT NAME
                const restaurant = restaurants.find(r => r.id === restaurantId);
                const productsWithRestaurant = data.map(product => ({
                    ...product,
                    restaurantId: restaurantId,
                    restaurantName: restaurant?.name || 'Unknown Restaurant', // ADD THIS LINE
                    restaurantNameEn: restaurant?.nameEn || '' // ADD THIS LINE TOO
                }));

                allProducts.push(...productsWithRestaurant);
            }

            // Remove duplicates based on product ID, keeping the first occurrence
            const uniqueProducts = allProducts.filter((product, index, self) =>
                index === self.findIndex(p => p.id === product.id)
            );

            console.log('Loaded unique products:', uniqueProducts.length);
            setProducts(uniqueProducts);
        } catch (error) {
            console.error('Error loading products for restaurants:', error);
        }
    };
   
    const getFilteredProductsByRestaurants = () => {
        console.log('🔍 === FILTERING PRODUCTS/CATEGORIES ===');
        console.log('✏️ Editing offer:', editingOffer?.offerId);
        console.log('📝 Offer type:', formData.offerType);
        console.log('📝 Sub offer type:', subOfferType);
        console.log('🎯 Form targets:', formData.Targets);
        console.log('🏪 RestaurantIds:', formData.RestaurantIds);
        console.log('🏪 Selected product restaurants:', selectedProductRestaurants);

        // Determine if we should show products or categories
        const isProductTarget = formData.offerType === 1 ||
            ([5, 6, 7, 9].includes(formData.offerType) && subOfferType === 'product');

        console.log('🎯 Is product target:', isProductTarget);

        let items = isProductTarget ? products : categories;
        console.log(`📦 Total ${isProductTarget ? 'products' : 'categories'} available:`, items.length);

        // Use RestaurantIds as the primary source of truth
        const restaurantsToFilter = formData.RestaurantIds;
        console.log('🏪 Using restaurants for filtering:', restaurantsToFilter);

        // Debug: Log available items and their restaurant associations
        if (items.length > 0) {
            console.log('📊 Sample items with restaurants:');
            items.slice(0, 5).forEach(item => {
                console.log(`  - ${item.name} (ID: ${item.id}, Restaurant: ${item.restaurantId})`);
            });
        }

        // If no restaurant filter, show all items
        if (restaurantsToFilter.length === 0) {
            console.log('🌐 No restaurant filter, showing all items');
            if (productSearch) {
                items = items.filter(item =>
                    item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    (item.nameEn && item.nameEn.toLowerCase().includes(productSearch.toLowerCase()))
                );
            }
            console.log('📊 Returning all items (no filter):', items.length);
            return items;
        }

        // Filter by selected restaurants
        console.log('🏪 Filtering by restaurants:', restaurantsToFilter);
        const beforeFilter = items.length;
        items = items.filter(item => {
            const belongs = restaurantsToFilter.includes(item.restaurantId);
            if (belongs && items.indexOf(item) < 3) { // Log first few matches
                console.log(`✅ ${item.name} belongs to restaurant ${item.restaurantId}`);
            }
            return belongs;
        });
        console.log(`📊 After restaurant filter: ${items.length} (was ${beforeFilter})`);

        // Debug: If no items found, check why
        if (items.length === 0 && restaurantsToFilter.length > 0) {
            console.log('❌ No items found! Debugging:');
            console.log('🏪 Looking for restaurants:', restaurantsToFilter);
            console.log('📦 Available restaurant IDs in items:',
                [...new Set((isProductTarget ? products : categories).map(i => i.restaurantId))]);

            // Check if any restaurant IDs match
            const availableRestaurantIds = [...new Set((isProductTarget ? products : categories).map(i => i.restaurantId))];
            const matchingIds = restaurantsToFilter.filter(id => availableRestaurantIds.includes(id));
            console.log('🔗 Matching restaurant IDs:', matchingIds);
        }

        // Apply search filter
        if (productSearch) {
            const beforeSearch = items.length;
            items = items.filter(item =>
                item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (item.nameEn && item.nameEn.toLowerCase().includes(productSearch.toLowerCase()))
            );
            console.log(`📊 After search filter: ${items.length} (was ${beforeSearch})`);
        }

        console.log('📊 Final filtered items:', items.length);
        return items;
    };
    const handleSubOfferTypeChange = (newSubType) => {
        console.log('🔄 Sub-offer type changing to:', newSubType);
        setSubOfferType(newSubType);

        // Clear existing targets when changing sub-type
        setFormData(prev => ({ ...prev, Targets: [] }));

        // If we have restaurants selected and the new sub-type needs products/categories
        if (formData.RestaurantIds.length > 0 && ['product', 'category'].includes(newSubType)) {
            console.log('📦 Loading data for new sub-type:', newSubType);
            // Force reload of categories and products for selected restaurants
            setTimeout(() => {
                loadCategoriesForRestaurants(formData.RestaurantIds);
                loadProductsForRestaurants(formData.RestaurantIds);
            }, 100);
        }
    };
    const toggleTargetSelection = (targetId) => {
        setFormData(prev => {
            const isSelected = prev.Targets.includes(targetId);
            return {
                ...prev,
                Targets: isSelected
                    ? prev.Targets.filter(id => id !== targetId)
                    : [...prev.Targets, targetId]
            };
        });
    };

    const getFilteredComboItems = () => {
        console.log('🔍 === FILTERING COMBO ITEMS ===');
        console.log('📝 Combo target type:', comboTargetType);
        console.log('🏪 RestaurantIds:', formData.RestaurantIds);
        console.log('🔍 Selected combo restaurant:', selectedComboRestaurant);
        console.log('🔍 Search term:', comboProductSearch);

        let filteredItems = comboTargetType === 'Product' ? products : categories;
        console.log(`📦 Total ${comboTargetType}s available:`, filteredItems.length);

        // Debug: Show sample items and their restaurant associations
        if (filteredItems.length > 0) {
            console.log('📊 Sample items with restaurants:');
            filteredItems.slice(0, 3).forEach(item => {
                console.log(`  - ${item.name} (ID: ${item.id}, Restaurant: ${item.restaurantId})`);
            });
        }

        // Filter by selected restaurants first
        const beforeRestaurantFilter = filteredItems.length;
        filteredItems = filteredItems.filter(item => formData.RestaurantIds.includes(item.restaurantId));
        console.log(`📊 After restaurant filter: ${filteredItems.length} (was ${beforeRestaurantFilter})`);

        // Debug: If no items found after restaurant filter
        if (filteredItems.length === 0 && formData.RestaurantIds.length > 0) {
            console.log('❌ No items found after restaurant filter! Debugging:');
            console.log('🏪 Looking for restaurants:', formData.RestaurantIds);
            const allItems = comboTargetType === 'product' ? products : categories;
            const availableRestaurantIds = [...new Set(allItems.map(i => i.restaurantId))];
            console.log('📦 Available restaurant IDs in items:', availableRestaurantIds);
            const matchingIds = formData.RestaurantIds.filter(id => availableRestaurantIds.includes(id));
            console.log('🔗 Matching restaurant IDs:', matchingIds);

            if (matchingIds.length === 0) {
                console.log('⚠️ No matching restaurants found! Need to reload data.');
            }
        }

        // Filter by specific restaurant if selected
        if (selectedComboRestaurant) {
            const beforeSpecificFilter = filteredItems.length;
            filteredItems = filteredItems.filter(item => item.restaurantId === selectedComboRestaurant);
            console.log(`📊 After specific restaurant filter: ${filteredItems.length} (was ${beforeSpecificFilter})`);
        }

        // Filter by search
        if (comboProductSearch) {
            const beforeSearch = filteredItems.length;
            filteredItems = filteredItems.filter(item =>
                item.name.toLowerCase().includes(comboProductSearch.toLowerCase()) ||
                (item.nameEn && item.nameEn.toLowerCase().includes(comboProductSearch.toLowerCase()))
            );
            console.log(`📊 After search filter: ${filteredItems.length} (was ${beforeSearch})`);
        }

        console.log('📊 Final filtered combo items:', filteredItems.length);
        return filteredItems;
    };


    const addComboItem = (itemId) => {
        const item = comboTargetType === 'Product'
            ? products.find(p => p.id === itemId)
            : categories.find(c => c.id === itemId);

        if (!item) return;

        // Check if item already exists in combo
        const existingIndex = formData.comboItems.findIndex(comboItem => comboItem.productId === itemId);
        if (existingIndex !== -1) return;

        const newComboItem = {
            productId: itemId, // Using productId field for both products and categories
            requiredQuantity: 1,
            discountPercent: 0,
            targetType: comboTargetType // Track whether this is a product or category
        };

        setFormData(prev => ({
            ...prev,
            comboItems: [...prev.comboItems, newComboItem]
        }));
    };
    const removeComboItem = (itemId) => {
        setFormData(prev => ({
            ...prev,
            comboItems: prev.comboItems.filter(comboItem => comboItem.productId !== itemId)
        }));
    };

    const updateComboItem = (itemId, field, value) => {
        setFormData(prev => ({
            ...prev,
            comboItems: prev.comboItems.map(comboItem =>
                comboItem.productId === itemId
                    ? { ...comboItem, [field]: field === 'requiredQuantity' ? parseInt(value) || 1 : parseFloat(value) || 0 }
                    : comboItem
            )
        }));
    };
    const handleComboRestaurantChange = (restaurantId) => {
        setSelectedComboRestaurant(restaurantId);

        // If no data is loaded yet for the selected restaurants, load it
        if (formData.RestaurantIds.length > 0) {
            const currentItems = comboTargetType === 'Product' ? products : categories;
            const hasDataForRestaurants = formData.RestaurantIds.some(restId =>
                currentItems.some(item => item.restaurantId === restId)
            );

            if (!hasDataForRestaurants) {
                console.log('🔄 No data found for restaurants, reloading...');
                if (comboTargetType === 'Product') {
                    loadProductsForRestaurants(formData.RestaurantIds);
                } else {
                    loadCategoriesForRestaurants(formData.RestaurantIds);
                }
            }
        }
    };

    const handleComboTargetTypeChange = (newTargetType) => {
        console.log('🔄 Combo target type changing to:', newTargetType);
        setComboTargetType(newTargetType);

        // Clear existing combo items when changing target type
        setFormData(prev => ({ ...prev, comboItems: [] }));

        // Load appropriate data for the new target type if restaurants are selected
        if (formData.RestaurantIds.length > 0) {
            console.log('📦 Loading data for new combo target type:', newTargetType);
            if (newTargetType === 'Product') {
                loadProductsForRestaurants(formData.RestaurantIds);
            } else {
                loadCategoriesForRestaurants(formData.RestaurantIds);
            }
            // Small delay to ensure state is updated
            setTimeout(() => {
                console.log(`✅ After switching to ${newTargetType}:`,
                    newTargetType === 'Product' ? products.length : categories.length, 'items loaded');
            }, 500);
        }
    };
    const loadOffers = async () => {
        try {
            const loadOffersUrl = API_BASE_URL.concat('/api/admin/OffersManagement');
            const response = await fetch(loadOffersUrl, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Add if you need auth
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setOffers(data);
        } catch (error) {
            console.error('Error loading offers:', error);
            // Keep fallback sample data on error
            setOffers([
                {
                    offerId: '1',
                    name: '20% Off Pizza',
                    offerType: 'Product',
                    discountType: 'Percentage',
                    discountValue: 20,
                    maxDiscountAmount: 10,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    isActive: true,
                    currentUsage: 45,
                    maxUsageTotal: 100,
                    priority: 5,
                    isFirstOrderOnly: false,
                    requiresCouponCode: false
                }
            ]);
        }
    };
    
    
    // Sample data initialization
    useEffect(() => {
        loadRestaurants();
        loadCategories();
        loadProducts();
        loadOffers();
    }, []);
    useEffect(() => {
        console.log('🔄 === USEEFFECT: Offer Type/Restaurant Change ===');
        console.log('📝 Current offer type:', formData.offerType);
        console.log('📝 Current sub offer type:', subOfferType);
        console.log('🏪 RestaurantIds:', formData.RestaurantIds);
        console.log('🏪 Selected product restaurants:', selectedProductRestaurants);

        // Determine if this offer type needs product/category targeting
        const needsProductCategoryTargeting = formData.offerType === 1 || formData.offerType === 2 || 
            ([5, 6, 7, 9].includes(formData.offerType) && ['product', 'category'].includes(subOfferType));

        console.log('🎯 Needs product/category targeting:', needsProductCategoryTargeting);

        if (needsProductCategoryTargeting) {
            // Sync restaurant selections
            if (formData.RestaurantIds.length > 0 &&
                JSON.stringify(selectedProductRestaurants.sort()) !== JSON.stringify(formData.RestaurantIds.sort())) {
                console.log('🔄 Syncing restaurant selections for targeting');
                setSelectedProductRestaurants(formData.RestaurantIds);

                // Load data for these restaurants
                if (formData.RestaurantIds.length > 0) {
                    console.log('📦 Loading categories and products for restaurants:', formData.RestaurantIds);
                    loadCategoriesForRestaurants(formData.RestaurantIds);
                    loadProductsForRestaurants(formData.RestaurantIds);
                }
            }
        } else {
            // For non-targeting offers, clear product restaurant selection
            if (selectedProductRestaurants.length > 0) {
                console.log('🧹 Clearing product restaurant selection (not needed)');
                setSelectedProductRestaurants([]);
            }
        }
    }, [formData.offerType, formData.RestaurantIds, subOfferType]); // Add subOfferType to dependencies

    useEffect(() => {
        console.log('🔄 === USEEFFECT: Combo Data Loading ===');
        console.log('📝 Current offer type:', formData.offerType);
        console.log('📝 Combo target type:', comboTargetType);
        console.log('🏪 RestaurantIds:', formData.RestaurantIds);

        // Load data specifically for combo offers when restaurants are selected
        if (formData.offerType === 8 && formData.RestaurantIds.length > 0) {
            console.log('🍕 Loading combo data for restaurants:', formData.RestaurantIds);

            // Load both products and categories for combo offers since user can switch between them
            loadCategoriesForRestaurants(formData.RestaurantIds);
            loadProductsForRestaurants(formData.RestaurantIds);
        }
    }, [formData.offerType, formData.RestaurantIds, comboTargetType]);

    useEffect(() => {
        if (enhancedTestConfig.restaurantId) {
            console.log('🎯 Restaurant changed, loading items using existing functions...');
            loadItemsForRestaurant(enhancedTestConfig.restaurantId);
        }
    }, [enhancedTestConfig.restaurantId]);

    const renderDiscountTypeSelection = () => {
        const compatibleTypes = getCompatibleDiscountTypes(formData.offerType);
        const filteredDiscountTypes = discountTypes.filter(type =>
            compatibleTypes.includes(type.value)
        );

        // Reset discount type if current selection is not compatible
        if (!compatibleTypes.includes(formData.discountType)) {
            handleInputChange('discountType', compatibleTypes[0]);
        }

        return (
            <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {filteredDiscountTypes.map(type => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => handleInputChange('discountType', type.value)}
                            className={`p-3 border rounded-md flex items-center gap-2 text-sm ${
                                formData.discountType === type.value
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            {type.icon}
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    };
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleSubmit = async () => {
        // Validate form before submission
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
            return;
        }

        setLoading(true);

        try {
            const offerData = {
                ...formData,
                discountValue: parseFloat(formData.discountValue) || 0,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
                buyQuantity: formData.buyQuantity ? parseInt(formData.buyQuantity) : null,
                getQuantity: formData.getQuantity ? parseInt(formData.getQuantity) : null,
                getDiscountPercent: formData.getDiscountPercent ? parseFloat(formData.getDiscountPercent.toString()) : 0,
                maxUsagePerUser: formData.maxUsagePerUser ? parseInt(formData.maxUsagePerUser) : null,
                wheelsContribution: formData.wheelsContribution ? parseFloat(formData.wheelsContribution.toString()) : 0,
                maxUsageTotal: formData.maxUsageTotal ? parseInt(formData.maxUsageTotal) : null,
                minItemQuantity: formData.minItemQuantity ? parseInt(formData.minItemQuantity) : null,
                flashSaleQuantity: formData.flashSaleQuantity ? parseInt(formData.flashSaleQuantity) : null,

                // Include selected branches
                RestaurantBranches: formData.RestaurantBranches.map(selectedBranch => {
                    const branchData = restaurants.find(r =>
                        r.id === selectedBranch.restaurantId &&
                        r.branchId === selectedBranch.branchId
                    );

                    return {
                        Id: selectedBranch.restaurantId,
                        BranchId: selectedBranch.branchId,
                        Name: branchData?.name || '',
                        NameEn: branchData?.nameEn || '',
                        BranchName: branchData?.branchName || 'Main Branch',
                        CityName: branchData?.cityName || ''
                    };
                }),

                // Format targets based on offer type
                Targets: (() => {
                    if (formData.offerType === 8 && formData.comboItems.length > 0) {
                        const targetType = comboTargetType === 'Product' ? 1 : 2;
                        return formData.comboItems.map(comboItem => ({
                            targetType: targetType,
                            targetId: comboItem.productId
                        }));
                    }

                    if ([5, 6, 7, 9].includes(formData.offerType)) {
                        const targetType = subOfferType === 'product' ? 1 : subOfferType === 'category' ? 2 : 3;
                        return formData.Targets.map(targetId => ({
                            targetType: targetType,
                            targetId: targetId
                        }));
                    }

                    return formData.Targets.map(targetId => {
                        const targetType = formData.offerType === 1 ? 1 : formData.offerType === 2 ? 2 : 3;
                        return {
                            targetType: targetType,
                            targetId: targetId
                        };
                    });
                })(),

                comboItems: formData.comboItems.map(item => ({
                    productId: item.productId,
                    RequiredQuantity: item.requiredQuantity,
                    DiscountPercent: item.discountPercent,
                    targetType: comboTargetType
                })),

                subTargetType: [5, 6, 7].includes(formData.offerType) ? subOfferType : null,
                comboTargetType: formData.offerType === 8 ? comboTargetType : null
            };

            const url = editingOffer
                ? `${API_BASE_URL}/api/admin/OffersManagement/${editingOffer.offerId}`
                : `${API_BASE_URL}/api/admin/OffersManagement`;
            const method = editingOffer ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerData)
            });

            if (response.ok) {
                const result = await response.json();
                if (editingOffer) {
                    setOffers(prev => prev.map(offer =>
                        offer.offerId === editingOffer.offerId ? result : offer
                    ));
                } else {
                    setOffers(prev => [...prev, result]);
                }
                resetForm();
                setShowCreateModal(false);
                setEditingOffer(null);
            } else {
                const errorData = await response.json();
                alert('Error saving offer: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving offer:', error);
            alert('Error saving offer: ' + error.message);
        } finally {
            setLoading(false);
        }
    };


    const getFormCompletionStatus = () => {
        const errors = validateForm();
        const totalRequiredFields = [
            'name', 'offerType', 'discountType', 'discountValue',
            'startDate', 'endDate', 'restaurantSelection'
        ].length;

        // Add conditional required fields
        let conditionalRequired = 0;
        let conditionalCompleted = 0;

        if (formData.offerType === 1 && formData.Targets.length > 0) conditionalCompleted++;
        if (formData.offerType === 1) conditionalRequired++;

        if (formData.offerType === 2 && formData.Targets.length > 0) conditionalCompleted++;
        if (formData.offerType === 2) conditionalRequired++;

        if (formData.offerType === 5 && formData.isFirstOrderOnly) conditionalCompleted++;
        if (formData.offerType === 5) conditionalRequired++;

        if (formData.offerType === 6 && formData.userTiers.length > 0) conditionalCompleted++;
        if (formData.offerType === 6) conditionalRequired++;

        if (formData.offerType === 7 && formData.dayOfWeek.length > 0 && formData.startTime && formData.endTime) conditionalCompleted++;
        if (formData.offerType === 7) conditionalRequired++;

        if (formData.offerType === 8 && formData.comboItems.length > 0) conditionalCompleted++;
        if (formData.offerType === 8) conditionalRequired++;

        if (formData.offerType === 9 && formData.flashSaleQuantity) conditionalCompleted++;
        if (formData.offerType === 9) conditionalRequired++;

        const totalRequired = totalRequiredFields + conditionalRequired;
        const completed = totalRequired - errors.length;

        return {
            completed,
            total: totalRequired,
            percentage: Math.round((completed / totalRequired) * 100),
            isValid: errors.length === 0
        };
    };

    const getCompatibleDiscountTypes = (offerType) => {
        const compatibility = {
            1: [1, 2, 3], // Product: Percentage, Fixed, BuyXGetY
            2: [1, 2, 3], // Category: Percentage, Fixed, BuyXGetY
            3: [1, 2, 4], // Order: Percentage, Fixed, FreeDelivery
            4: [1, 2, 4], // Delivery: Percentage, Fixed, FreeDelivery
            5: [1, 2, 4], // First Order: Percentage, Fixed, FreeDelivery
            6: [1, 2, 3, 4], // Loyalty: All types
            7: [1, 2, 3, 4], // Time-Based: All types
            8: [1, 2], // Combo: Percentage, Fixed only
            9: [1, 2] // Flash Sale: Percentage, Fixed only
        };
        return compatibility[offerType] || [1, 2];
    };

    const shouldShowField = (fieldName, offerType, discountType, subOfferType = 'order') => {
        const rules = {
            // Basic fields (always show)
            name: () => true,
            nameEn: () => true,
            description: () => true,
            descriptionEn: () => true,
            offerType: () => true,
            discountType: () => true,
            discountValue: () => true,
            startDate: () => true,
            endDate: () => true,
            restaurantSelection: () => true,

            // BuyXGetY fields
            buyQuantity: () => discountType === 3 && [1, 2, 6, 7].includes(offerType),
            getQuantity: () => discountType === 3 && [1, 2, 6, 7].includes(offerType),
            getDiscountPercent: () => discountType === 3 && [1, 2, 6, 7].includes(offerType),

            // Min/Max discount fields
            maxDiscountAmount: () => discountType !== 4, // Not for free delivery
            minOrderAmount: () => discountType !== 4, // Not for free delivery

            // Offer-specific sections
            firstOrderSection: () => offerType === 5,
            loyaltyTierSection: () => offerType === 6,
            timeBasedSection: () => offerType === 7,
            comboSection: () => offerType === 8,
            flashSaleSection: () => offerType === 9,

            // Sub-targeting section
            subTargetingSection: () => [5, 6, 7].includes(offerType),

            // Target selection (products/categories)
            targetSelection: () => {
                if (offerType === 1) return true; // Always for products
                if (offerType === 2) return true; // Always for categories
                if (offerType === 8) return true; // Always for combo
                if ([5, 6, 7, 9].includes(offerType)) {
                    return ['product', 'category'].includes(subOfferType);
                }
                return false;
            },

            // City selector
            citySelector: () => {
                if ([3, 4].includes(offerType)) return true; // Order/Delivery
                if ([5, 6, 7, 9].includes(offerType)) {
                    return subOfferType === 'order';
                }
                return false;
            },

            // Advanced settings (always show but some fields conditional)
            priority: () => true,
            isStackable: () => true,
            maxUsagePerUser: () => true,
            wheelsContribution: () => true,
            maxUsageTotal: () => true,
            minItemQuantity: () => true,

            // Coupon code (always show)
            couponCode: () => true
        };

        return rules[fieldName] ? rules[fieldName]() : false;
    };

    const resetForm = () => {
        setFormData({
            name: '', nameEn: '', description: '', descriptionEn: '',
            offerType: 1, discountType: 1, discountValue: '',
            maxDiscountAmount: '', minOrderAmount: '', priority: 1, isStackable: false,
            maxUsagePerUser: '', wheelsContribution:0, maxUsageTotal: '', startDate: '', endDate: '',
            isActive: true, buyQuantity: '', getQuantity: '', getDiscountPercent: 100,
            isFirstOrderOnly: false, userTiers: [], dayOfWeek: [], startTime: null,
            endTime: null, minItemQuantity: '', isComboOffer: false, comboItems: [],
            couponCode: '', requiresCouponCode: false, flashSaleQuantity: '',
            RestaurantIds: [], RestaurantBranches: [], Targets: []
        });

        // Reset all search filters
        setRestaurantSearch('');
        setProductSearch('');
        setComboProductSearch('');
        setSelectedComboRestaurant('');
        setSelectedProductRestaurants([]); // Add this line
        setSubOfferType('order'); // Reset sub-offer type
        setComboTargetType('Product'); // Add this line

        setEditingOffer(null);

        // Reset products and categories to show all
        loadCategories();
        loadProducts();
    };
   
    const handleEdit = async (offer) => {
        try {
            console.log('=== STARTING EDIT PROCESS ===');
            console.log('Editing offer:', offer);

            setEditingOffer(offer);

            // Fetch complete offer details from API
            const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/${offer.offerId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            let offerDetail;
            if (response.ok) {
                offerDetail = await response.json();
                console.log('✅ Loaded offer detail from API:', offerDetail);
            } else {
                offerDetail = offer;
                console.log('⚠️ Using fallback offer data:', offerDetail);
            }

            // Determine sub-offer type for special offers
            let initialSubOfferType = 'order'; // default
            if ([5, 6, 7].includes(offerDetail.offerType)) {
                if (offerDetail.subTargetType) {
                    initialSubOfferType = offerDetail.subTargetType;
                } else if (offerDetail.targets?.length > 0) {
                    // Infer from existing targets
                    const firstTargetType = offerDetail.targets[0].targetType;
                    initialSubOfferType = firstTargetType === 1 ? 'product' :
                        firstTargetType === 2 ? 'category' : 'order';
                }
            }

            console.log('🎯 Determined initial sub-offer type:', initialSubOfferType);
            setSubOfferType(initialSubOfferType);

            // FIXED: Handle branches properly for editing
            let selectedBranches = [];
            if (offerDetail.restaurantBranches && offerDetail.restaurantBranches.length > 0) {
                // Map branches to selectedBranches format
                selectedBranches = offerDetail.restaurantBranches.map(rb => ({
                    restaurantId: rb.id,
                    branchId: rb.branchId
                }));

                // If branch data is incomplete (nulls), try to merge with current restaurants data
                const completeRestaurantBranches = offerDetail.restaurantBranches.map(rb => {
                    const existingBranch = restaurants.find(r =>
                        r.id === rb.id && r.branchId === rb.branchId
                    );

                    if (existingBranch) {
                        // Use existing data if available
                        return existingBranch;
                    } else {
                        // Create minimal branch data
                        return {
                            id: rb.id,
                            branchId: rb.branchId,
                            name: rb.name || 'Unknown Restaurant',
                            nameEn: rb.nameEn || '',
                            branchName: rb.branchName || 'Main Branch',
                            cityName: rb.cityName || ''
                        };
                    }
                });

                // Add these branches to restaurants if they don't exist
                const newRestaurants = [...restaurants];
                completeRestaurantBranches.forEach(branch => {
                    const exists = newRestaurants.some(r =>
                        r.id === branch.id && r.branchId === branch.branchId
                    );
                    if (!exists) {
                        newRestaurants.push(branch);
                    }
                });

                // Update restaurants state if we added new ones
                if (newRestaurants.length > restaurants.length) {
                    setRestaurants(newRestaurants);
                }
            }

            console.log('🌿 Converted branches:', selectedBranches);


            // Set restaurants to expanded state if they have selected branches
            const restaurantsToExpand = [...new Set(selectedBranches.map(b => b.restaurantId))];
            setExpandedRestaurants(restaurantsToExpand);
            
            
            // STEP 2: Set form data
            const formDataToSet = {
                // Basic Information
                name: offerDetail.name || '',
                nameEn: offerDetail.nameEn || '',
                description: offerDetail.description || '',
                descriptionEn: offerDetail.descriptionEn || '',

                // Offer Configuration
                offerType: offerDetail.offerType || 1,
                discountType: offerDetail.discountType || 1,
                discountValue: offerDetail.discountValue?.toString() || '',
                maxDiscountAmount: offerDetail.maxDiscountAmount?.toString() || '',
                minOrderAmount: offerDetail.minOrderAmount?.toString() || '',
                priority: offerDetail.priority || 1,
                isStackable: offerDetail.isStackable || false,

                // Usage Limits
                maxUsagePerUser: offerDetail.maxUsagePerUser?.toString() || '',
                wheelsContribution: offerDetail.wheelsContribution || 0,
                maxUsageTotal: offerDetail.maxUsageTotal?.toString() || '',

                // FIXED: Dates - convert DateTime to date string format
                startDate: formatDateForInput(offerDetail.startDate),
                endDate: formatDateForInput(offerDetail.endDate),
                isActive: offerDetail.isActive !== undefined ? offerDetail.isActive : true,

                // BuyXGetY properties
                buyQuantity: offerDetail.buyQuantity?.toString() || '',
                getQuantity: offerDetail.getQuantity?.toString() || '',
                getDiscountPercent: offerDetail.getDiscountPercent || 100,

                // Enhanced properties
                isFirstOrderOnly: offerDetail.isFirstOrderOnly || false,
                userTiers: offerDetail.userTiers || [],
                dayOfWeek: offerDetail.dayOfWeek || [],

                // FIXED: Time fields - handle DateTime or time strings
                startTime: formatTimeOnlyForInput(offerDetail.startTime),
                endTime: formatTimeOnlyForInput(offerDetail.endTime),

                minItemQuantity: offerDetail.minItemQuantity?.toString() || '',

                // Combo properties
                isComboOffer: offerDetail.isComboOffer || false,
                comboItems: offerDetail.comboItems || [],

                // Coupon properties
                couponCode: offerDetail.couponCode || '',
                requiresCouponCode: offerDetail.requiresCouponCode || false,

                // Flash sale
                flashSaleQuantity: offerDetail.flashSaleQuantity?.toString() || '',

                // Targeting
                RestaurantIds: offerDetail.restaurantIds || [],
                RestaurantBranches: selectedBranches || [],
                Targets: offerDetail.targets?.map(t => t.targetId) || []
            };

            if (offerDetail.offerType === 8) {
                // Determine combo target type from existing combo items
                const hasProducts = offerDetail.comboItems?.some(item =>
                    products.find(p => p.id === item.productId)
                );
                const hasCategories = offerDetail.comboItems?.some(item =>
                    categories.find(c => c.id === item.productId)
                );

                if (hasCategories && !hasProducts) {
                    setComboTargetType('Category');
                } else {
                    setComboTargetType('Product'); // default
                }
            }
            console.log('📝 STEP 2: Setting form data:', formDataToSet);
            setFormData(formDataToSet);

            if (formDataToSet.RestaurantIds.length > 0) {
                setSelectedProductRestaurants(formDataToSet.RestaurantIds);

                // IMPORTANT: Wait for restaurants to be fully loaded first
                await new Promise(resolve => setTimeout(resolve, 100));

                await Promise.all([
                    loadCategoriesForRestaurants(formDataToSet.RestaurantIds),
                    loadProductsForRestaurants(formDataToSet.RestaurantIds)
                ]);
            }

            // STEP 3: For product/category offers, sync restaurant selections
            if ((formDataToSet.offerType === 1 || formDataToSet.offerType === 2) || ([5, 6, 7].includes(formDataToSet.offerType) &&
                ['product', 'category'].includes(initialSubOfferType) &&
                formDataToSet.RestaurantIds.length > 0)) {
                console.log('🎯 STEP 3: Processing product/category offer');

                // Use RestaurantIds as the source of truth for restaurant selection
                const restaurantsToSelect = formDataToSet.RestaurantIds || [];
                console.log('🏪 Restaurants from RestaurantIds:', restaurantsToSelect);

                if (restaurantsToSelect.length > 0) {
                    // Set restaurant selection for product filtering
                    setSelectedProductRestaurants(restaurantsToSelect);

                    console.log('🔄 STEP 4: Loading products/categories for selected restaurants:', restaurantsToSelect);
                    // Load products/categories for these restaurants
                    await Promise.all([
                        loadCategoriesForRestaurants(restaurantsToSelect),
                        loadProductsForRestaurants(restaurantsToSelect)
                    ]);

                    console.log('✅ STEP 5: Data loaded for restaurants');
                } else {
                    // No restaurants selected, reset and show all
                    setSelectedProductRestaurants([]);
                    console.log('ℹ️ No restaurants selected, showing all items');
                }
            } else {
                // For other offer types, reset restaurant selection
                setSelectedProductRestaurants([]);
                console.log('ℹ️ Not a product/category offer');
            }

            setShowCreateModal(true);
            console.log('🎉 EDIT PROCESS COMPLETED SUCCESSFULLY');

        } catch (error) {
            console.error('❌ Error in handleEdit:', error);
            // Fallback
            setFormData({
                ...offer,
                RestaurantIds: offer.restaurantIds || [],
                Targets: offer.targets?.map(t => t.targetId) || [],
                userTiers: offer.userTiers || [],
                dayOfWeek: offer.dayOfWeek || [],
                comboItems: offer.comboItems || []
            });
            setShowCreateModal(true);
        }
    };

    const renderTestConfiguration = () => (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Enhanced Test Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">User ID</label>
                    <input
                        type="text"
                        value={enhancedTestConfig.userId}
                        onChange={(e) => setEnhancedTestConfig(prev => ({ ...prev, userId: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        placeholder="022b5474-db3d-47eb-9d5d-cf7880ee194f"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Restaurant</label>
                    <input
                        type="text"
                        placeholder="Search restaurants..."
                        value={restaurantSearch}
                        onChange={(e) => setRestaurantSearch(e.target.value)}
                        className="w-full p-2 border rounded-md mb-2 text-sm"
                    />
                    <select
                        value={enhancedTestConfig.restaurantId}
                        onChange={(e) => {
                            const newRestaurantId = e.target.value;
                            setEnhancedTestConfig(prev => ({
                                ...prev,
                                restaurantId: newRestaurantId,
                                branchId: '' // Reset branch when restaurant changes
                            }));

                            if (newRestaurantId) {
                                loadItemsForRestaurant(newRestaurantId);
                            } else {
                                setAvailableItems([]);
                            }
                        }}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">Select Restaurant</option>
                        {getUniqueRestaurants()
                            .filter(restaurant =>
                                !restaurantSearch ||
                                restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
                                (restaurant.nameEn && restaurant.nameEn.toLowerCase().includes(restaurantSearch.toLowerCase()))
                            )
                            .map(restaurant => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {restaurant.name}
                                </option>
                            ))}
                    </select>
                </div>

                {enhancedTestConfig.restaurantId && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Branch *</label>
                        <select
                            value={enhancedTestConfig.branchId}
                            onChange={(e) => setEnhancedTestConfig(prev => ({
                                ...prev,
                                branchId: e.target.value
                            }))}
                            className="w-full p-2 border rounded-md"
                            required
                        >
                            <option value="">Select Branch</option>
                            {getBranchesForRestaurant(enhancedTestConfig.restaurantId).map(branch => (
                                <option key={branch.branchId} value={branch.branchId}>
                                    {branch.branchName || 'Main Branch'}
                                    {branch.cityName && ` - ${branch.cityName}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Delivery Fee (شيقل)</label>
                    <input
                        type="number"
                        value={enhancedTestConfig.deliveryFee}
                        onChange={(e) => setEnhancedTestConfig(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2 border rounded-md"
                        step="0.5"
                        min="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Coupon Code (Optional)</label>
                    <input
                        type="text"
                        value={enhancedTestConfig.couponCode}
                        onChange={(e) => setEnhancedTestConfig(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                        className="w-full p-2 border rounded-md"
                        placeholder="SAVE20"
                        style={{ textTransform: 'uppercase' }}
                    />
                </div>
            </div>

            <div className="col-span-2 p-2 bg-gray-50 rounded text-sm">
                <strong>Status:</strong>
                Restaurant: {enhancedTestConfig.restaurantId ? '✅ Selected' : '❌ None'} |
                Branch: {enhancedTestConfig.branchId ? '✅ Selected' : '❌ None'} |
                Items Available: {availableItems.length}
            </div>
        </div>
    );
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';

        try {
            // Handle different date formats from API
            const date = new Date(dateValue);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateValue);
                return '';
            }

            // Convert to YYYY-MM-DD format required by HTML date input
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Error parsing date:', dateValue, error);
            return '';
        }
    };

    const formatTimeOnlyForInput = (timeOnlyValue) => {
        if (!timeOnlyValue) return null;

        try {
            // TimeOnly typically comes as "14:30:00" or "14:30:00.000"
            if (typeof timeOnlyValue === 'string') {
                // Extract HH:MM from TimeOnly format (remove seconds if present)
                const timeParts = timeOnlyValue.split(':');
                if (timeParts.length >= 2) {
                    return `${timeParts[0]}:${timeParts[1]}`; // Return HH:MM
                }
            }

            return timeOnlyValue.toString();
        } catch (error) {
            console.warn('Error parsing TimeOnly:', timeOnlyValue, error);
            return null;
        }
    };
    
    const handleDelete = async (offerId) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            try {
                const handledeleteurl = API_BASE_URL.concat('/api/admin/OffersManagement/' + offerId);
                await fetch(handledeleteurl, { method: 'DELETE' });
                setOffers(prev => prev.filter(offer => offer.offerId !== offerId));
            } catch (error) {
                console.error('Error deleting offer:', error);
            }
        }
    };

    const getStatusColor = (offer) => {
        if (!offer.isActive) return 'bg-gray-100 text-gray-600';
        if (new Date(offer.endDate) < new Date()) return 'bg-red-100 text-red-600';
        if (offer.maxUsageTotal && offer.currentUsage >= offer.maxUsageTotal) return 'bg-orange-100 text-orange-600';
        if (offer.flashSaleQuantity && offer.flashSaleUsed >= offer.flashSaleQuantity) return 'bg-purple-100 text-purple-600';
        return 'bg-green-100 text-green-600';
    };

    const getStatusText = (offer) => {
        if (!offer.isActive) return 'Inactive';
        if (new Date(offer.endDate) < new Date()) return 'Expired';
        if (offer.maxUsageTotal && offer.currentUsage >= offer.maxUsageTotal) return 'Limit Reached';
        if (offer.flashSaleQuantity && offer.flashSaleUsed >= offer.flashSaleQuantity) return 'Sold Out';
        return 'Active';
    };

    const getOfferIcon = (offerType) => {
        const type = offerTypes.find(t => t.value === offerType);
        return type ? type.icon : <Gift className="w-5 h-5" />;
    };
    
    const getOfferBadges = (offer) => {
        const badges = [];
        if (offer.isFirstOrderOnly) badges.push({ text: 'NEW CUSTOMER', color: 'bg-red-100 text-blue-800' });
        if (offer.requiresCouponCode) badges.push({ text: 'COUPON', color: 'bg-purple-100 text-purple-800' });
        if (offer.userTiers?.length) badges.push({ text: 'VIP', color: 'bg-yellow-100 text-yellow-800' });
        if (offer.flashSaleQuantity) badges.push({ text: 'FLASH SALE', color: 'bg-red-100 text-red-800' });
        if (offer.dayOfWeek?.length && offer.dayOfWeek.length < 7) badges.push({ text: 'TIME LIMITED', color: 'bg-green-100 text-green-800' });
        return badges;
    };
    const validateForm = () => {
        const errors = [];
        let discountValueD = parseFloat(formData.discountValue);
        let flashSaleQuantityD = parseFloat(formData.flashSaleQuantity);
        let buyQuantityD = parseFloat(formData.buyQuantity);
        let getQuantityD = parseFloat(formData.getQuantity);
        
        // Basic required fields
        if (!formData.name.trim()) errors.push('Offer name (Arabic) is required');
        if (!formData.startDate) errors.push('Start date is required');
        if (!formData.endDate) errors.push('End date is required');
        if (!formData.discountValue || (!isNaN(discountValueD) && discountValueD <= 0)) errors.push('Discount value must be greater than 0');
        if (formData.RestaurantIds.length === 0) errors.push('At least one restaurant must be selected');

        // Offer type specific validation
        switch (formData.offerType) {
            case 1: // Product Specific
                if (formData.Targets.length === 0) errors.push('At least one product must be selected');
                break;

            case 2: // Category
                if (formData.Targets.length === 0) errors.push('At least one category must be selected');
                break;

            case 5: // First Order
                if (!formData.isFirstOrderOnly) errors.push('First order flag must be enabled');
                break;

            case 6: // Loyalty Tier
                if (formData.userTiers.length === 0) errors.push('At least one loyalty tier must be selected');
                break;

            case 7: // Time-Based
                if (formData.dayOfWeek.length === 0) errors.push('At least one day of week must be selected');
                if (!formData.startTime) errors.push('Start time is required');
                if (!formData.endTime) errors.push('End time is required');
                break;

            case 8: // Combo Deal
                if (formData.comboItems.length === 0) errors.push('At least one combo item must be added');
                break;

            case 9: // Flash Sale
                if (!formData.flashSaleQuantity || (!isNaN(flashSaleQuantityD) && flashSaleQuantityD <= 0)) {
                    errors.push('Flash sale quantity must be greater than 0');
                }
                break;
        }

        // Discount type specific validation
        if (formData.discountType === 3) { // BuyXGetY
            if (!formData.buyQuantity || (!isNaN(buyQuantityD) && buyQuantityD <= 0)) {
                errors.push('Buy quantity must be greater than 0');
            }
            if (!formData.getQuantity || (!isNaN(getQuantityD) && getQuantityD <= 0)) {
                errors.push('Get quantity must be greater than 0');
            }
        }

        // Date validation
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) >= new Date(formData.endDate)) {
                errors.push('End date must be after start date');
            }
        }

        // Time validation for time-based offers
        if (formData.offerType === 7 && formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                errors.push('End time must be after start time');
            }
        }

        return errors;
    };

    const renderOfferForm = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                    </h2>
                    <button
                        onClick={() => {
                            setShowCreateModal(false);
                            setEditingOffer(null);
                            resetForm();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Basic Information - Always Show */}
                    {shouldShowField('name', formData.offerType, formData.discountType) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Offer Name (Arabic) *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Offer Name (English)</label>
                                <input
                                    type="text"
                                    value={formData.nameEn}
                                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    )}

                    {/* Description - Always Optional */}
                    {shouldShowField('description', formData.offerType, formData.discountType) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full p-2 border rounded-md h-20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description (English)</label>
                                <textarea
                                    value={formData.descriptionEn}
                                    onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                                    className="w-full p-2 border rounded-md h-20"
                                />
                            </div>
                        </div>
                    )}

                    {/* Offer Type Selection - Always Show */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Offer Type *</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {offerTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleInputChange('offerType', type.value)}
                                    className={`p-4 border rounded-lg text-left hover:shadow-md transition-shadow ${
                                        formData.offerType === type.value
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        {type.icon}
                                        <span className="font-medium">{type.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Discount Type Selection - Filtered by Offer Type */}
                    {renderDiscountTypeSelection()}

                    {/* Discount Configuration - Conditional */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium mb-3">Discount Configuration</h3>

                        {/* BuyXGetY Configuration */}
                        {shouldShowField('buyQuantity', formData.offerType, formData.discountType) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Buy Quantity *</label>
                                    <input
                                        type="number"
                                        value={formData.buyQuantity}
                                        onChange={(e) => handleInputChange('buyQuantity', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Get Quantity *</label>
                                    <input
                                        type="number"
                                        value={formData.getQuantity}
                                        onChange={(e) => handleInputChange('getQuantity', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Get Discount %</label>
                                    <input
                                        type="number"
                                        value={formData.getDiscountPercent}
                                        onChange={(e) => handleInputChange('getDiscountPercent', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        min="0"
                                        max="100"
                                        placeholder="100 = Free"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Free Delivery Notice */}
                        {formData.discountType === 4 && (
                            <div className="bg-red-50 p-3 rounded-md">
                                <p className="text-sm text-red-700">
                                    Free delivery will be applied to delivery fee. No additional configuration needed.
                                </p>
                            </div>
                        )}

                        {/* Standard Discount Configuration */}
                        {[1, 2].includes(formData.discountType) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Discount Value * {formData.discountType === 1 ? '(%)' : '(شيقل)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => handleInputChange('discountValue', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                {shouldShowField('maxDiscountAmount', formData.offerType, formData.discountType) && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Max Discount (شيقل)</label>
                                        <input
                                            type="number"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            min="0"
                                            step="0.01"
                                            placeholder="Optional"
                                        />
                                    </div>
                                )}
                                {shouldShowField('minOrderAmount', formData.offerType, formData.discountType) && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Min Order Amount (شيقل)</label>
                                        <input
                                            type="number"
                                            value={formData.minOrderAmount}
                                            onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            min="0"
                                            step="0.01"
                                            placeholder="Optional"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sub-targeting Section - Conditional */}
                    {shouldShowField('subTargetingSection', formData.offerType, formData.discountType) &&
                        renderSubTargetingSection()
                    }

                    {/* Offer-specific sections - Conditional */}
                    {shouldShowField('firstOrderSection', formData.offerType, formData.discountType) && (
                        <div className="border rounded-lg p-4 bg-red-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-red-600" />
                                First Order Configuration
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isFirstOrderOnly}
                                    onChange={(e) => handleInputChange('isFirstOrderOnly', e.target.checked)}
                                    className="rounded"
                                />
                                <label className="text-sm font-medium">Only for first-time customers *</label>
                            </div>
                            <p className="text-sm text-red-600 mt-2">
                                This offer will only be available to customers placing their first order.
                            </p>
                        </div>
                    )}

                    {shouldShowField('loyaltyTierSection', formData.offerType, formData.discountType) && (
                        <div className="border rounded-lg p-4 bg-yellow-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-600" />
                                Loyalty Tier Selection *
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {userTiers.map(tier => (
                                    <label key={tier} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.userTiers.includes(tier)}
                                            onChange={() => handleMultiSelect('userTiers', tier)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">{tier}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {shouldShowField('timeBasedSection', formData.offerType, formData.discountType) && (
                        <div className="border rounded-lg p-4 bg-green-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                Time-Based Conditions *
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Days of Week *</label>
                                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                    {daysOfWeek.map(day => (
                                        <label key={day} className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={formData.dayOfWeek.includes(day)}
                                                onChange={() => handleMultiSelect('dayOfWeek', day)}
                                                className="rounded"
                                            />
                                            {day.substring(0, 3)}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time *</label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time *</label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {shouldShowField('flashSaleSection', formData.offerType, formData.discountType) && (
                        <div className="border rounded-lg p-4 bg-red-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-600" />
                                Flash Sale Configuration *
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Flash Sale Target Level</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubOfferType('product');
                                            setFormData(prev => ({ ...prev, Targets: [] }));
                                        }}
                                        className={`p-3 border rounded-md text-left ${
                                            subOfferType === 'product'
                                                ? 'border-red-500 bg-red-100 text-red-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Tag className="w-4 h-4" />
                                            <span className="font-medium">Specific Products</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Flash sale on selected products</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubOfferType('category');
                                            setFormData(prev => ({ ...prev, Targets: [] }));
                                        }}
                                        className={`p-3 border rounded-md text-left ${
                                            subOfferType === 'category'
                                                ? 'border-red-500 bg-red-100 text-red-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4" />
                                            <span className="font-medium">Product Categories</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Flash sale on categories</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubOfferType('order');
                                            setFormData(prev => ({ ...prev, Targets: [] }));
                                        }}
                                        className={`p-3 border rounded-md text-left ${
                                            subOfferType === 'order'
                                                ? 'border-red-500 bg-red-100 text-red-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-medium">Entire Order</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Flash sale on total order</p>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total Quantity Available *</label>
                                    <input
                                        type="number"
                                        value={formData.flashSaleQuantity}
                                        onChange={(e) => handleInputChange('flashSaleQuantity', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        min="1"
                                        placeholder="e.g., 100 items"
                                        required
                                    />
                                </div>
                                <div className="flex items-center">
                                    <div className="bg-red-100 p-3 rounded-md">
                                        <p className="text-sm text-red-700">
                                            Offer will automatically deactivate when quantity is reached
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coupon Code Configuration - Always Show */}
                    {shouldShowField('couponCode', formData.offerType, formData.discountType) && (
                        <div className="border rounded-lg p-4 bg-purple-50">
                            <h3 className="font-medium mb-3">Coupon Code (Optional)</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.requiresCouponCode}
                                        onChange={(e) => handleInputChange('requiresCouponCode', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label className="text-sm font-medium">Require coupon code</label>
                                </div>

                                {formData.requiresCouponCode && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                        <input
                                            type="text"
                                            value={formData.couponCode}
                                            onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="e.g., SAVE20"
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Advanced Settings - Always Show */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium mb-3">Advanced Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Priority (1-10)</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-6 md:mt-0">
                                <input
                                    id="isStackable"
                                    type="checkbox"
                                    checked={formData.isStackable}
                                    onChange={(e) => handleInputChange('isStackable', e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="isStackable" className="text-sm font-medium">Allow stacking with other offers</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Min Item Quantity</label>
                                <input
                                    type="number"
                                    value={formData.minItemQuantity}
                                    onChange={(e) => handleInputChange('minItemQuantity', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Max Usage / User</label>
                                <input
                                    type="number"
                                    value={formData.maxUsagePerUser}
                                    onChange={(e) => handleInputChange('maxUsagePerUser', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Max Usage Total</label>
                                <input
                                    type="number"
                                    value={formData.maxUsageTotal}
                                    onChange={(e) => handleInputChange('maxUsageTotal', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date *</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Wheels Contribution</label>
                                    <input
                                        type="number"
                                        value={formData.wheelsContribution}
                                        onChange={(e) => handleInputChange('wheelsContribution', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Restaurant Selection - Always Show */}
                    {shouldShowField('restaurantSelection', formData.offerType, formData.discountType) &&
                        renderRestaurantBranchSelection()
                    }

                    {/* Combo Section - Conditional */}
                    {shouldShowField('comboSection', formData.offerType, formData.discountType) &&
                        renderComboSection()
                    }

                    {/* Target Selection - Conditional */}
                    {shouldShowField('targetSelection', formData.offerType, formData.discountType, subOfferType) &&
                        renderTargetSelection()
                    }

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateModal(false);
                                setEditingOffer(null);
                                resetForm();
                            }}
                            className="px-4 py-2 rounded-md border"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            {loading ? 'Saving…' : 'Save Offer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ---- New helpers ----
    const normalizeCity = (s) => (s || '').trim().toLowerCase();

// Tries to pull a branch id from common field names
    const pickBranchId = (b) => b?.branchId ?? b?.id ?? b?.Id ?? b?.branchID;

// Build: Map<normalizedCity, Set<branchId>>
    function buildCityToBranchIds(restaurants) {
        const cityToBranchIds = new Map();

        const push = (city, branchId) => {
            if (!city || branchId == null) return;
            const key = normalizeCity(city);
            if (!cityToBranchIds.has(key)) cityToBranchIds.set(key, new Set());
            cityToBranchIds.get(key).add(branchId);
        };

        if (Array.isArray(restaurants)) {
            for (const r of restaurants) {
                // Case A: restaurants are { cityName, branches: [...] }
                if (Array.isArray(r?.branches)) {
                    for (const b of r.branches) {
                        push(r.cityName ?? r.city ?? b.cityName ?? b.city, pickBranchId(b));
                    }
                } else {
                    // Case B: already flat "branch-like" items { cityName, branchId/id }
                    push(r.cityName ?? r.city, pickBranchId(r));
                }
            }
        } else if (restaurants && typeof restaurants === 'object') {
            // Case C: { [cityName]: Branch[] }
            for (const [city, branches] of Object.entries(restaurants)) {
                if (!Array.isArray(branches)) continue;
                for (const b of branches) push(city, pickBranchId(b));
            }
        }

        return cityToBranchIds;
    }

    /**
     * Returns cities (normalized names) where the offer covers ALL branches,
     * plus a coverage breakdown per city and a quick boolean.
     */
    function getOfferCityCoverage(offer, restaurants) {
        const offeredBranchIds = new Set(
            (offer?.restaurantBranches ?? [])
                .map(b => pickBranchId(b))
                .filter(Boolean)
        );

        const cityToBranchIds = buildCityToBranchIds(restaurants);
        const citiesFullyCovered = [];
        const coverageByCity = {};

        for (const [cityKey, branchIdSet] of cityToBranchIds.entries()) {
            let coveredCount = 0;
            for (const id of branchIdSet) if (offeredBranchIds.has(id)) coveredCount++;

            const total = branchIdSet.size;
            const isFullCoverage = total > 0 && coveredCount === total;

            if (isFullCoverage) citiesFullyCovered.push(cityKey);

            coverageByCity[cityKey] = {
                coveredCount,
                total,
                isFullCoverage,
                missingBranchIds: [...branchIdSet].filter(id => !offeredBranchIds.has(id)),
            };
        }

        return {
            citiesFullyCovered,              // array of normalized city names fully covered
            hasAnyFullCity: citiesFullyCovered.length > 0,
            coverageByCity,                  // per-city details for debugging/UX
            citiesInOffer: getCitiesFromOffer(offer), // from your original helper
        };
    }
    const getCitiesFromOffer = (offer) => {
        if (!offer.restaurantBranches || offer.restaurantBranches.length === 0) return [];
        const cities = [...new Set(offer.restaurantBranches
            .map(rb => rb.cityName)
            .filter(city => city && city.trim())
        )];
        return cities;
    };
    const OfferCard = ({ offer }) => {
        
        const result = getOfferCityCoverage(offer, restaurants);
        if (result.hasAnyFullCity) {
            console.log('Offer fully covers at least one city:', result.citiesFullyCovered);
        } else {
            console.log('No city is fully covered.');
        }
        const cities = result.citiesFullyCovered;
        const isOrderLevel = isOrderLevelOffer(offer);

        return (
            <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
                {/* Header with Status */}
                <div className="p-5 border-b border-gray-100 flex-grow">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${
                                offer.isActive ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                                {getOfferIcon(offer.offerType)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{offer.name}</h4>
                                <p className="text-sm text-gray-500 font-medium">
                                    {getOfferTypeName(offer.offerType)} • {getDiscountTypeName(offer.discountType)}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(offer)}`}>
                        {getStatusText(offer)}
                    </span>
                    </div>

                    {/* Discount Value Display */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Discount Value</span>
                            <div className="text-right">
                            <span className="text-xl font-bold text-green-600">
                                {offer.discountType === 1 ? `${offer.discountValue}%` :
                                    offer.discountType === 2 ? `${offer.discountValue} ₪` :
                                        offer.discountType === 4 ? 'Free Delivery' : 'Buy X Get Y'}
                            </span>
                                {offer.maxDiscountAmount && (
                                    <p className="text-xs text-gray-500">Max: {offer.maxDiscountAmount} ₪</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* City Indicator */}
                    {isOrderLevel && cities.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                             🏙️ {String(cities.length === 1             ? cities[0]             : cities.length <= 2                 ? cities.join(', ')                 : `${cities.length} cities`         )}
                        </span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {getOfferBadges(offer).map((badge, i) => (
                            <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.text}
                        </span>
                        ))}
                        {isOrderLevel && cities.length > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            CITY-WIDE
                        </span>
                        )}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="p-5 bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                            <div className="text-lg font-bold text-gray-900">{offer.priority ?? '5'}</div>
                            <div className="text-xs text-gray-500">Priority</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-blue-600">{offer.currentUsage ?? 0}</div>
                            <div className="text-xs text-gray-500">Used</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-600">
                                {offer.maxUsageTotal ? offer.maxUsageTotal : '∞'}
                            </div>
                            <div className="text-xs text-gray-500">Limit</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {offer.maxUsageTotal && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Usage Progress</span>
                                <span>{Math.round(((offer.currentUsage || 0) / offer.maxUsageTotal) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${Math.min(((offer.currentUsage || 0) / offer.maxUsageTotal) * 100, 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Date Range */}
                    {offer.startDate && offer.endDate && (
                        <div className="text-xs text-gray-500 bg-white rounded-lg p-2 mb-4 border">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(offer.startDate).toLocaleDateString()} → {new Date(offer.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(offer)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(offer.offerId)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all font-medium text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderSubTargetingSection = () => {
        if (![5, 6, 7].includes(formData.offerType)) return null;

        const offerTypeNames = {
            5: 'First Order',
            6: 'Loyalty Tier',
            7: 'Time-Based'
        };

        return (
            <div className="border rounded-lg p-4 bg-red-50">
                <h3 className="font-medium mb-3">
                    {offerTypeNames[formData.offerType]} Target Level
                </h3>
                <p className="text-sm text-red-600 mb-3">
                    Choose whether this {offerTypeNames[formData.offerType].toLowerCase()} offer applies to specific products, categories, or the entire order.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => handleSubOfferTypeChange('product')} // Use the new handler
                        className={`p-3 border rounded-md text-left ${
                            subOfferType === 'product'
                                ? 'border-red-500 bg-red-100 text-red-700'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Tag className="w-4 h-4" />
                            <span className="font-medium">Specific Products</span>
                        </div>
                        <p className="text-xs text-gray-600">Apply to selected products only</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubOfferTypeChange('category')} // Use the new handler
                        className={`p-3 border rounded-md text-left ${
                            subOfferType === 'category'
                                ? 'border-red-500 bg-red-100 text-red-700'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4" />
                            <span className="font-medium">Product Categories</span>
                        </div>
                        <p className="text-xs text-gray-600">Apply to selected categories</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubOfferTypeChange('order')} // Use the new handler
                        className={`p-3 border rounded-md text-left ${
                            subOfferType === 'order'
                                ? 'border-red-500 bg-red-100 text-red-700'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">Entire Order</span>
                        </div>
                        <p className="text-xs text-gray-600">Apply to total order amount</p>
                    </button>
                </div>

                {/* Debug info - remove in production */}
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>Debug:</strong> SubType: {subOfferType},
                    Restaurants: {formData.RestaurantIds.length},
                    Products: {products.length},
                    Categories: {categories.length}
                </div>
            </div>
        );
    };


    // Modified combo section to work with restaurant-specific products
    const renderComboSection = () => {
        if (formData.offerType !== 8) return null;

        return (
            <div className="border rounded-lg p-4 bg-orange-50">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Combo Deal Configuration
                </h3>

                {/* Warning if no restaurants selected */}
                {formData.RestaurantIds.length === 0 && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                        <strong>⚠️ Please select restaurants above first</strong><br/>
                        Combo items can only be selected from products/categories available in the selected restaurants.
                    </div>
                )}

                {formData.RestaurantIds.length > 0 && (
                    <>
                        {/* Debug info - remove in production */}
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <strong>Debug:</strong>
                            Target: {comboTargetType},
                            Restaurants: {formData.RestaurantIds.length},
                            Products: {products.length},
                            Categories: {categories.length},
                            Filtered: {getFilteredComboItems().length}
                        </div>

                        {/* Combo Target Type Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Combo Target Type</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleComboTargetTypeChange('Product')}
                                    className={`p-3 border rounded-md text-left ${
                                        comboTargetType === 'Product'
                                            ? 'border-orange-500 bg-orange-100 text-orange-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Tag className="w-4 h-4" />
                                        <span className="font-medium">Products</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Combo with specific products</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleComboTargetTypeChange('Category')}
                                    className={`p-3 border rounded-md text-left ${
                                        comboTargetType === 'Category'
                                            ? 'border-orange-500 bg-orange-100 text-orange-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="w-4 h-4" />
                                        <span className="font-medium">Categories</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Combo with product categories</p>
                                </button>
                            </div>
                        </div>

                        {/* Restaurant filter for combo items */}
                        {formData.RestaurantIds.length > 1 && (
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Filter by Restaurant</label>
                                <select
                                    value={selectedComboRestaurant}
                                    onChange={(e) => handleComboRestaurantChange(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">All Selected Restaurants</option>
                                    {restaurants
                                        .filter(r => formData.RestaurantIds.includes(r.id))
                                        .map(restaurant => (
                                            <option key={restaurant.id} value={restaurant.id}>
                                                {restaurant.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        {/* Selected combo items */}
                        {formData.comboItems.length > 0 && (
                            <div className="mb-4 p-3 bg-orange-100 rounded-md">
                                <p className="text-sm font-medium text-orange-800 mb-3">
                                    Selected Combo Items ({formData.comboItems.length}):
                                </p>
                                <div className="space-y-2">
                                    {formData.comboItems.map(comboItem => {
                                        const item = comboTargetType === 'Product'
                                            ? products.find(p => p.id === comboItem.productId)
                                            : categories.find(c => c.id === comboItem.productId);
                                        const restaurant = restaurants.find(r => r.id === item?.restaurantId);
                                        return item ? (
                                            <div key={comboItem.productId} className="bg-white p-3 rounded border">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                                                    <div>
                                                        <span className="font-medium text-sm">{item.name}</span>
                                                        {comboTargetType === 'Product' && item.price && (
                                                            <span className="text-xs text-gray-500 block">{item.price} شيقل</span>
                                                        )}
                                                        <span className="text-xs text-red-600 block">
                                                        {restaurant?.name || 'Unknown Restaurant'}
                                                    </span>
                                                        <span className="text-xs text-purple-600 block">
                                                        {comboTargetType === 'Product' ? 'Product' : 'Category'}
                                                    </span>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Required Qty</label>
                                                        <input
                                                            type="number"
                                                            value={comboItem.requiredQuantity}
                                                            onChange={(e) => updateComboItem(comboItem.productId, 'requiredQuantity', e.target.value)}
                                                            className="w-full p-1 border rounded text-sm"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Discount %</label>
                                                        <input
                                                            type="number"
                                                            value={comboItem.discountPercent}
                                                            onChange={(e) => updateComboItem(comboItem.productId, 'discountPercent', e.target.value)}
                                                            className="w-full p-1 border rounded text-sm"
                                                            min="0"
                                                            max="100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-600">Est. Savings/combo</span>
                                                        <span className="block text-sm font-medium text-green-600">
                                                        {comboTargetType === 'product' && item.price ?
                                                            ((item.price || 0) * comboItem.requiredQuantity * (comboItem.discountPercent / 100)).toFixed(2) + ' شيقل'
                                                            : 'Variable'
                                                        }
                                                    </span>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeComboItem(comboItem.productId)}
                                                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Add Items Section */}
                        <div className="border rounded-md">
                            <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                                <h4 className="font-medium text-sm">
                                    Add {comboTargetType === 'Product' ? 'Products' : 'Categories'} to Combo
                                </h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Search ${comboTargetType === 'Product' ? 'products' : 'categories'}...`}
                                        value={comboProductSearch}
                                        onChange={(e) => setComboProductSearch(e.target.value)}
                                        className="px-2 py-1 border rounded text-sm w-48"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('🔄 Manual reload triggered');
                                            if (comboTargetType === 'Product') {
                                                loadProductsForRestaurants(formData.RestaurantIds);
                                            } else {
                                                loadCategoriesForRestaurants(formData.RestaurantIds);
                                            }
                                        }}
                                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                    >
                                        Reload
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto">
                                {getFilteredComboItems().length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <p>No {comboTargetType === 'Product' ? 'products' : 'categories'} found</p>
                                        <div className="text-xs mt-2 space-y-1">
                                            <p>Restaurants selected: {formData.RestaurantIds.length}</p>
                                            <p>Total {comboTargetType}s: {comboTargetType === 'Product' ? products.length : categories.length}</p>
                                            <p>Check console for debugging info</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (comboTargetType === 'Product') {
                                                    loadProductsForRestaurants(formData.RestaurantIds);
                                                } else {
                                                    loadCategoriesForRestaurants(formData.RestaurantIds);
                                                }
                                            }}
                                            className="mt-2 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                                        >
                                            Try Reload Data
                                        </button>
                                    </div>
                                ) : (
                                    getFilteredComboItems().map(item => {
                                        const isSelected = formData.comboItems.some(comboItem => comboItem.productId === item.id);
                                        const restaurant = restaurants.find(r => r.id === item.restaurantId);
                                        return (
                                            <div key={item.id} className={`p-3 border-b flex items-center justify-between hover:bg-gray-50 ${
                                                isSelected ? 'bg-orange-50 opacity-60' : ''
                                            }`}>
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                    {comboTargetType === 'Product' && item.price && (
                                                        <span className="text-xs text-gray-500 block">{item.price} شيقل</span>
                                                    )}
                                                    <span className="text-xs text-red-500">
                    {item.restaurantName || 'Unknown Restaurant'}
                                                </span>
                                                </div>

                                                {isSelected ? (
                                                    <span className="text-xs text-orange-600 font-medium">Already Added</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => addComboItem(item.id)}
                                                        className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        Add
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Combo Summary */}
                        {formData.comboItems.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                                <strong>Combo Summary:</strong> {formData.comboItems.length} items selected.
                                When customers buy all required quantities, they'll get the specified discounts on each item.
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // Modified product/category selection section
    const renderTargetSelection = () => {
        // Show for product/category offers OR sub-targeted loyalty/timeslot/firstorder offers
        const showTargets = formData.offerType === 1 || formData.offerType === 2 ||
            ([5, 6, 7, 9].includes(formData.offerType) && ['product', 'category'].includes(subOfferType));

        if (!showTargets) return null;

        const isProductTarget = formData.offerType === 1 ||
            ([5, 6, 7].includes(formData.offerType) && subOfferType === 'product');
        const targetType = isProductTarget ? 'Products' : 'Categories';

        return (
            <div>
                <label className="block text-sm font-medium mb-2">
                    Select {targetType}
                </label>

                {/* Show sync status */}
                <div className="mb-4 p-3 bg-red-50 border border-blue-200 rounded text-sm">
                    <strong>Restaurant Filter Status:</strong><br/>
                    Selected Restaurants: {formData.RestaurantIds.length}<br/>
                    {formData.RestaurantIds.length > 0 && (
                        <>
                            Showing {targetType.toLowerCase()} from: {
                            formData.RestaurantIds.map(id => {
                                const restaurant = restaurants.find(r => r.id === id);
                                return restaurant ? restaurant.name : id;
                            }).join(', ')
                        }
                        </>
                    )}
                    {formData.RestaurantIds.length === 0 && (
                        <span className="text-orange-600">Select restaurants above first to filter {targetType.toLowerCase()}</span>
                    )}
                </div>

                {/* Search */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder={`Search ${targetType.toLowerCase()}...`}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                    />
                </div>

                {/* Selected items tags */}
                {formData.Targets?.length > 0 && (
                    <div className="mb-3 p-3 bg-green-50 rounded-md">
                        <p className="text-sm font-medium text-green-800 mb-2">
                            Selected {targetType} ({formData.Targets?.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {formData.Targets.map(targetId => {
                                const item = (isProductTarget ? products : categories).find(i => i.id === targetId);
                                return (
                                    <span key={targetId} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {item ? item.name : `Item ${targetId}`}
                                        {isProductTarget && item?.price && (
                                            <span className="text-green-600">- {item.price} شيقل</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => toggleTargetSelection(targetId)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Items list */}
                <div className="border rounded-md max-h-60 overflow-y-auto">
                    {getFilteredProductsByRestaurants().length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p>
                                {formData.RestaurantIds.length === 0
                                    ? `Select restaurants above to see ${targetType.toLowerCase()}`
                                    : `No ${targetType.toLowerCase()} found for selected restaurants`
                                }
                            </p>
                            <div className="mt-2 text-xs text-gray-400">
                                Total available: {isProductTarget ? products.length : categories.length} items
                            </div>
                        </div>
                    ) : (
                        getFilteredProductsByRestaurants().map(item => (
                            <div
                                key={item.id}
                                onClick={() => toggleTargetSelection(item.id)}
                                className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                                    formData.Targets.includes(item.id)
                                        ? 'bg-green-50 border-green-200'
                                        : ''
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium">{item.name}</span>
                                        {isProductTarget && item.price && (
                                            <span className="text-xs text-gray-500 block">{item.price} شيقل</span>
                                        )}
                                        <span className="text-xs text-gray-400 block">
                        Restaurant: {item.restaurantName || item.restaurantId}
                                    </span>
                                    </div>
                                    {formData.Targets.includes(item.id) && (
                                        <Check className="w-4 h-4 text-green-600" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };
    const renderEnhancedTestOrderTab = () => (
        
        <div className="space-y-6">
            {/* Test Configuration */}
            {renderTestConfiguration()}

            {/* Order Items */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    {enhancedTestConfig.restaurantId && (
                        <button
                            onClick={() => setShowItemSelector(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    )}
                </div>

                {!enhancedTestConfig.restaurantId && (
                    <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Select a restaurant first to add items</p>
                    </div>
                )}

                {enhancedOrderItems.length === 0 && enhancedTestConfig.restaurantId && (
                    <div className="text-center py-8 text-gray-500">
                        <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No items added yet. Click "Add Item" to start building your test order.</p>
                    </div>
                )}

                {/* Order Items List */}
                <div className="space-y-3">
                    {enhancedOrderItems.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Item Header */}
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <Tag className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>Product ID: {item.productId}</span>
                                                {item.categoryId && <span>Category: {item.categoryName || item.categoryId}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeEnhancedOrderItem(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove item"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Item Controls */}
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit Price
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updateEnhancedOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-8"
                                                step="0.5"
                                                min="0"
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">₪</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity
                                        </label>
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => updateEnhancedOrderItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                className="p-2 border border-gray-300 rounded-l-md hover:bg-gray-50"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateEnhancedOrderItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-16 p-2 border-t border-b border-gray-300 text-center text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                min="1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => updateEnhancedOrderItem(index, 'quantity', item.quantity + 1)}
                                                className="p-2 border border-gray-300 rounded-r-md hover:bg-gray-50"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Line Total
                                        </label>
                                        <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                            <span className="text-lg font-bold text-green-600">
                                {item.total.toFixed(2)} ₪
                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-1">Calculation</div>
                                        <div className="text-sm text-gray-600">
                                            {item.price.toFixed(2)} × {item.quantity} = {item.total.toFixed(2)} ₪
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Order Summary */}
                    {enhancedOrderItems.length > 0 && (
                        <div className="border-t-2 border-gray-200 pt-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Order Summary</h4>
                                        <p className="text-sm text-gray-600">{enhancedOrderItems.length} items total</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Subtotal</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {enhancedOrderItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)} ₪
                                        </div>
                                        {enhancedTestConfig.deliveryFee > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                + {enhancedTestConfig.deliveryFee.toFixed(2)} ₪ delivery
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Available Offers */}
            {/* Available Offers */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Available Offers</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={runEnhancedTests}
                            disabled={enhancedLoading || !enhancedTestConfig.restaurantId || enhancedOrderItems.length === 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {enhancedLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            {enhancedLoading ? 'Testing...' : 'Run Tests'}
                        </button>
                        <button
                            onClick={testOfferStacking}
                            disabled={stackingTestLoading || !enhancedTestConfig.restaurantId || enhancedOrderItems.length === 0}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {stackingTestLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Testing Stacking...
                                </>
                            ) : (
                                <>
                                    <Layers className="w-4 h-4" />
                                    Test Offer Stacking
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {enhancedTestConfig.testMode === 'single' && (
                    <p className="text-sm text-gray-600 mb-4">
                        Select offers to test (or leave empty to test all applicable offers)
                    </p>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getApplicableOffers().map(offer => {
                        const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
                        const isInactive = !offer.isActive;
                        const showAsInactive = isInactive || isExpired;

                        return (
                            <div key={offer.offerId} className={`border rounded-lg p-3 transition-colors ${
                                showAsInactive
                                    ? 'border-gray-300 bg-gray-50 opacity-75'
                                    : enhancedTestConfig.selectedOffers.includes(offer.offerId)
                                        ? 'border-red-500 bg-red-50 cursor-pointer'
                                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                            }`}
                                 onClick={() => {
                                     if (enhancedTestConfig.testMode === 'single' && !showAsInactive) {
                                         toggleOfferSelection(offer.offerId);
                                     }
                                 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className={`p-1 rounded ${showAsInactive ? 'opacity-50' : ''}`}>
                                            {getOfferIcon(offer.offerType)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-medium text-sm ${showAsInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                                                    {offer.name}
                                                </h4>
                                                {isInactive && (
                                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-600">
                                            INACTIVE
                                        </span>
                                                )}
                                                {isExpired && !isInactive && (
                                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-600">
                                            EXPIRED
                                        </span>
                                                )}
                                            </div>
                                            <p className={`text-xs ${showAsInactive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {getOfferTypeName(offer.offerType)} • {getDiscountTypeName(offer.discountType)}
                                                {offer.discountValue && ` • ${offer.discountValue}${offer.discountType === 1 ? '%' : ' شيقل'}`}
                                            </p>
                                            {showAsInactive && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {isExpired ? 'This offer has expired' : 'This offer is inactive'} - will not apply during testing
                                                </p>
                                            )}
                                            {offer.endDate && !isExpired && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Expires: {new Date(offer.endDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {enhancedTestConfig.testMode === 'single' && enhancedTestConfig.selectedOffers.includes(offer.offerId) && (
                                            <Check className="w-4 h-4 text-red-600" />
                                        )}
                                        {showAsInactive && (
                                            <XCircle className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {getApplicableOffers().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Gift className="w-6 h-6 text-gray-400" />
                            </div>
                            <p>No offers found for this restaurant and branch combination.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Test Results */}
            {enhancedTestResults.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">Test Results</h3>

                    <div className="space-y-4">
                        {enhancedTestResults.map((result, index) => (
                            <div key={index} className={`border rounded-lg p-4 ${
                                result.isApplicable
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getOfferIcon(result.offer?.offerType)}
                                            <h4 className="font-medium">{result.offer?.name || 'Unknown Offer'}</h4>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                result.isApplicable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {result.isApplicable ? 'Applicable' : 'Not Applicable'}
                                        </span>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-2">
                                            <span>Type: {getOfferTypeName(result.offer?.offerType)} • </span>
                                            <span>Discount: {getDiscountTypeName(result.offer?.discountType)}</span>
                                            {result.offer?.discountValue && (
                                                <span> • Value: {result.offer.discountValue}
                                                    {result.offer.discountType === 1 ? '%' : ' شيقل'}
                                            </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-700">{result.message}</p>
                                    </div>

                                    {result.isApplicable && (
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                                {result.discountAmount?.toFixed(2) || '0.00'} شيقل
                                            </div>
                                            <div className="text-xs text-gray-500">Saved</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-medium">Total Potential Savings:</span>
                                <p className="text-sm text-red-600">
                                    {enhancedTestResults.filter(r => r.isApplicable).length} of {enhancedTestResults.length} offers are applicable
                                </p>
                            </div>
                            <div className="text-3xl font-bold text-red-600">
                                {enhancedTestResults
                                    .filter(r => r.isApplicable)
                                    .reduce((sum, r) => sum + (r.discountAmount || 0), 0)
                                    .toFixed(2)} شيقل
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Add this after the test results */}
            {enhancedTestResults.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="text-yellow-600">⚠️</div>
                        <div>
                            <h4 className="font-medium text-yellow-800">Testing Notes</h4>
                            <p className="text-sm text-yellow-700">
                                Only active, non-expired offers are tested. Inactive or expired offers are automatically excluded from test results.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {stackingTestResults && (
                <div className="bg-white rounded-lg border p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-600" />
                        Offer Stacking Results
                    </h3>

                    {/* Summary Card */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-red-50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{stackingTestResults.applicableCount}</div>
                                <div className="text-sm text-gray-600">Offers Applied</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{stackingTestResults.totalSavings.toFixed(2)} JOD</div>
                                <div className="text-sm text-gray-600">Total Savings</div>
                            </div>
                            <div>
                                <div className="text-lg text-gray-600">{stackingTestResults.orderTotal.toFixed(2)} JOD</div>
                                <div className="text-sm text-gray-600">Original Price</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">{stackingTestResults.finalPrice.toFixed(2)} JOD</div>
                                <div className="text-sm text-gray-600">Final Price</div>
                            </div>
                        </div>

                        {stackingTestResults.totalSavings > 0 && (
                            <div className="mt-3 text-center">
                                <div className="text-lg font-semibold text-green-600">
                                    You save {((stackingTestResults.totalSavings / (stackingTestResults.orderTotal + enhancedTestConfig.deliveryFee)) * 100).toFixed(1)}%
                                    with {stackingTestResults.applicableCount} combined offers!
                                </div>
                            </div>
                        )}

                        {/* Stacking Logic Explanation */}
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                            <strong>Stacking Logic:</strong> {stackingTestResults.stoppingReason}
                        </div>
                    </div>

                    {/* Individual Offer Results */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-800">Individual Offer Breakdown:</h4>
                        {stackingTestResults.offers.map((result, index) => (
                            <div key={index} className={`border rounded-lg p-4 ${
                                result.applied
                                    ? 'border-green-200 bg-green-50'
                                    : result.isApplicable
                                        ? 'border-yellow-200 bg-yellow-50'  // Would apply but blocked
                                        : 'border-gray-200 bg-gray-50'      // Not applicable
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {result.applied ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : result.isApplicable ? (
                                            <XCircle className="w-5 h-5 text-yellow-600" />  // Blocked
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />    // Not applicable
                                        )}

                                        {getOfferIcon(result.details?.offerType)}

                                        <div>
                                            <h5 className="font-medium">{result.details?.offerName || 'Unknown Offer'}</h5>
                                            <div className="text-sm text-gray-600">
                                                <span>Type: {getOfferTypeName(result.details?.offerType)}</span>
                                                {result.offer?.priority && (
                                                    <>
                                                        <span className="mx-2">•</span>
                                                        <span>Priority: {result.details.priority}</span>
                                                    </>
                                                )}
                                                {result.details?.isStackable !== undefined && (
                                                    <>
                                                        <span className="mx-2">•</span>
                                                        <span className={result.details.isStackable ? 'text-green-600' : 'text-red-600'}>
                                                {result.details.isStackable ? 'Stackable' : 'Non-Stackable'}
                                            </span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="text-sm text-gray-700 mt-1">
                                                {result.message}
                                            </div>

                                            {/* Show blocking reason */}
                                            {result.ignoredReason && (
                                                <div className="text-xs text-yellow-700 mt-1 font-medium">
                                                    ⚠️ {result.ignoredReason}
                                                </div>
                                            )}

                                            {/* Show stacking status */}
                                            <div className="text-xs mt-1">
                                    <span className={`px-2 py-1 rounded ${
                                        result.applied
                                            ? 'bg-green-100 text-green-700'
                                            : result.isApplicable
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {result.stackingStatus || (result.applied ? 'Applied' : 'Not Applied')}
                                    </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        {result.applied ? (
                                            <div className="text-2xl font-bold text-green-600">
                                                -{result.discountAmount?.toFixed(2) || '0.00'} JOD
                                            </div>
                                        ) : result.isApplicable ? (
                                            <div className="text-lg text-yellow-600">
                                                ({result.discountAmount?.toFixed(2) || '0.00'} JOD)
                                            </div>
                                        ) : (
                                            <div className="text-lg text-gray-400">
                                                Not Applicable
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500">
                                            {result.applied ? 'Applied' : result.isApplicable ? 'Blocked' : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stacking Information */}
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">📚 How Stacking Works:</h5>
                        <div className="text-sm text-red-700 space-y-1">
                            <div>• Offers are processed by priority (highest first)</div>
                            <div>• Stackable offers can combine with others</div>
                            <div>• Non-stackable offers stop further processing</div>
                            <div>• You get the best combination automatically</div>
                        </div>
                    </div>
                </div>
            )}


            {/* Item Selector Modal */}
            {showItemSelector && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add Item to Order</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        console.log('🔄 Manual data reload');
                                        loadProducts(enhancedTestConfig.restaurantId);
                                        loadCategories(enhancedTestConfig.restaurantId);
                                        setTimeout(() => {
                                            if (enhancedTestConfig.restaurantId) {
                                                loadItemsForRestaurant(enhancedTestConfig.restaurantId);
                                            }
                                        }, 1000);
                                    }}
                                    className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                                >
                                    Reload Data
                                </button>
                                <button
                                    onClick={() => setShowItemSelector(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search products and categories..."
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                className="w-full p-3 border rounded-md"
                                autoFocus
                            />
                        </div>

                        {/* In the modal, replace the item list section with: */}
                        <div className="max-h-96 overflow-y-auto">
                            {availableItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No products found for this restaurant</p>
                                    <div className="mt-2 text-xs">
                                        <p>Selected Restaurant: {enhancedTestConfig.restaurantId || 'None'}</p>
                                        <p>Available Products: {products.filter(p => p.restaurantId === enhancedTestConfig.restaurantId).length}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {getFilteredAvailableItems().map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => addEnhancedOrderItem(product)}
                                            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-medium">{product.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                    Product
                                </span>
                                                        {product.price && (
                                                            <span className="text-xs text-gray-500">
                                        {product.price.toFixed(2)} شيقل
                                    </span>
                                                        )}
                                                        {/* Show category name if available */}
                                                        {product.categoryId && (
                                                            <span className="text-xs text-red-500">
                                        {categories.find(c => c.id === product.categoryId)?.name || 'Category'}
                                    </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Plus className="w-5 h-5 text-red-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Your existing header section */}
            <div className="mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
                    <p className="text-gray-600 mt-1 p-4">Create, manage, and test promotional offers</p>
                </div>
                <div className="flex items-center justify-center mb-6">

                    <div className="flex items-center gap-3">
                        {/* Stats Cards */}
                        <div className="flex items-center gap-4 mr-6">
                            <div className="text-center px-3 py-2 bg-blue-50 rounded-lg">
                                <div className="text-sm font-semibold text-blue-600">{offers.length}</div>
                                <div className="text-sm text-blue-500">Total</div>
                            </div>
                            <div className="text-center px-3 py-2 bg-green-50 rounded-lg">
                                <div className="text-sm font-semibold text-green-600">
                                    {offers.filter(o => o.isActive).length}
                                </div>
                                <div className="text-sm text-green-500">Active</div>
                            </div>
                        </div>
                        {activeTab === 'list' && (
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={showCityOnlyOffers}
                                    onChange={(e) => setShowCityOnlyOffers(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="font-medium">Order level Offers</span>
                            </label>
                        )}

                        {/* Enhanced Tab Navigation - Equal Width */}
                        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-lg w-full max-w-md">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all text-center ${
                                    activeTab === 'list'
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Layers className="w-3 h-3 mx-auto mb-1" />
                                Offers List
                            </button>
                            <button
                                onClick={() => setActiveTab('test')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all text-center ${
                                    activeTab === 'test'
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Play className="w-3 h-3 mx-auto mb-1" />
                                Test Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all text-center ${
                                    activeTab === 'analytics'
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <BarChart className="w-3 h-3 mx-auto mb-1" />
                                Analytics
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-3 py-2 rounded-md text-sm font-medium transition-all text-center bg-red-600 shadow-sm text-white"
                            >
                                <Plus className="w-3 h-3 mx-auto mb-1" />
                                New Offer
                            </button>
                            
                        </div>
                    </div>
                    

                </div>
            </div>

            {/* EQUAL WIDTH CONTENT CONTAINER */}
            <div className="grid grid-cols-1 gap-6 min-h-[600px]">
                {/* List Tab Content */}
                {activeTab === 'list' && (
                    <div className="w-full">
                        
                        {/* Filter Info */}
                        {showCityOnlyOffers && (
                            <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                <div className="flex items-center gap-2">
                                    <span className="text-purple-800 font-medium">🏙️ Showing city-wide offers only</span>
                                    <span className="text-purple-600 text-sm">
                                    (Order-level offers that apply to entire cities)
                                </span>
                                </div>
                            </div>
                        )}

                        {/* Offers Grid - Full Width */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {offers
                                .filter(offer => {
                                    if (!showCityOnlyOffers) return true;
                                    return isOrderLevelOffer(offer);
                                })
                                .map(o => <OfferCard key={o.offerId} offer={o} />)}

                            {offers.filter(offer => {
                                if (!showCityOnlyOffers) return true;
                                return isOrderLevelOffer(offer);
                            }).length === 0 && (
                                <div className="col-span-full text-center text-gray-500 p-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Gift className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-600">
                                            {showCityOnlyOffers ? 'No city-wide offers found' : 'No offers created yet'}
                                        </h3>
                                        <p className="text-gray-500 max-w-md">
                                            {showCityOnlyOffers
                                                ? 'Create order-level offers that apply to entire cities to see them here.'
                                                : 'Start by creating your first promotional offer to boost sales and engagement.'
                                            }
                                        </p>
                                        {!showCityOnlyOffers && (
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create First Offer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Test Tab Content */}
                {activeTab === 'test' && (
                    <div className="w-full">
                        {/* Keep only this: */}
                        {renderEnhancedTestOrderTab()}
                    </div>
                )}

                {/* Analytics Tab Content */}
                {activeTab === 'analytics' && (
                    <div className="w-full">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BarChart className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Analytics Dashboard</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    Comprehensive analytics and reporting for your offers performance, customer engagement, and revenue impact.
                                </p>

                                {/* Analytics Preview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                                        <div className="text-3xl font-bold text-red-600 mb-2">42</div>
                                        <div className="text-sm text-red-800 font-medium">Total Offers</div>
                                        <div className="text-xs text-red-600 mt-1">+12% this month</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                        <div className="text-3xl font-bold text-green-600 mb-2">₪15,430</div>
                                        <div className="text-sm text-green-800 font-medium">Total Savings</div>
                                        <div className="text-xs text-green-600 mt-1">+28% this month</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                                        <div className="text-sm text-blue-800 font-medium">Customer Usage</div>
                                        <div className="text-xs text-blue-600 mt-1">+18% this month</div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Coming Soon:</strong> Advanced analytics dashboard with detailed insights, charts, and reporting features.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Your existing modal */}
            {showCreateModal && renderOfferForm()}
        </div>
    );
};

export default CompleteOffersAdmin;
