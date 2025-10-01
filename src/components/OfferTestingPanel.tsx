import React, { useState, useEffect } from 'react';
import { Play, Plus, Minus, X, Tag, AlertCircle, CheckCircle, XCircle, Package, RefreshCw } from 'lucide-react';

const OfferTestingPanel = ({
                               API_BASE_URL,
                               offers,
                               restaurants,
                               products,
                               categories,
                               getOfferIcon,
                               getOfferTypeName,
                               getDiscountTypeName
                           }) => {
    const [testConfig, setTestConfig] = useState({
        userId: '022b5474-db3d-47eb-9d5d-cf7880ee194f',
        restaurantId: '',
        branchId: '',
        deliveryFee: 10,
        couponCode: ''
    });

    const [orderItems, setOrderItems] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [itemSearch, setItemSearch] = useState('');
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [restaurantSearch, setRestaurantSearch] = useState('');

    // Load products when restaurant changes
    useEffect(() => {
        if (testConfig.restaurantId) {
            loadProductsForRestaurant(testConfig.restaurantId);
        } else {
            setAvailableItems([]);
        }
    }, [testConfig.restaurantId]);

    const loadProductsForRestaurant = async (restaurantId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/products?restaurantId=${restaurantId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setAvailableItems(data.map(p => ({ ...p, type: 'product' })));
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const getUniqueRestaurants = () => {
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

    const addOrderItem = (item) => {
        const categoryForProduct = categories.find(c => c.id === item.categoryId);

        const newItem = {
            productId: item.id,
            categoryId: item.categoryId || '',
            name: item.name,
            price: item.price || 10.00,
            quantity: 1,
            total: item.price || 10.00,
            categoryName: categoryForProduct?.name || 'Unknown Category'
        };

        setOrderItems(prev => [...prev, newItem]);
        setShowItemSelector(false);
        setItemSearch('');
    };

    const updateOrderItem = (index, field, value) => {
        setOrderItems(prev => prev.map((item, i) => {
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

    const removeOrderItem = (index) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const getFilteredAvailableItems = () => {
        if (!itemSearch) return availableItems;
        return availableItems.filter(item =>
            item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
            (item.nameEn && item.nameEn.toLowerCase().includes(itemSearch.toLowerCase()))
        );
    };

    const getApplicableOffers = () => {
        if (!testConfig.restaurantId) return offers;

        return offers.filter(offer => {
            const rIds = offer.restaurantIds ?? offer.RestaurantIds ?? [];
            const rBranches = offer.restaurantBranches ?? offer.RestaurantBranches ?? [];

            const appliesToRestaurant = rIds.includes(testConfig.restaurantId) || rIds.length === 0;
            if (!appliesToRestaurant) return false;

            if (testConfig.branchId && rBranches.length > 0) {
                return rBranches.some(rb => {
                    const rid = rb.id ?? rb.Id ?? rb.restaurantId;
                    const bid = rb.branchId ?? rb.BranchId ?? rb.branchID;
                    return rid === testConfig.restaurantId && bid === testConfig.branchId;
                });
            }
            return true;
        }).filter(offer => {
            const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
            const isInactive = !offer.isActive;
            return !isExpired && !isInactive;
        }).sort((a, b) => (b.priority || 1) - (a.priority || 1));
    };

    const runTests = async () => {
        if (!testConfig.restaurantId) {
            alert('Please select a restaurant first');
            return;
        }

        if (!testConfig.branchId) {
            alert('Please select a branch first');
            return;
        }

        if (orderItems.length === 0) {
            alert('Please add at least one item to test');
            return;
        }

        setLoading(true);
        setTestResults([]);

        try {
            const testData = {
                userId: testConfig.userId,
                restaurantId: testConfig.restaurantId,
                branchId: testConfig.branchId,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    categoryId: item.categoryId || '',
                    price: item.price,
                    quantity: item.quantity,
                    total: item.total
                })),
                deliveryFee: testConfig.deliveryFee,
                couponCode: testConfig.couponCode
            };

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
                const normalizedResults = results.map(result => {
                    const offer = offers.find(o => o.offerId === (result.offerId || result.details?.offerId));
                    return {
                        ...result,
                        offer: offer || {
                            offerId: result.offerId || 'unknown',
                            name: result.details?.offerName || 'Unknown Offer',
                            offerType: result.details?.offerType || 1,
                            discountType: result.details?.discountType || 1,
                            discountValue: result.details?.discountValue || 0
                        }
                    };
                });
                setTestResults(normalizedResults);
            } else {
                throw new Error('Failed to test offers');
            }
        } catch (error) {
            console.error('Error running tests:', error);
            alert('Error running tests: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const orderSubtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const totalSavings = testResults.filter(r => r.isApplicable).reduce((sum, r) => sum + (r.discountAmount || 0), 0);
    const finalTotal = orderSubtotal + testConfig.deliveryFee - totalSavings;

    return (
        <div className="space-y-6">
            {/* Test Configuration */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Test Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">User ID</label>
                        <input
                            type="text"
                            value={testConfig.userId}
                            onChange={(e) => setTestConfig(prev => ({ ...prev, userId: e.target.value }))}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Restaurant *</label>
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            value={restaurantSearch}
                            onChange={(e) => setRestaurantSearch(e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg mb-2 text-sm"
                        />
                        <select
                            value={testConfig.restaurantId}
                            onChange={(e) => {
                                setTestConfig(prev => ({
                                    ...prev,
                                    restaurantId: e.target.value,
                                    branchId: ''
                                }));
                            }}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg"
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

                    {testConfig.restaurantId && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Branch *</label>
                            <select
                                value={testConfig.branchId}
                                onChange={(e) => setTestConfig(prev => ({ ...prev, branchId: e.target.value }))}
                                className="w-full p-2 border-2 border-gray-300 rounded-lg"
                            >
                                <option value="">Select Branch</option>
                                {getBranchesForRestaurant(testConfig.restaurantId).map(branch => (
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
                            value={testConfig.deliveryFee}
                            onChange={(e) => setTestConfig(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg"
                            step="0.5"
                            min="0"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Coupon Code (Optional)</label>
                        <input
                            type="text"
                            value={testConfig.couponCode}
                            onChange={(e) => setTestConfig(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg uppercase"
                            placeholder="SAVE20"
                        />
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    {testConfig.restaurantId && (
                        <button
                            onClick={() => setShowItemSelector(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    )}
                </div>

                {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            {testConfig.restaurantId
                                ? 'No items added yet. Click "Add Item" to start.'
                                : 'Select a restaurant first to add items'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orderItems.map((item, index) => (
                            <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <p className="text-xs text-gray-500">{item.categoryName}</p>
                                    </div>
                                    <button
                                        onClick={() => removeOrderItem(index)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-600">Price (شيقل)</label>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                            step="0.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Quantity</label>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => updateOrderItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                className="p-2 border border-gray-300 rounded-l"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateOrderItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full p-2 border-t border-b border-gray-300 text-center text-sm"
                                                min="1"
                                            />
                                            <button
                                                onClick={() => updateOrderItem(index, 'quantity', item.quantity + 1)}
                                                className="p-2 border border-gray-300 rounded-r"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Total</label>
                                        <div className="p-2 bg-green-50 border border-green-200 rounded text-center font-semibold text-green-600">
                                            {item.total.toFixed(2)} شيقل
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Subtotal:</span>
                                <span className="font-bold text-blue-600">{orderSubtotal.toFixed(2)} شيقل</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Test Button & Applicable Offers */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Applicable Offers</h3>
                        <p className="text-sm text-gray-600">{getApplicableOffers().length} offers available for testing</p>
                    </div>
                    <button
                        onClick={runTests}
                        disabled={loading || !testConfig.restaurantId || !testConfig.branchId || orderItems.length === 0}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                        {loading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        {loading ? 'Testing...' : 'Run Tests'}
                    </button>
                </div>

                {getApplicableOffers().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active offers available for the selected restaurant and branch.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {getApplicableOffers().map(offer => (
                            <div key={offer.offerId} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                                <div className="flex items-center gap-2">
                                    {getOfferIcon(offer.offerType)}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{offer.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            {getOfferTypeName(offer.offerType)} • {getDiscountTypeName(offer.discountType)}
                                            {offer.discountValue && ` • ${offer.discountValue}${offer.discountType === 1 ? '%' : ' شيقل'}`}
                                        </p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Priority {offer.priority || 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Test Results</h3>

                    <div className="space-y-3 mb-6">
                        {testResults.map((result, index) => (
                            <div key={index} className={`border-2 rounded-lg p-4 ${
                                result.isApplicable
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {result.isApplicable ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-400" />
                                            )}
                                            <h4 className="font-semibold">{result.offer?.name || 'Unknown Offer'}</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                result.isApplicable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {result.isApplicable ? 'Applicable' : 'Not Applicable'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-1">{result.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {getOfferTypeName(result.offer?.offerType)} • {getDiscountTypeName(result.offer?.discountType)}
                                        </p>
                                    </div>
                                    {result.isApplicable && (
                                        <div className="text-right ml-4">
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

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
                        <h4 className="font-semibold mb-4">Order Summary</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Items Subtotal:</span>
                                <span className="font-medium">{orderSubtotal.toFixed(2)} شيقل</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Delivery Fee:</span>
                                <span className="font-medium">{testConfig.deliveryFee.toFixed(2)} شيقل</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                                <span className="font-medium">Total Savings:</span>
                                <span className="font-bold">-{totalSavings.toFixed(2)} شيقل</span>
                            </div>
                            <div className="border-t-2 border-blue-300 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="font-bold text-lg">Final Total:</span>
                                    <span className="font-bold text-2xl text-blue-600">{finalTotal.toFixed(2)} شيقل</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-4">
                            {testResults.filter(r => r.isApplicable).length} of {testResults.length} tested offers are applicable
                        </p>
                    </div>
                </div>
            )}

            {/* Item Selector Modal */}
            {showItemSelector && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add Item to Order</h3>
                            <button
                                onClick={() => setShowItemSelector(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                            autoFocus
                        />

                        <div className="flex-1 overflow-y-auto">
                            {getFilteredAvailableItems().length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No products found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {getFilteredAvailableItems().map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => addOrderItem(product)}
                                            className="p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-medium">{product.name}</span>
                                                    {product.price && (
                                                        <span className="text-sm text-gray-500 block">
                                                            {product.price.toFixed(2)} شيقل
                                                        </span>
                                                    )}
                                                </div>
                                                <Plus className="w-5 h-5 text-blue-600" />
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
};

export default OfferTestingPanel;