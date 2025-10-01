import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Users, Target,
    Calendar, Clock, Award, Zap, Filter, Download, RefreshCw,
    AlertCircle, CheckCircle, Activity
} from 'lucide-react';

const OffersAnalyticsDashboard = ({ API_BASE_URL }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Date range state
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const [selectedRestaurant, setSelectedRestaurant] = useState('');

    // Load analytics from API
    const loadAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                startDate: startDate,
                endDate: endDate
            });

            if (selectedRestaurant) {
                params.append('restaurantId', selectedRestaurant);
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin/OffersManagement/analytics?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to load analytics');
            }

            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, [startDate, endDate, selectedRestaurant]);

    // Calculate derived metrics
    const metrics = analyticsData ? {
        totalOffers: analyticsData.totalOffers,
        activeOffers: analyticsData.activeOffers,
        expiredOffers: analyticsData.expiredOffers,
        flashSalesSoldOut: analyticsData.flashSalesSoldOut,
        totalDiscountGiven: analyticsData.totalDiscountGiven,
        averageDiscountPerOrder: analyticsData.averageDiscountPerOrder,
        totalUsage: analyticsData.dailyUsage?.reduce((sum, day) => sum + day.usageCount, 0) || 0,
        uniqueUsers: analyticsData.dailyUsage?.reduce((sum, day) => sum + day.uniqueUsers, 0) || 0
    } : null;

    const MetricCard = ({ title, value, icon: Icon, color, prefix = '', suffix = '' }) => (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </h3>
                <p className="text-sm text-gray-600">{title}</p>
            </div>
        </div>
    );

    const exportAnalytics = () => {
        if (!analyticsData) return;

        const exportData = {
            timestamp: new Date().toISOString(),
            dateRange: { startDate, endDate },
            restaurantFilter: selectedRestaurant || 'All',
            data: analyticsData
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offers-analytics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading && !analyticsData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-gray-900 font-semibold mb-2">Failed to load analytics</p>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadAnalytics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!analyticsData) return null;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex items-end gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="p-2 border-2 border-gray-300 rounded-lg text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="p-2 border-2 border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={exportAnalytics}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Offers"
                    value={metrics.totalOffers}
                    icon={Target}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Active Offers"
                    value={metrics.activeOffers}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Total Discount Given"
                    value={metrics.totalDiscountGiven.toFixed(2)}
                    icon={DollarSign}
                    color="bg-purple-500"
                    prefix="JOD "
                />
                <MetricCard
                    title="Avg Discount/Order"
                    value={metrics.averageDiscountPerOrder.toFixed(2)}
                    icon={TrendingUp}
                    color="bg-orange-500"
                    prefix="JOD "
                />
                <MetricCard
                    title="Total Usage"
                    value={metrics.totalUsage}
                    icon={Activity}
                    color="bg-indigo-500"
                />
                <MetricCard
                    title="Unique Users"
                    value={metrics.uniqueUsers}
                    icon={Users}
                    color="bg-teal-500"
                />
                <MetricCard
                    title="Expired Offers"
                    value={metrics.expiredOffers}
                    icon={Clock}
                    color="bg-red-500"
                />
                <MetricCard
                    title="Flash Sales Sold Out"
                    value={metrics.flashSalesSoldOut}
                    icon={Zap}
                    color="bg-yellow-500"
                />
            </div>

            {/* Daily Usage Trend */}
            {analyticsData.dailyUsage && analyticsData.dailyUsage.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-semibold mb-6">Daily Usage Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData.dailyUsage}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDiscount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                    formatter={(value, name) => [
                                        name === 'usageCount' ? value : `JOD ${value}`,
                                        name === 'usageCount' ? 'Usage Count' : 'Total Discount'
                                    ]}
                                />
                                <Legend />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="usageCount"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorUsage)"
                                    name="Usage Count"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="totalDiscount"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorDiscount)"
                                    name="Total Discount (JOD)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Performance by Offer Type */}
            {analyticsData.offerTypeStats && analyticsData.offerTypeStats.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-semibold mb-6">Performance by Offer Type</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.offerTypeStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="offerType"
                                    tickFormatter={(type) => {
                                        const types = { 1: 'Product', 2: 'Category', 3: 'Order' };
                                        return types[type] || `Type ${type}`;
                                    }}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'totalDiscount' ? `JOD ${value}` : value,
                                        name === 'count' ? 'Total Offers' :
                                            name === 'activeCount' ? 'Active Offers' :
                                                name === 'totalUsage' ? 'Usage Count' :
                                                    'Total Discount'
                                    ]}
                                    labelFormatter={(type) => {
                                        const types = { 1: 'Product Offers', 2: 'Category Offers', 3: 'Order Offers' };
                                        return types[type] || `Offer Type ${type}`;
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="count" fill="#3b82f6" name="Total Offers" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="activeCount" fill="#10b981" name="Active Offers" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="totalUsage" fill="#f59e0b" name="Usage Count" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Top Performing Offers */}
            {analyticsData.topPerformingOffers && analyticsData.topPerformingOffers.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-semibold mb-6">Top Performing Offers</h3>
                    <div className="space-y-3">
                        {analyticsData.topPerformingOffers.map((offer, index) => (
                            <div key={offer.offerId} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                    }`}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{offer.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {offer.offerType === 1 ? 'Product Offer' :
                                                offer.offerType === 2 ? 'Category Offer' :
                                                    offer.offerType === 3 ? 'Order Offer' : 'Special Offer'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">{offer.usageCount}</div>
                                        <div className="text-gray-500 text-xs">Uses</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-green-600">JOD {offer.totalDiscount.toFixed(2)}</div>
                                        <div className="text-gray-500 text-xs">Discount</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-blue-600">{offer.conversionRate.toFixed(1)}%</div>
                                        <div className="text-gray-500 text-xs">Conv. Rate</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Flash Sale Performance */}
            {analyticsData.flashSalePerformance && analyticsData.flashSalePerformance.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-semibold mb-6">Flash Sale Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-3 font-semibold">Offer Name</th>
                                <th className="text-right p-3 font-semibold">Total Qty</th>
                                <th className="text-right p-3 font-semibold">Sold</th>
                                <th className="text-right p-3 font-semibold">Sell-Through Rate</th>
                                <th className="text-right p-3 font-semibold">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {analyticsData.flashSalePerformance.map((flash) => (
                                <tr key={flash.offerId} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 font-medium">{flash.name}</td>
                                    <td className="p-3 text-right">{flash.totalQuantity}</td>
                                    <td className="p-3 text-right font-semibold text-blue-600">{flash.soldQuantity}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        flash.sellThroughRate >= 90 ? 'bg-red-500' :
                                                            flash.sellThroughRate >= 70 ? 'bg-orange-500' :
                                                                flash.sellThroughRate >= 50 ? 'bg-yellow-500' :
                                                                    'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min(flash.sellThroughRate, 100)}%` }}
                                                />
                                            </div>
                                            <span className="font-semibold">{flash.sellThroughRate.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                flash.soldQuantity >= flash.totalQuantity
                                                    ? 'bg-red-100 text-red-700'
                                                    : flash.sellThroughRate >= 70
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                            }`}>
                                                {flash.soldQuantity >= flash.totalQuantity ? 'SOLD OUT' : 'ACTIVE'}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Summary Stats Table */}
            {analyticsData.offerTypeStats && analyticsData.offerTypeStats.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-semibold mb-6">Detailed Statistics by Offer Type</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-3 font-semibold">Offer Type</th>
                                <th className="text-right p-3 font-semibold">Total Offers</th>
                                <th className="text-right p-3 font-semibold">Active</th>
                                <th className="text-right p-3 font-semibold">Total Usage</th>
                                <th className="text-right p-3 font-semibold">Total Discount</th>
                                <th className="text-right p-3 font-semibold">Avg per Use</th>
                            </tr>
                            </thead>
                            <tbody>
                            {analyticsData.offerTypeStats.map((stat) => (
                                <tr key={stat.offerType} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 font-medium">
                                        {stat.offerType === 1 ? 'Product Specific' :
                                            stat.offerType === 2 ? 'Category' :
                                                stat.offerType === 3 ? 'Order Total' : `Type ${stat.offerType}`}
                                    </td>
                                    <td className="p-3 text-right">{stat.count}</td>
                                    <td className="p-3 text-right">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
                                                {stat.activeCount}
                                            </span>
                                    </td>
                                    <td className="p-3 text-right font-semibold">{stat.totalUsage}</td>
                                    <td className="p-3 text-right text-green-600 font-bold">
                                        JOD {stat.totalDiscount.toFixed(2)}
                                    </td>
                                    <td className="p-3 text-right">
                                        JOD {stat.totalUsage > 0 ? (stat.totalDiscount / stat.totalUsage).toFixed(2) : '0.00'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersAnalyticsDashboard;