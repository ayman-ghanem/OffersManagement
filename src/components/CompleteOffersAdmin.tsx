import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, Percent, DollarSign, Gift, Users, MapPin, Tag, Clock, X, Zap, Award, Package, Check } from 'lucide-react';
import { Play, Minus, RefreshCw } from 'lucide-react';
import {Layers, CheckCircle, XCircle } from 'lucide-react';

const CompleteOffersAdmin = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [offers, setOffers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState('');
    const API_BASE_URL = 'https://wheelsnow-api.onrender.com';

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
        userId: 'test-user-123',
        restaurantId: '',
        deliveryFee: 3.00,
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
                console.log('🎯 Raw API results:', results);

                // Apply stacking logic to the results
                const stackedResults = applyStackingLogic(results);
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

    const runEnhancedTests = async () => {
        if (!enhancedTestConfig.restaurantId) {
            alert('Please select a restaurant first');
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
                    setEnhancedTestResults(results);
                } else {
                    throw new Error('Failed to test multiple offers');
                }
            } else {
                // Test selected offers individually
                const results = [];
                const offersToTest = enhancedTestConfig.selectedOffers.length > 0
                    ? offers.filter(o => enhancedTestConfig.selectedOffers.includes(o.offerId))
                    : offers.filter(o => o.restaurantIds?.includes(enhancedTestConfig.restaurantId));

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
                                offer: offer,
                                ...result
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

                setEnhancedTestResults(results);
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
        return offers.filter(offer =>
            offer.restaurantIds?.includes(enhancedTestConfig.restaurantId) ||
            offer.restaurantIds?.length === 0
        );
    };

    const [testOrderData, setTestOrderData] = useState({
        userId: 'test-user-123',
        restaurantId: '',
        items: [
            {
                productId: '1',
                categoryId: '1',
                price: 15.50,
                quantity: 2,
                total: 31.00
            }
        ],
        deliveryFee: 3.00,
        couponCode: ''
    });
    const [testResults, setTestResults] = useState([]);
    const [testingOffer, setTestingOffer] = useState(null);
    const [selectedRestaurantForTargeting, setSelectedRestaurantForTargeting] = useState('');
    const [restaurantSearch, setRestaurantSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [comboProductSearch, setComboProductSearch] = useState('');
    const [selectedComboRestaurant, setSelectedComboRestaurant] = useState('');
    const [productRestaurantSearch, setProductRestaurantSearch] = useState('');
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

                // Add restaurant info to each category
                const categoriesWithRestaurant = data.map(category => ({
                    ...category,
                    restaurantId: restaurantId
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

                // Add restaurant info to each product
                const productsWithRestaurant = data.map(product => ({
                    ...product,
                    restaurantId: restaurantId
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
   
    const getFilteredRestaurants = () => {
        if (!restaurantSearch) return restaurants;
        return restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
            (restaurant.nameEn && restaurant.nameEn.toLowerCase().includes(restaurantSearch.toLowerCase()))
        );
    };

    const getFilteredProductsOrCategories = () => {
        const items = formData.offerType === 1 ? products : categories;
        if (!productSearch) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            (item.nameEn && item.nameEn.toLowerCase().includes(productSearch.toLowerCase()))
        );
    };

    const toggleRestaurantSelection = (restaurantId) => {
        setFormData(prev => {
            const isSelected = prev.RestaurantIds.includes(restaurantId);
            const newRestaurantIds = isSelected
                ? prev.RestaurantIds.filter(id => id !== restaurantId)
                : [...prev.RestaurantIds, restaurantId];

            // SYNC: Update selectedProductRestaurants for product/category offers
            if (prev.offerType === 1 || prev.offerType === 2) {
                setSelectedProductRestaurants(newRestaurantIds);

                // Load data for new restaurant selection
                if (newRestaurantIds.length > 0) {
                    loadCategoriesForRestaurants(newRestaurantIds);
                    loadProductsForRestaurants(newRestaurantIds);
                } else {
                    loadCategories();
                    loadProducts();
                }
            }

            return {
                ...prev,
                RestaurantIds: newRestaurantIds
            };
        });
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
        setLoading(true);

        try {
            const offerData = {
                ...formData,
                discountValue: parseFloat(formData.discountValue) || 0,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
                buyQuantity: formData.buyQuantity ? parseInt(formData.buyQuantity) : null,
                getQuantity: formData.getQuantity ? parseInt(formData.getQuantity) : null,
                getDiscountPercent: formData.getDiscountPercent ? parseFloat(formData.getDiscountPercent.toString()) : 100,
                maxUsagePerUser: formData.maxUsagePerUser ? parseInt(formData.maxUsagePerUser) : null,
                maxUsageTotal: formData.maxUsageTotal ? parseInt(formData.maxUsageTotal) : null,
                minItemQuantity: formData.minItemQuantity ? parseInt(formData.minItemQuantity) : null,
                flashSaleQuantity: formData.flashSaleQuantity ? parseInt(formData.flashSaleQuantity) : null,
                
                
                // Format restaurant IDs
                //RestaurantIds: formData.RestaurantIds,

                // Format targets with proper structure including sub-targeting
                Targets: (() => {
                    // For combo offers, set targets from combo items
                    if (formData.offerType === 8 && formData.comboItems.length > 0) {
                        const targetType = comboTargetType === 'Product' ? 1 : 2; // 1 = Product, 2 = Category
                        return formData.comboItems.map(comboItem => ({
                            targetType: targetType,
                            targetId: comboItem.productId
                        }));
                    }

                    // For other offer types with sub-targeting
                    if ([5, 6, 7, 9].includes(formData.offerType)) {
                        const targetType = subOfferType === 'product' ? 1 : subOfferType === 'category' ? 2 : 3;
                        return formData.Targets.map(targetId => ({
                            targetType: targetType,
                            targetId: targetId
                        }));
                    }

                    // For regular product/category offers
                    return formData.Targets.map(targetId => {
                        const targetType = formData.offerType === 1 ? 1 : formData.offerType === 2 ? 2 : 3;
                        return {
                            targetType: targetType,
                            targetId: targetId
                        };
                    });
                })(),

                // Format combo items with proper structure including target type
                comboItems: formData.comboItems.map(item => ({
                    productId: item.productId,
                    RequiredQuantity: item.requiredQuantity,
                    DiscountPercent: item.discountPercent,
                    targetType: comboTargetType // Add target type to combo items
                })),

                // Add sub-targeting info for special offer types
                subTargetType: [5, 6, 7].includes(formData.offerType) ? subOfferType : null,
                comboTargetType: formData.offerType === 8 ? comboTargetType : null

            };

            const offersmanagerurl = API_BASE_URL.concat('/api/admin/OffersManagement')

            const url = editingOffer
                ? `${API_BASE_URL}/api/admin/OffersManagement/${editingOffer.offerId}`
                : offersmanagerurl ;
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
            }
        } catch (error) {
            console.error('Error saving offer:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', nameEn: '', description: '', descriptionEn: '',
            offerType: 1, discountType: 1, discountValue: '',
            maxDiscountAmount: '', minOrderAmount: '', priority: 1, isStackable: false,
            maxUsagePerUser: '', maxUsageTotal: '', startDate: '', endDate: '',
            isActive: true, buyQuantity: '', getQuantity: '', getDiscountPercent: 100,
            isFirstOrderOnly: false, userTiers: [], dayOfWeek: [], startTime: null,
            endTime: null, minItemQuantity: '', isComboOffer: false, comboItems: [],
            couponCode: '', requiresCouponCode: false, flashSaleQuantity: '',
            RestaurantIds: [], Targets: []
        });

        // Reset all search filters
        setRestaurantSearch('');
        setProductSearch('');
        setComboProductSearch('');
        setProductRestaurantSearch(''); // Add this line
        setSelectedRestaurantForTargeting('');
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
        if (offer.isFirstOrderOnly) badges.push({ text: 'NEW CUSTOMER', color: 'bg-blue-100 text-blue-800' });
        if (offer.requiresCouponCode) badges.push({ text: 'COUPON', color: 'bg-purple-100 text-purple-800' });
        if (offer.userTiers?.length) badges.push({ text: 'VIP', color: 'bg-yellow-100 text-yellow-800' });
        if (offer.flashSaleQuantity) badges.push({ text: 'FLASH SALE', color: 'bg-red-100 text-red-800' });
        if (offer.dayOfWeek?.length && offer.dayOfWeek.length < 7) badges.push({ text: 'TIME LIMITED', color: 'bg-green-100 text-green-800' });
        return badges;
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
                            resetForm(); // Add this line
                        }}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Offer Name (Arabic)</label>
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

                    {/* Offer Type Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Offer Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {offerTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleInputChange('offerType', type.value)}
                                    className={`p-4 border rounded-lg text-left hover:shadow-md transition-shadow ${
                                        formData.offerType === type.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
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

                    {/* Discount Type Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Discount Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            {discountTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleInputChange('discountType', type.value)}
                                    className={`p-3 border rounded-md flex items-center gap-2 text-sm ${
                                        formData.discountType === type.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {type.icon}
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Discount Configuration */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium mb-3">Discount Configuration</h3>
                        {formData.discountType === 3 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Buy Quantity</label>
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
                                    <label className="block text-sm font-medium mb-1">Get Quantity</label>
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
                        ) : formData.discountType === 4 ? (
                            <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm text-blue-700">
                                    Free delivery will be applied to delivery fee. No additional configuration needed.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Discount Value {formData.discountType === 1 ? '(%)' : '(شيقل)'}
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
                            </div>
                        )}
                    </div>

                    {renderSubTargetingSection()}

                    {/* Offer-specific sections */}
                    {formData.offerType === 5 && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                First Order Configuration
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isFirstOrderOnly}
                                    onChange={(e) => handleInputChange('isFirstOrderOnly', e.target.checked)}
                                    className="rounded"
                                />
                                <label className="text-sm font-medium">Only for first-time customers</label>
                            </div>
                            <p className="text-sm text-blue-600 mt-2">
                                This offer will only be available to customers placing their first order.
                            </p>
                        </div>
                    )}

                    {formData.offerType === 6 && (
                        <div className="border rounded-lg p-4 bg-yellow-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-600" />
                                Loyalty Tier Selection
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

                    {formData.offerType === 7 && (
                        <div className="border rounded-lg p-4 bg-green-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                Time-Based Conditions
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Days of Week</label>
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
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.offerType === 9 && (
                        <div className="border rounded-lg p-4 bg-red-50">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-600" />
                                Flash Sale Configuration
                            </h3>

                            {/* Flash Sale Target Level */}
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
                                    <label className="block text-sm font-medium mb-1">Total Quantity Available</label>
                                    <input
                                        type="number"
                                        value={formData.flashSaleQuantity}
                                        onChange={(e) => handleInputChange('flashSaleQuantity', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                        min="1"
                                        placeholder="e.g., 100 items"
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
                    

                    {/* Coupon Code Configuration */}
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

                    {/* Advanced Settings */}
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
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Select Restaurant */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Select Restaurants</label>

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

                        {/* Selected restaurants tags */}
                        {formData.RestaurantIds.length > 0 && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-md">
                                <p className="text-sm font-medium text-blue-800 mb-2">
                                    Selected Restaurants ({formData.RestaurantIds.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.RestaurantIds.map(restaurantId => {
                                        const restaurant = restaurants.find(r => r.id === restaurantId);
                                        return restaurant ? (
                                            <span key={restaurantId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {restaurant.name}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRestaurantSelection(restaurantId)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Restaurant list */}
                        {restaurants.length === 0 ? (
                            <div className="border rounded-md p-4 text-center text-gray-500">
                                <p>Loading restaurants...</p>
                            </div>
                        ) : (
                            <div className="border rounded-md max-h-48 overflow-y-auto">
                                {getFilteredRestaurants().length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <p>No restaurants found</p>
                                    </div>
                                ) : (
                                    getFilteredRestaurants().map(restaurant => (
                                        <div
                                            key={restaurant.id}
                                            onClick={() => toggleRestaurantSelection(restaurant.id)}
                                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                                                formData.RestaurantIds.includes(restaurant.id)
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{restaurant.name}</span>
                                                {formData.RestaurantIds.includes(restaurant.id) && (
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {renderComboSection()}

                    {/* Select categories or products */}
                    {renderTargetSelection()}


                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateModal(false);
                                setEditingOffer(null);
                                resetForm(); // Add this line
                            }}
                            className="px-4 py-2 rounded-md border"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? 'Saving…' : 'Save Offer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const OfferCard = ({ offer }) => (
        <div className="p-4 rounded-lg border bg-white shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100">{getOfferIcon(offer.offerType)}</div>
                    <div>
                        <h4 className="font-semibold">{offer.name}</h4>
                        <p className="text-xs text-gray-500">{offer.offerType} • {offer.discountType}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {getOfferBadges(offer).map((b, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded text-xs ${b.color}`}>{b.text}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(offer)}`}>{getStatusText(offer)}</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                <span>Priority: <b>{offer.priority ?? '-'}</b></span>
                <span>Usage: <b>{offer.currentUsage ?? 0}</b>{offer.maxUsageTotal ? ` / ${offer.maxUsageTotal}` : ''}</span>
                {offer.startDate && offer.endDate && (
                    <span>{offer.startDate} → {offer.endDate}</span>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <button onClick={() => handleEdit(offer)} className="px-3 py-1.5 rounded border flex items-center gap-1"><Edit2 className="w-4 h-4"/> Edit</button>
                <button onClick={() => handleDelete(offer.offerId)} className="px-3 py-1.5 rounded border flex items-center gap-1 text-red-600 border-red-300"><Trash2 className="w-4 h-4"/> Delete</button>
            </div>
        </div>
    );

    const renderSubTargetingSection = () => {
        if (![5, 6, 7].includes(formData.offerType)) return null;

        const offerTypeNames = {
            5: 'First Order',
            6: 'Loyalty Tier',
            7: 'Time-Based'
        };

        return (
            <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-medium mb-3">
                    {offerTypeNames[formData.offerType]} Target Level
                </h3>
                <p className="text-sm text-blue-600 mb-3">
                    Choose whether this {offerTypeNames[formData.offerType].toLowerCase()} offer applies to specific products, categories, or the entire order.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => handleSubOfferTypeChange('product')} // Use the new handler
                        className={`p-3 border rounded-md text-left ${
                            subOfferType === 'product'
                                ? 'border-blue-500 bg-blue-100 text-blue-700'
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
                                ? 'border-blue-500 bg-blue-100 text-blue-700'
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
                                ? 'border-blue-500 bg-blue-100 text-blue-700'
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
                                                        <span className="text-xs text-blue-600 block">
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
                                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
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
                                                    <span className="text-xs text-blue-500">
                                                    {restaurant?.name || 'Unknown Restaurant'}
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
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
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
                                        Restaurant: {restaurants.find(r => r.id === item.restaurantId)?.name || item.restaurantId}
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
                            placeholder="test-user-123"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Restaurant</label>
                        <select
                            value={enhancedTestConfig.restaurantId}
                            onChange={(e) => {
                                const newRestaurantId = e.target.value;
                                console.log('🏪 Restaurant selected:', newRestaurantId);

                                setEnhancedTestConfig(prev => {
                                    const updated = { ...prev, restaurantId: newRestaurantId };
                                    console.log('💾 Updated config:', updated);
                                    return updated;
                                });

                                // Load items immediately with current data
                                if (newRestaurantId) {
                                    console.log('🔄 Loading items for:', newRestaurantId);
                                    loadItemsForRestaurant(newRestaurantId);
                                } else {
                                    setAvailableItems([]);
                                }
                            }}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Select Restaurant</option>
                            {restaurants.map(restaurant => (
                                <option key={restaurant.id} value={restaurant.id}>
                                    {restaurant.name}
                                </option>
                            ))}
                        </select>
                        <div className="col-span-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Status:</strong>
                            Restaurant: {enhancedTestConfig.restaurantId ? '✅ Selected' : '❌ None'} |
                            Items Available: {availableItems.length} |
                            Products Loaded: {products.length} |
                            Categories Loaded: {categories.length}
                        </div>
                    </div>

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

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Test Mode</label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={enhancedTestConfig.testMode === 'single'}
                                onChange={() => setEnhancedTestConfig(prev => ({ ...prev, testMode: 'single' }))}
                                className="mr-2"
                            />
                            Selected Offers Only
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={enhancedTestConfig.testMode === 'multiple'}
                                onChange={() => setEnhancedTestConfig(prev => ({ ...prev, testMode: 'multiple' }))}
                                className="mr-2"
                            />
                            All Applicable Offers
                        </label>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    {enhancedTestConfig.restaurantId && (
                        <button
                            onClick={() => setShowItemSelector(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
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

                {enhancedOrderItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                            <div>
                                <span className="font-medium text-sm">{item.name}</span>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div>Product ID: {item.productId}</div>
                                    <div>Category ID: {item.categoryId}</div>
                                    {item.categoryName && (
                                        <div className="text-blue-600">Category: {item.categoryName}</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Price (شيقل)</label>
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => updateEnhancedOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 border rounded text-sm"
                                    step="0.5"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateEnhancedOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-full p-1 border rounded text-sm"
                                    min="1"
                                />
                            </div>
                            <div>
                                <span className="text-xs text-gray-600">Total</span>
                                <span className="block text-sm font-medium text-green-600">
                    {item.total.toFixed(2)} شيقل
                </span>
                            </div>
                            <div>
                                <button
                                    onClick={() => removeEnhancedOrderItem(index)}
                                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Available Offers */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Available Offers</h3>
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

                {enhancedTestConfig.testMode === 'single' && (
                    <p className="text-sm text-gray-600 mb-4">
                        Select offers to test (or leave empty to test all applicable offers)
                    </p>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getApplicableOffers().map(offer => (
                        <div key={offer.offerId} className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            enhancedTestConfig.selectedOffers.includes(offer.offerId)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                             onClick={() => enhancedTestConfig.testMode === 'single' && toggleOfferSelection(offer.offerId)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                    {getOfferIcon(offer.offerType)}
                                    <div>
                                        <h4 className="font-medium text-sm">{offer.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            {getOfferTypeName(offer.offerType)} • {getDiscountTypeName(offer.discountType)}
                                            {offer.discountValue && ` • ${offer.discountValue}${offer.discountType === 1 ? '%' : ' شيقل'}`}
                                        </p>
                                    </div>
                                </div>

                                {enhancedTestConfig.testMode === 'single' && enhancedTestConfig.selectedOffers.includes(offer.offerId) && (
                                    <Check className="w-4 h-4 text-blue-600" />
                                )}
                            </div>
                        </div>
                    ))}
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

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-medium">Total Potential Savings:</span>
                                <p className="text-sm text-blue-600">
                                    {enhancedTestResults.filter(r => r.isApplicable).length} of {enhancedTestResults.length} offers are applicable
                                </p>
                            </div>
                            <div className="text-3xl font-bold text-blue-600">
                                {enhancedTestResults
                                    .filter(r => r.isApplicable)
                                    .reduce((sum, r) => sum + (r.discountAmount || 0), 0)
                                    .toFixed(2)} شيقل
                            </div>
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
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
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
                                <div className="text-2xl font-bold text-blue-600">{stackingTestResults.finalPrice.toFixed(2)} JOD</div>
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
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">📚 How Stacking Works:</h5>
                        <div className="text-sm text-blue-700 space-y-1">
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
                                                            <span className="text-xs text-blue-500">
                                        {categories.find(c => c.id === product.categoryId)?.name || 'Category'}
                                    </span>
                                                        )}
                                                    </div>
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

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Offers Admin</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-3 py-1.5 rounded border ${activeTab==='list' ? 'bg-gray-100' : ''}`}
                    >List</button>
                    <button
                        onClick={() => setActiveTab('test')}
                        className={`px-3 py-1.5 rounded border ${activeTab==='test' ? 'bg-gray-100' : ''}`}
                    >Test Orders</button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-3 py-1.5 rounded border ${activeTab==='analytics' ? 'bg-gray-100' : ''}`}
                    >Analytics</button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4"/> New Offer
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {offers.map(o => <OfferCard key={o.offerId} offer={o} />)}
                    {offers.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 p-8 border rounded-lg">No offers yet</div>
                    )}
                </div>
            ) : activeTab === 'test' ? (
                renderEnhancedTestOrderTab()
            ) : (
                <div className="p-6 border rounded-lg bg-white text-gray-600">Analytics placeholder</div>
            )}

            {showCreateModal && renderOfferForm()}
        </div>
    );
};

export default CompleteOffersAdmin;
