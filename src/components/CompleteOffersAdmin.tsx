import { useState,useRef,useCallback, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, Percent, DollarSign, Gift, Users, MapPin, Tag, Clock, X, Zap, Award, Package, Check } from 'lucide-react';
import { Play, Minus, RefreshCw } from 'lucide-react';
import {Layers, CheckCircle, XCircle } from 'lucide-react';
import { BarChart } from 'lucide-react';
import OffersAnalyticsDashboard from './OffersAnalyticsDashboard'; // Adjust path as needed

import OfferTypeSelector from './OfferTypeSelector';
import DiscountTypeSelector from './DiscountTypeSelector';
import DiscountConfiguration from './DiscountConfiguration';
import DiscountApplicationScope from './DiscountApplicationScope';
import OfferBasicInfo from './OfferBasicInfo';
import CoreSettings from './CoreSettings';
import AdditionalConstraints from './AdditionalConstraints';
import CouponCodeConfiguration from './CouponCodeConfiguration';
import RestaurantBranchSelection from './RestaurantBranchSelection';
import TargetSelection from './TargetSelection';
import OfferTestingPanel from './OfferTestingPanel';
import OfferCard from './OfferCard';


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
    //const API_BASE_URL = 'https://wheelsnow-api.onrender.com';
    const API_BASE_URL = 'http://localhost:5159';
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const [expandedRestaurants, setExpandedRestaurants] = useState([]); // Which restaurants show branches

    const [showCitySelector, setShowCitySelector] = useState(false);

    // Complete form state for ALL offer types
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        offerType: 1, // Product, Category, Order, 
        discountType: 1, // Percentage, Fixed
        discountValue: '',
        maxDiscountAmount: '',
        minOrderAmount: '',
        priority: 1,
        isStackable: true,
        maxUsagePerUser: '',
        wheelsContribution: 0 ,
        maxUsageTotal: '',
        startDate: null,
        endDate: null,
        isActive: true,
        // Enhanced properties
        isFirstOrderOnly: false,
        userTiers: [],
        dayOfWeek: [],
        startTime: null,
        endTime: null,
        // NEW: Discount Application Flags (replaces separate Delivery offer type)
        applyToOrderSubtotal: true,  // Default: apply to order items
        applyToDeliveryFee: false,   // Optional: also apply to delivery
        channelOffer: false, // ADD THIS LINE

        
        couponCode: '',
        requiresCouponCode: false,
        flashSaleQuantity: '',

        // Targeting
        RestaurantIds: [],
        RestaurantBranches: [], // Add this

        Targets: []
    });

    const [dataLoading, setDataLoading] = useState({
        restaurants: false,
        categories: false,
        products: false,
        offers: false
    });

    const [dataLoaded, setDataLoaded] = useState({
        restaurants: false,
        categories: false,
        products: false,
        offers: false
    });

    const loadingRef = useRef({
        restaurants: false,
        categories: new Set(), // Track which restaurants are being loaded
        products: new Set()
    });

    const [restaurantDataCache, setRestaurantDataCache] = useState({
        categories: new Map(), // restaurantId -> categories[]
        products: new Map()    // restaurantId -> products[]
    });

    const loadInitialData = async () => {
        if (!dataLoaded.restaurants && !loadingRef.current.restaurants) {
            await loadRestaurants();
        }
        if (!dataLoaded.offers) {
            await loadOffers();
        }
    };
    useEffect(() => {
        loadInitialData();
    }, []); // Keep empty dependency array

    useEffect(() => {
        if (!dataLoaded.restaurants || formData.RestaurantIds.length === 0) return;

        // Don't load products/categories for order-level offers (type 3)
        if (formData.offerType === 3) return;

        const needsProductCategoryData = [1, 2].includes(formData.offerType);

        if (needsProductCategoryData) {
            loadCategoriesForRestaurants(formData.RestaurantIds);
            loadProductsForRestaurants(formData.RestaurantIds);
        }
    }, [formData.RestaurantIds, formData.offerType, dataLoaded.restaurants]);

// Remove the other useEffects that load data unnecessarily
    const loadRestaurants = async () => {
        if (loadingRef.current.restaurants || dataLoaded.restaurants) return;

        loadingRef.current.restaurants = true;
        setDataLoading(prev => ({ ...prev, restaurants: true }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/restaurants`);
            const data = await response.json();
            setRestaurants(data);
            setDataLoaded(prev => ({ ...prev, restaurants: true }));
            setInitialLoadComplete(true); // Add this line
        } catch (error) {
            console.error('Error loading restaurants:', error);
        } finally {
            loadingRef.current.restaurants = false;
            setDataLoading(prev => ({ ...prev, restaurants: false }));
        }
    };
    
    const offerTypes = [
        { value: 1, label: 'Product Specific', icon: <Tag className="w-4 h-4" />, description: 'Discount on specific products', enabled: true },
        { value: 2, label: 'Category', icon: <Target className="w-4 h-4" />, description: 'Discount on product categories', enabled: true },
        { value: 3, label: 'Order Total', icon: <DollarSign className="w-4 h-4" />, description: 'Discount on entire order', enabled: true },
    ];

    // Update discount types array - remove FreeDelivery
    const discountTypes = [
        { value: 1, label: 'Percentage (%)', icon: <Percent className="w-4 h-4" /> },
        { value: 2, label: 'Fixed Amount (شيقل)', icon: <DollarSign className="w-4 h-4" /> },
    ];
    const userTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


    const getOfferTypeName = (offerType) => {
        const names = {
            1: 'Product Specific',
            2: 'Category',
            3: 'Order Total',
        };
        return names[offerType] || 'Unknown';
    };

    const getDiscountTypeName = (discountType) => {
        const names = {
            1: 'Percentage',
            2: 'Fixed Amount',
        };
        return names[discountType] || 'Unknown';
    };
    
    const [showCityOnlyOffers, setShowCityOnlyOffers] = useState(false);

   
    const isOrderLevelOffer = (offer) => {
        return offer.offerType === 3 || offer.applyToDeliveryFee;
    };

    const deselectAllRestaurantsInCity = (cityName) => {
        const cityRestaurants = getRestaurantsInCity(cityName);

        if (!cityRestaurants || cityRestaurants.length === 0) {
            return;
        }

        const cityBranches = cityRestaurants.map(r => ({
            restaurantId: r.id,
            branchId: r.branchId
        }));

        

        setFormData(prev => {
            // Filter out all branches from this city
            const updatedBranches = prev.RestaurantBranches.filter(selectedBranch => {
                const shouldRemove = cityBranches.some(cityBranch =>
                    cityBranch.restaurantId === selectedBranch.restaurantId &&
                    cityBranch.branchId === selectedBranch.branchId
                );
                return !shouldRemove; // Keep branches that should NOT be removed
            });


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
            return;
        }

        const cityBranches = cityRestaurants.map(r => ({
            restaurantId: r.id,
            branchId: r.branchId
        }));


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

       const getRestaurantBranchesForRestaurant = (restaurantId) => {
        return formData.RestaurantBranches.filter(b => b.restaurantId === restaurantId);
    };

    const isRestaurantExpanded = (restaurantId) => {
        return expandedRestaurants.includes(restaurantId);
    };
    
    const [restaurantSearch, setRestaurantSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [selectedProductRestaurants, setSelectedProductRestaurants] = useState([]);
    const [subOfferType, setSubOfferType] = useState('order'); // 'product', 'category', 'order'
    

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

            const response = await fetch(loadProductsUrl);
            const data = await response.json();

            const productsWithRestaurantId = data.map(product => ({
                ...product,
                restaurantId: product.restaurantId || 'unknown'
            }));

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

            const response = await fetch(loadCategoriesurl);
            const data = await response.json();

            const categoriesWithRestaurantId = data.map(category => ({
                ...category,
                restaurantId: category.restaurantId || 'unknown'
            }));

            setCategories(categoriesWithRestaurantId);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadCategoriesForRestaurants = async (restaurantIds) => {
        try {

            // Check which restaurants are not cached and not currently loading
            const uncachedRestaurants = restaurantIds.filter(id =>
                !restaurantDataCache.categories.has(id) &&
                !loadingRef.current.categories.has(id)
            );

            // If all data is cached, use cached data
            if (uncachedRestaurants.length === 0) {
                const cachedCategories = [];
                restaurantIds.forEach(id => {
                    if (restaurantDataCache.categories.has(id)) {
                        cachedCategories.push(...restaurantDataCache.categories.get(id));
                    }
                });

                // Remove duplicates based on category ID
                const uniqueCategories = cachedCategories.filter((category, index, self) =>
                    index === self.findIndex(c => c.id === category.id)
                );

                setCategories(uniqueCategories);
                return;
            }

            // Mark restaurants as loading
            uncachedRestaurants.forEach(id => {
                loadingRef.current.categories.add(id);
            });

            const allCategories = [];

            // Load only uncached restaurants
            for (const restaurantId of uncachedRestaurants) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/categories?restaurantId=${restaurantId}`);
                    const data = await response.json();

                    const restaurant = restaurants.find(r => r.id === restaurantId);
                    const categoriesWithRestaurant = data.map(category => ({
                        ...category,
                        restaurantId: restaurantId,
                        restaurantName: restaurant?.name || 'Unknown Restaurant',
                        restaurantNameEn: restaurant?.nameEn || ''
                    }));

                    // Cache the data
                    setRestaurantDataCache(prev => ({
                        ...prev,
                        categories: new Map(prev.categories).set(restaurantId, categoriesWithRestaurant)
                    }));

                    allCategories.push(...categoriesWithRestaurant);
                } finally {
                    loadingRef.current.categories.delete(restaurantId);
                }
            }

            // Combine new data with existing cached data for other selected restaurants
            const existingCachedCategories = [];
            restaurantIds.forEach(id => {
                if (restaurantDataCache.categories.has(id) && !uncachedRestaurants.includes(id)) {
                    existingCachedCategories.push(...restaurantDataCache.categories.get(id));
                }
            });

            const combinedCategories = [...existingCachedCategories, ...allCategories];

            // Remove duplicates
            const uniqueCategories = combinedCategories.filter((category, index, self) =>
                index === self.findIndex(c => c.id === category.id)
            );

            setCategories(uniqueCategories);

        } catch (error) {
            console.error('Error loading categories for restaurants:', error);
            // Clear loading flags on error
            restaurantIds.forEach(id => {
                loadingRef.current.categories.delete(id);
            });
        }
    };
    const loadProductsForRestaurants = async (restaurantIds) => {
        try {

            // Check which restaurants are not cached and not currently loading
            const uncachedRestaurants = restaurantIds.filter(id =>
                !restaurantDataCache.products.has(id) &&
                !loadingRef.current.products.has(id)
            );

            // If all data is cached, use cached data
            if (uncachedRestaurants.length === 0) {
                const cachedProducts = [];
                restaurantIds.forEach(id => {
                    if (restaurantDataCache.products.has(id)) {
                        cachedProducts.push(...restaurantDataCache.products.get(id));
                    }
                });

                // Remove duplicates based on product ID
                const uniqueProducts = cachedProducts.filter((product, index, self) =>
                    index === self.findIndex(p => p.id === product.id)
                );

                setProducts(uniqueProducts);
                return;
            }

            // Mark restaurants as loading
            uncachedRestaurants.forEach(id => {
                loadingRef.current.products.add(id);
            });

            const allProducts = [];

            // Load only uncached restaurants
            for (const restaurantId of uncachedRestaurants) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/products?restaurantId=${restaurantId}`);
                    const data = await response.json();

                    const restaurant = restaurants.find(r => r.id === restaurantId);
                    const productsWithRestaurant = data.map(product => ({
                        ...product,
                        restaurantId: restaurantId,
                        restaurantName: restaurant?.name || 'Unknown Restaurant',
                        restaurantNameEn: restaurant?.nameEn || ''
                    }));

                    // Cache the data
                    setRestaurantDataCache(prev => ({
                        ...prev,
                        products: new Map(prev.products).set(restaurantId, productsWithRestaurant)
                    }));

                    allProducts.push(...productsWithRestaurant);
                } finally {
                    loadingRef.current.products.delete(restaurantId);
                }
            }

            // Combine new data with existing cached data
            const existingCachedProducts = [];
            restaurantIds.forEach(id => {
                if (restaurantDataCache.products.has(id) && !uncachedRestaurants.includes(id)) {
                    existingCachedProducts.push(...restaurantDataCache.products.get(id));
                }
            });

            const combinedProducts = [...existingCachedProducts, ...allProducts];

            // Remove duplicates
            const uniqueProducts = combinedProducts.filter((product, index, self) =>
                index === self.findIndex(p => p.id === product.id)
            );

            setProducts(uniqueProducts);

        } catch (error) {
            console.error('Error loading products for restaurants:', error);
            // Clear loading flags on error
            restaurantIds.forEach(id => {
                loadingRef.current.products.delete(id);
            });
        }
    };
    const getFilteredProductsByRestaurants = () => {
       
        // Determine if we should show products or categories
        const isProductTarget = formData.offerType === 1 ||
            ([5, 6, 7, 9].includes(formData.offerType) && subOfferType === 'product');


        let items = isProductTarget ? products : categories;

        // Use RestaurantIds as the primary source of truth
        const restaurantsToFilter = formData.RestaurantIds;

        // Debug: Log available items and their restaurant associations
        if (items.length > 0) {
            items.slice(0, 5).forEach(item => {
            });
        }

        // If no restaurant filter, show all items
        if (restaurantsToFilter.length === 0) {
            if (productSearch) {
                items = items.filter(item =>
                    item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    (item.nameEn && item.nameEn.toLowerCase().includes(productSearch.toLowerCase()))
                );
            }
            return items;
        }

        // Filter by selected restaurants
        const beforeFilter = items.length;
        items = items.filter(item => {
            const belongs = restaurantsToFilter.includes(item.restaurantId);
            if (belongs && items.indexOf(item) < 3) { // Log first few matches
            }
            return belongs;
        });

        // Debug: If no items found, check why
        if (items.length === 0 && restaurantsToFilter.length > 0) {
           
            // Check if any restaurant IDs match
            const availableRestaurantIds = [...new Set((isProductTarget ? products : categories).map(i => i.restaurantId))];
            const matchingIds = restaurantsToFilter.filter(id => availableRestaurantIds.includes(id));
        }

        // Apply search filter
        if (productSearch) {
            const beforeSearch = items.length;
            items = items.filter(item =>
                item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (item.nameEn && item.nameEn.toLowerCase().includes(productSearch.toLowerCase()))
            );
        }

        return items;
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
    
    const loadOffers = async () => {
        try {
            if (dataLoaded.offers) return;

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
    

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOfferTypeChange = (newOfferType) => {
        const previousOfferType = formData.offerType;

        // If changing from order type (3) to any other type, clear restaurant selection
        if (previousOfferType === 3 && newOfferType !== 3) {
            setFormData(prev => ({
                ...prev,
                offerType: newOfferType,
                RestaurantIds: [],
                RestaurantBranches: [],
                Targets: []
            }));
            setExpandedRestaurants([]);
        }
        // If changing to order type (3) from any other type, clear restaurant selection
        else if (previousOfferType !== 3 && newOfferType === 3) {
            setFormData(prev => ({
                ...prev,
                offerType: newOfferType,
                RestaurantIds: [],
                RestaurantBranches: [],
                Targets: []
            }));
            setExpandedRestaurants([]);
        }
        else {
            handleInputChange('offerType', newOfferType);
        }
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
                maxUsagePerUser: formData.maxUsagePerUser ? parseInt(formData.maxUsagePerUser) : null,
                wheelsContribution: formData.wheelsContribution ? parseFloat(formData.wheelsContribution.toString()) : 0,
                maxUsageTotal: formData.maxUsageTotal ? parseInt(formData.maxUsageTotal) : null,
                flashSaleQuantity: formData.flashSaleQuantity ? parseInt(formData.flashSaleQuantity) : null,


                // NEW: Discount Application Flags
                applyToOrderSubtotal: formData.applyToOrderSubtotal,
                applyToDeliveryFee: formData.applyToDeliveryFee,
                
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

                    // For Product and Category offers, use selected targets
                    if ((formData.offerType === 1 || formData.offerType === 2) && formData.Targets.length > 0) {
                        return formData.Targets.map(targetId => {
                            const targetType = formData.offerType === 1 ? 1 : 2; // 1=Product, 2=Category
                            return {
                                targetType: targetType,
                                targetId: targetId
                            };
                        });
                    }
                    // For Order and Flash offers, no specific targets needed (or handled differently)
                    return [];
                })(),
                
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
                    // Update existing offer in the list
                    setOffers(prev => prev.map(offer =>
                        offer.offerId === editingOffer.offerId ? result : offer
                    ));
                } else {
                    // Add new offer to the list
                    setOffers(prev => [...prev, result]);
                }

                // Reset form and close modal
                resetForm();
                setShowCreateModal(false);
                setEditingOffer(null);

                // Show success message
                alert(editingOffer ? 'Offer updated successfully!' : 'Offer created successfully!');

            } else {
                const errorData = await response.text();
                console.error('Server error response:', errorData);

                try {
                    const parsedError = JSON.parse(errorData);
                    alert('Error saving offer: ' + (parsedError.message || parsedError.title || 'Unknown error'));
                } catch {
                    alert('Error saving offer: ' + errorData);
                }
            }
        } catch (error) {
            console.error('Error saving offer:', error);
            alert('Error saving offer: ' + error.message);
        } finally {
            setLoading(false);
        }
    };



    const getCompatibleDiscountTypes = (offerType) => {
        const compatibility = {
            1: [1, 2], // Product: Percentage, Fixed, BuyXGetY
            2: [1, 2], // Category: Percentage, Fixed, BuyXGetY  
            3: [1, 2],    // Order: Percentage, Fixed (no BuyXGetY for order-level)
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
            

            // NEW: Always show discount application section
            discountApplication: () => true,

            // NEW: Always show constraints section
            constraintsSection: () => true,
            
            // Min/Max discount fields
            maxDiscountAmount: () => discountType == 1, // Not for free delivery
            minOrderAmount: () => offerType == 3, // Not for free delivery
            
            flashSaleSection: () => offerType === 5,


            // Target selection (products/categories)
            // Target selection (products/categories)
            targetSelection: () => {
                return offerType === 1 || offerType === 2 || offerType === 4; // Product or Category
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
            priority: () => false,
            isStackable: () => false,
            maxUsagePerUser: () => true,
            wheelsContribution: () => true,
            maxUsageTotal: () => true,

            // Coupon code (always show)
            couponCode: () => true
        };

        return rules[fieldName] ? rules[fieldName]() : false;
    };

    const resetForm = () => {
        setFormData({
            name: '', nameEn: '', description: '', descriptionEn: '',
            offerType: 1, discountType: 1, discountValue: '',
            maxDiscountAmount: '', minOrderAmount: '', priority: 1, isStackable: true,
            maxUsagePerUser: '', wheelsContribution:0, maxUsageTotal: '', startDate: '', endDate: '',
            isActive: true, isFirstOrderOnly: false, userTiers: [], dayOfWeek: [], startTime: null,
            endTime: null, couponCode: '', requiresCouponCode: false, flashSaleQuantity: '',
            RestaurantIds: [], RestaurantBranches: [], Targets: [], applyToDeliveryFee: true,applyToOrderSubtotal: false,channelOffer: false,
        });

        // Reset all search filters
        setRestaurantSearch('');
        setProductSearch('');
        setSelectedProductRestaurants([]); // Add this line
        setEditingOffer(null);

       
    };
   
    const handleEdit = async (offer) => {
        try {
           
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
            } else {
                offerDetail = offer;
            }

            // Handle branches properly for editing
            let selectedBranches = [];
            if (offerDetail.restaurantBranches && offerDetail.restaurantBranches.length > 0) {
                selectedBranches = offerDetail.restaurantBranches.map(rb => ({
                    restaurantId: rb.id,
                    branchId: rb.branchId
                }));

                const completeRestaurantBranches = offerDetail.restaurantBranches.map(rb => {
                    const existingBranch = restaurants.find(r =>
                        r.id === rb.id && r.branchId === rb.branchId
                    );

                    if (existingBranch) {
                        return existingBranch;
                    } else {
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

                const newRestaurants = [...restaurants];
                completeRestaurantBranches.forEach(branch => {
                    const exists = newRestaurants.some(r =>
                        r.id === branch.id && r.branchId === branch.branchId
                    );
                    if (!exists) {
                        newRestaurants.push(branch);
                    }
                });

                if (newRestaurants.length > restaurants.length) {
                    setRestaurants(newRestaurants);
                }
            }


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
                isStackable: offerDetail.isStackable || true,

                // Usage Limits
                maxUsagePerUser: offerDetail.maxUsagePerUser?.toString() || '',
                wheelsContribution: offerDetail.wheelsContribution || 0,
                maxUsageTotal: offerDetail.maxUsageTotal?.toString() || '',

                // FIXED: Dates - convert DateTime to date string format
                startDate: formatDateForInput(offerDetail.startDate),
                endDate: formatDateForInput(offerDetail.endDate),
                isActive: offerDetail.isActive !== undefined ? offerDetail.isActive : true,
                

                // Enhanced properties
                isFirstOrderOnly: offerDetail.isFirstOrderOnly || false,
                userTiers: offerDetail.userTiers || [],
                dayOfWeek: offerDetail.dayOfWeek || [],

                // FIXED: Time fields - handle DateTime or time strings
                startTime: formatTimeOnlyForInput(offerDetail.startTime),
                endTime: formatTimeOnlyForInput(offerDetail.endTime),
                
                // NEW: Discount Application Flags
                applyToOrderSubtotal: offerDetail.applyToOrderSubtotal !== undefined ? offerDetail.applyToOrderSubtotal : true,
                applyToDeliveryFee: offerDetail.applyToDeliveryFee !== undefined ? offerDetail.applyToDeliveryFee : false,

                channelOffer: offerDetail.channelOffer || false, // ADD THIS LINE

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

            
            setFormData(formDataToSet);

            if (formDataToSet.RestaurantIds.length > 0) {
                setSelectedProductRestaurants(formDataToSet.RestaurantIds);

                // IMPORTANT: Wait for restaurants to be fully loaded first
                await new Promise(resolve => setTimeout(resolve, 100));

                if(offerDetail.offerType != 3){
                    await Promise.all([
                        loadCategoriesForRestaurants(formDataToSet.RestaurantIds),
                        loadProductsForRestaurants(formDataToSet.RestaurantIds)
                    ]);
                }
                
            }

            // Load data for product/category offers
            if ((formDataToSet.offerType === 1 || formDataToSet.offerType === 2) &&
                formDataToSet.RestaurantIds.length > 0) {

                const restaurantsToSelect = formDataToSet.RestaurantIds || [];

                if (restaurantsToSelect.length > 0) {
                    setSelectedProductRestaurants(restaurantsToSelect);

                    await Promise.all([
                        loadCategoriesForRestaurants(restaurantsToSelect),
                        loadProductsForRestaurants(restaurantsToSelect)
                    ]);
                } else {
                    setSelectedProductRestaurants([]);
                }
            } else {
                setSelectedProductRestaurants([]);
            }


            setShowCreateModal(true);

        } catch (error) {
            // Fallback
            setFormData({
                ...offer,
                RestaurantIds: offer.restaurantIds || [],
                Targets: offer.targets?.map(t => t.targetId) || [],
                applyToOrderSubtotal: true,
                applyToDeliveryFee: false,
                channelOffer: false,
                restrictedToTiers: offer.userTiers || [],
                restrictedToDaysOfWeek: offer.dayOfWeek || [],
                restrictedStartTime: formatTimeOnlyForInput(offer.startTime),
                restrictedEndTime: formatTimeOnlyForInput(offer.endTime),
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

    const getOfferIcon = (offerType) => {
        const type = offerTypes.find(t => t.value === offerType);
        return type ? type.icon : <Gift className="w-5 h-5" />;
    };
   
    const validateForm = () => {
        const errors = [];
        let discountValueD = parseFloat(formData.discountValue);
        let flashSaleQuantityD = parseFloat(formData.flashSaleQuantity);

        // Basic required fields
        if (!formData.name.trim()) errors.push('Offer name (Arabic) is required');
        if (!formData.startDate) errors.push('Start date is required');
        if (!formData.endDate) errors.push('End date is required');
        if (!formData.discountValue || (!isNaN(discountValueD) && discountValueD <= 0))
            errors.push('Discount value must be greater than 0');
        if (formData.RestaurantIds.length === 0) errors.push('At least one restaurant must be selected');

        // NEW: Discount application validation
        if (!formData.applyToOrderSubtotal && !formData.applyToDeliveryFee) {
            errors.push('Offer must apply to either order subtotal or delivery fee (or both)');
        }

        // Offer type specific validation
        switch (formData.offerType) {
            case 1: // Product Specific
                if (formData.Targets.length === 0) errors.push('At least one product must be selected');
                break;

            case 2: // Category
                if (formData.Targets.length === 0) errors.push('At least one category must be selected');
                break;
                
            case 5: // Flash Sale
                if (!formData.flashSaleQuantity || (!isNaN(flashSaleQuantityD) && flashSaleQuantityD <= 0)) {
                    errors.push('Flash sale quantity must be greater than 0');
                }
                break;
        }

        

        // Date validation
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) >= new Date(formData.endDate)) {
                errors.push('End date must be after start date');
            }
        }

        // NEW: Time constraint validation
        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                errors.push('End time must be after start time for time restrictions');
            }
        }

        // Percentage validation
        if (formData.discountType === 1 && discountValueD > 100) {
            errors.push('Percentage discount cannot exceed 100%');
        }

        // Loyalty tier validation
        if (formData.userTiers.length > 0) {
            const validTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
            const invalidTiers = formData.userTiers.filter(tier => !validTiers.includes(tier));
            if (invalidTiers.length > 0) {
                errors.push(`Invalid loyalty tiers selected: ${invalidTiers.join(', ')}`);
            }
        }

        // Day of week validation
        if (formData.dayOfWeek.length > 0) {
            const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const invalidDays = formData.dayOfWeek.filter(day => !validDays.includes(day));
            if (invalidDays.length > 0) {
                errors.push(`Invalid days selected: ${invalidDays.join(', ')}`);
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
                    {/* Basic Information */}
                    <OfferBasicInfo formData={formData} onInputChange={handleInputChange}/>

                    {/* Offer & Discount Configuration */}
                    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-white border-b border-gray-200 px-5 py-3">
                            <h3 className="text-base font-semibold text-gray-900">Offer Configuration</h3>
                            <p className="text-xs text-gray-600 mt-0.5">Define offer type, discount method, and value</p>
                        </div>

                        <div className="p-5 space-y-5">
                            <OfferTypeSelector
                                formData={formData}
                                offerTypes={offerTypes}
                                onOfferTypeChange={handleOfferTypeChange}
                            />

                            <div className="border-t border-gray-200"></div>

                            <DiscountTypeSelector
                                formData={formData}
                                discountTypes={discountTypes}
                                compatibleTypes={getCompatibleDiscountTypes(formData.offerType)}
                                onDiscountTypeChange={(value) => handleInputChange('discountType', value)}
                            />

                            <div className="border-t border-gray-200"></div>

                            <DiscountConfiguration
                                formData={formData}
                                shouldShowField={shouldShowField}
                                onInputChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Discount Application Scope */}
                    {shouldShowField('discountApplication', formData.offerType, formData.discountType) && (
                        <DiscountApplicationScope
                            formData={formData}
                            onInputChange={handleInputChange}
                        />
                    )}

                    {/* Core Settings */}
                    <CoreSettings
                        formData={formData}
                        shouldShowField={shouldShowField}
                        onInputChange={handleInputChange}
                    />

                    {/* Additional Constraints */}
                    {shouldShowField('constraintsSection', formData.offerType, formData.discountType) && (
                        <AdditionalConstraints
                            formData={formData}
                            userTiers={userTiers}
                            daysOfWeek={daysOfWeek}
                            onInputChange={handleInputChange}
                            onMultiSelect={handleMultiSelect}
                        />
                    )}

                    {/* Coupon Code Configuration */}
                    {shouldShowField('couponCode', formData.offerType, formData.discountType) && (
                        <CouponCodeConfiguration
                            formData={formData}
                            onInputChange={handleInputChange}
                        />
                    )}


                    {shouldShowField('restaurantSelection', formData.offerType, formData.discountType) && (
                        <RestaurantBranchSelection
                            formData={formData}
                            restaurants={restaurants}
                            restaurantSearch={restaurantSearch}
                            setRestaurantSearch={setRestaurantSearch}
                            expandedRestaurants={expandedRestaurants}
                            showCitySelector={showCitySelector}
                            setShowCitySelector={setShowCitySelector}
                            onToggleRestaurantExpansion={toggleRestaurantExpansion}
                            onToggleBranchSelection={toggleBranchSelection}
                            onSelectAllInCity={selectAllRestaurantsInCity}
                            onDeselectAllInCity={deselectAllRestaurantsInCity}
                            getUniqueCities={getUniqueCities}
                            getRestaurantsInCity={getRestaurantsInCity}
                            getUniqueRestaurants={getUniqueRestaurants}
                            getBranchesForRestaurant={getBranchesForRestaurant}
                            isBranchSelected={isBranchSelected}
                            isRestaurantExpanded={isRestaurantExpanded}
                            getRestaurantBranchesForRestaurant={getRestaurantBranchesForRestaurant}
                        />
                    )}

                    {shouldShowField('targetSelection', formData.offerType, formData.discountType, subOfferType) && (
                        <TargetSelection
                            formData={formData}
                            products={products}
                            categories={categories}
                            productSearch={productSearch}
                            setProductSearch={setProductSearch}
                            onToggleTarget={toggleTargetSelection}
                            getFilteredProductsByRestaurants={getFilteredProductsByRestaurants}
                        />
                    )}
                    

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

    const handleToggleStatus = async (offerId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/OffersManagement/${offerId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update the offer in state
                setOffers(prev => prev.map(offer =>
                    offer.offerId === offerId
                        ? { ...offer, isActive: !offer.isActive }
                        : offer
                ));
            } else {
                alert('Failed to toggle offer status');
            }
        } catch (error) {
            console.error('Error toggling offer status:', error);
            alert('Error toggling offer status: ' + error.message);
        }
    };
    
    // ---- New helpers ----
    const normalizeCity = (s) => (s || '').trim().toLowerCase();

// Tries to pull a branch id from common field names
    const pickBranchId = (b) => b?.branchId ?? b?.id ?? b?.Id ?? b?.branchID;

 
    const getCitiesFromOffer = (offer) => {
        if (!offer.restaurantBranches || offer.restaurantBranches.length === 0) return [];
        const cities = [...new Set(offer.restaurantBranches
            .map(rb => rb.cityName)
            .filter(city => city && city.trim())
        )];
        return cities;
    };
    
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {offers
                                .filter(offer => {
                                    if (!showCityOnlyOffers) return true;
                                    return isOrderLevelOffer(offer);
                                })
                                .map(offer => (
                                    <OfferCard
                                        key={offer.offerId}
                                        offer={offer}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggleStatus={handleToggleStatus} // Add this
                                        getOfferIcon={getOfferIcon}
                                        getOfferTypeName={getOfferTypeName}
                                        getDiscountTypeName={getDiscountTypeName}
                                        getCitiesFromOffer={getCitiesFromOffer}
                                        isOrderLevelOffer={isOrderLevelOffer}
                                    />
                                ))}

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
                        <OfferTestingPanel
                            API_BASE_URL={API_BASE_URL}
                            offers={offers}
                            restaurants={restaurants}
                            products={products}
                            categories={categories}
                            getOfferIcon={getOfferIcon}
                            getOfferTypeName={getOfferTypeName}
                            getDiscountTypeName={getDiscountTypeName}
                        />
                    </div>
                )}

                {/* Analytics Tab Content */}
                {activeTab === 'analytics' && (
                    <div className="w-full">
                        <OffersAnalyticsDashboard API_BASE_URL={API_BASE_URL} />
                    </div>
                )}
            </div>

            {/* Your existing modal */}
            {showCreateModal && renderOfferForm()}
        </div>
    );
};

export default CompleteOffersAdmin;
