import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Users, Target,
    Calendar, Clock, Award, Zap, Filter, Download, RefreshCw
} from 'lucide-react';
import {useEffect, useState} from "react";

const OffersAnalyticsDashboard = ({ offers = [], API_BASE_URL }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('30'); // days
    const [selectedOfferType, setSelectedOfferType] = useState('all');

    // Mock data for demonstration - replace with real API calls
    const [mockMetrics] = useState({
        totalRevenue: 45620,
        totalSavings: 15430,
        customerUsage: 1247,
        conversionRate: 23.5,
        avgOrderValue: 35.2,
        newCustomers: 312
    });

    const [offerPerformanceData] = useState([
        { name: 'Product', offers: 12, revenue: 15400, usage: 450, conversionRate: 28.5 },
        { name: 'Category', offers: 8, revenue: 12300, usage: 380, conversionRate: 24.2 },
        { name: 'Order Total', offers: 6, revenue: 8900, usage: 220, conversionRate: 31.8 },
        { name: 'First Order', offers: 4, revenue: 6800, usage: 140, conversionRate: 42.1 },
        { name: 'Loyalty', offers: 5, revenue: 4200, usage: 95, conversionRate: 18.9 },
        { name: 'Time-Based', offers: 3, revenue: 2900, usage: 85, conversionRate: 35.6 },
        { name: 'Flash Sale', offers: 2, revenue: 8900, usage: 180, conversionRate: 78.2 }
    ]);

    const [revenueData] = useState([
        { date: '2025-01', baseline: 85000, withOffers: 102000, growth: 20 },
        { date: '2025-02', baseline: 88000, withOffers: 112000, growth: 27.3 },
        { date: '2025-03', baseline: 91000, withOffers: 118000, growth: 29.7 },
        { date: '2025-04', baseline: 89000, withOffers: 125000, growth: 40.4 },
        { date: '2025-05', baseline: 93000, withOffers: 135000, growth: 45.2 },
        { date: '2025-06', baseline: 96000, withOffers: 142000, growth: 47.9 }
    ]);

    const [customerSegmentData] = useState([
        { segment: 'New Customers', value: 35, color: '#ef4444' },
        { segment: 'Bronze Tier', value: 28, color: '#f59e0b' },
        { segment: 'Silver Tier', value: 22, color: '#6b7280' },
        { segment: 'Gold Tier', value: 12, color: '#eab308' },
        { segment: 'Platinum Tier', value: 3, color: '#8b5cf6' }
    ]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // Replace with actual API call
            // const response = await fetch(`${API_BASE_URL}/api/admin/analytics/offers?days=${dateRange}`);
            // const data = await response.json();
            // setAnalyticsData(data);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAnalyticsData(mockMetrics);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const MetricCard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
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
        const exportData = {
            timestamp: new Date().toISOString(),
            dateRange: `${dateRange} days`,
            metrics: analyticsData,
            offerPerformance: offerPerformanceData,
            revenueData: revenueData,
            customerSegments: customerSegmentData
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offers-analytics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="p-2 border rounded-md text-sm"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                            <select
                                value={selectedOfferType}
                                onChange={(e) => setSelectedOfferType(e.target.value)}
                                className="p-2 border rounded-md text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="1">Product Specific</option>
                                <option value="2">Category</option>
                                <option value="3">Order Total</option>
                                <option value="5">First Order</option>
                                <option value="6">Loyalty Tier</option>
                                <option value="9">Flash Sale</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={loadAnalytics}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <MetricCard
                    title="Total Revenue Impact"
                    value={mockMetrics.totalRevenue}
                    change={28.4}
                    icon={DollarSign}
                    color="bg-green-500"
                    prefix="₪"
                />
                <MetricCard
                    title="Customer Savings"
                    value={mockMetrics.totalSavings}
                    change={15.2}
                    icon={Target}
                    color="bg-blue-500"
                    prefix="₪"
                />
                <MetricCard
                    title="Total Usage"
                    value={mockMetrics.customerUsage}
                    change={32.1}
                    icon={Users}
                    color="bg-purple-500"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={mockMetrics.conversionRate}
                    change={8.3}
                    icon={TrendingUp}
                    color="bg-orange-500"
                    suffix="%"
                />
                <MetricCard
                    title="Avg Order Value"
                    value={mockMetrics.avgOrderValue}
                    change={12.7}
                    icon={Award}
                    color="bg-indigo-500"
                    prefix="₪"
                />
                <MetricCard
                    title="New Customers"
                    value={mockMetrics.newCustomers}
                    change={45.8}
                    icon={Zap}
                    color="bg-red-500"
                />
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-6">Revenue Impact Over Time</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name) => [`₪${value.toLocaleString()}`, name]}
                                labelFormatter={(label) => `Month: ${label}`}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="baseline"
                                stroke="#6b7280"
                                strokeWidth={2}
                                name="Baseline Revenue"
                                strokeDasharray="5 5"
                            />
                            <Line
                                type="monotone"
                                dataKey="withOffers"
                                stroke="#ef4444"
                                strokeWidth={3}
                                name="With Offers"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Performance by Offer Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-xl font-semibold mb-6">Performance by Offer Type</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={offerPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`₪${value.toLocaleString()}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-xl font-semibold mb-6">Customer Segments</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={customerSegmentData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({segment, value}) => `${segment}: ${value}%`}
                                >
                                    {customerSegmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Performance Table */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-6">Detailed Offer Performance</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left p-3 font-semibold">Offer Type</th>
                            <th className="text-right p-3 font-semibold">Active Offers</th>
                            <th className="text-right p-3 font-semibold">Total Usage</th>
                            <th className="text-right p-3 font-semibold">Revenue Impact</th>
                            <th className="text-right p-3 font-semibold">Conversion Rate</th>
                            <th className="text-right p-3 font-semibold">Avg Savings</th>
                            <th className="text-right p-3 font-semibold">ROI</th>
                        </tr>
                        </thead>
                        <tbody>
                        {offerPerformanceData.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{row.name}</td>
                                <td className="p-3 text-right">{row.offers}</td>
                                <td className="p-3 text-right">{row.usage.toLocaleString()}</td>
                                <td className="p-3 text-right text-green-600 font-semibold">
                                    ₪{row.revenue.toLocaleString()}
                                </td>
                                <td className="p-3 text-right">{row.conversionRate}%</td>
                                <td className="p-3 text-right">₪{(row.revenue / row.usage).toFixed(2)}</td>
                                <td className="p-3 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            row.conversionRate > 30
                                                ? 'bg-green-100 text-green-800'
                                                : row.conversionRate > 20
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {row.conversionRate > 30 ? 'Excellent' : row.conversionRate > 20 ? 'Good' : 'Needs Improvement'}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Performing Offers */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-6">Top Performing Offers</h3>

                <div className="space-y-4">
                    {offers.slice(0, 5).map((offer, index) => {
                        const mockUsage = Math.floor(Math.random() * 500) + 50;
                        const mockRevenue = Math.floor(Math.random() * 10000) + 1000;
                        const mockConversion = (Math.random() * 40 + 10).toFixed(1);

                        return (
                            <div key={offer.offerId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{offer.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {offer.discountType === 1 ? `${offer.discountValue}% off` :
                                                offer.discountType === 2 ? `₪${offer.discountValue} off` :
                                                    'Special offer'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900">{mockUsage}</div>
                                        <div className="text-gray-500">Uses</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-green-600">₪{mockRevenue.toLocaleString()}</div>
                                        <div className="text-gray-500">Revenue</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-blue-600">{mockConversion}%</div>
                                        <div className="text-gray-500">Conversion</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Insights & Recommendations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <h4 className="font-semibold text-green-800">High Performance</h4>
                            </div>
                            <p className="text-sm text-green-700">
                                Flash Sale offers show 78% conversion rate - consider expanding flash sale frequency during peak hours.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <h4 className="font-semibold text-yellow-800">Opportunity</h4>
                            </div>
                            <p className="text-sm text-yellow-700">
                                Loyalty tier offers underperforming at 18.9% conversion. Consider increasing discount values or adding exclusive perks.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h4 className="font-semibold text-blue-800">Trend Analysis</h4>
                            </div>
                            <p className="text-sm text-blue-700">
                                First-order offers driving 42% conversion but only 4 active offers. Scale up new customer acquisition campaigns.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <h4 className="font-semibold text-red-800">Action Required</h4>
                            </div>
                            <p className="text-sm text-red-700">
                                Category offers show declining trend. Review product selection and consider seasonal adjustments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffersAnalyticsDashboard;