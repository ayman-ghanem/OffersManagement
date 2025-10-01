import React, { useState } from 'react';
import {
    Edit2,
    Trash2,
    Clock,
    Users,
    Target,
    MapPin,
    Tag,
    Zap,
    Award,
    Calendar,
    TrendingUp,
    AlertCircle,
    Gift,
    Layers,
    ChevronDown,
    ChevronUp,
    Info,
    Percent,
    DollarSign, RefreshCw, XCircle,
    CheckCircle
} from 'lucide-react';

const OfferCard = ({
                       offer,
                       onEdit,
                       onDelete,
                       onToggleStatus,
                       getOfferIcon,
                       getOfferTypeName,
                       getDiscountTypeName,
                       getCitiesFromOffer,
                       isOrderLevelOffer
                   }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const [toggling, setToggling] = useState(false);

    const handleToggleStatus = async (e) => {
        e.stopPropagation(); // Prevent any parent click handlers
        setToggling(true);
        try {
            await onToggleStatus(offer.offerId);
        } finally {
            setToggling(false);
        }
    };
    
    // Status determination
    const getStatus = () => {
        if (!offer.isActive) return {
            text: 'Inactive',
            color: 'gray',
            bg: 'bg-gray-50',
            border: 'border-gray-300',
            textColor: 'text-gray-700',
            dotColor: 'bg-gray-400'
        };

        const now = new Date();
        const endDate = offer.endDate ? new Date(offer.endDate) : null;
        const startDate = offer.startDate ? new Date(offer.startDate) : null;

        if (endDate && endDate < now) return {
            text: 'Expired',
            color: 'red',
            bg: 'bg-red-50',
            border: 'border-red-300',
            textColor: 'text-red-700',
            dotColor: 'bg-red-500'
        };

        if (startDate && startDate > now) return {
            text: 'Scheduled',
            color: 'blue',
            bg: 'bg-blue-50',
            border: 'border-blue-300',
            textColor: 'text-blue-700',
            dotColor: 'bg-blue-500'
        };

        if (offer.maxUsageTotal && offer.currentUsage >= offer.maxUsageTotal) return {
            text: 'Limit Reached',
            color: 'orange',
            bg: 'bg-orange-50',
            border: 'border-orange-300',
            textColor: 'text-orange-700',
            dotColor: 'bg-orange-500'
        };

        return {
            text: 'Active',
            color: 'green',
            bg: 'bg-green-50',
            border: 'border-green-300',
            textColor: 'text-green-700',
            dotColor: 'bg-green-500',
            pulse: true
        };
    };

    const status = getStatus();

    // Get badges
    const getBadges = () => {
        const badges = [];
        if (offer.isFirstOrderOnly) badges.push({
            text: 'NEW',
            color: 'bg-blue-500 text-white',
            tooltip: 'First-time customers only'
        });
        if (offer.requiresCouponCode) badges.push({
            text: offer.couponCode || 'COUPON',
            color: 'bg-purple-500 text-white',
            tooltip: 'Requires coupon code'
        });
        if (offer.userTiers?.length) badges.push({
            text: 'VIP',
            color: 'bg-yellow-500 text-white',
            tooltip: offer.userTiers.join(', ')
        });
        if (offer.flashSaleQuantity) badges.push({
            text: 'FLASH',
            color: 'bg-red-500 text-white animate-pulse',
            tooltip: `Limited to ${offer.flashSaleQuantity} uses`
        });
        
        if (offer.channelOffer) badges.push({
            text: 'CHANNEL',
            color: 'bg-teal-500 text-white',
            tooltip: 'Channel-specific offer'
        });
        return badges;
    };

    const badges = getBadges();
    const cities = getCitiesFromOffer(offer);
    const isOrderLevel = isOrderLevelOffer(offer);

    // Usage progress
    const usageProgress = offer.maxUsageTotal
        ? Math.min(Math.round(((offer.currentUsage || 0) / offer.maxUsageTotal) * 100), 100)
        : null;

    // Days remaining
    const getDaysRemaining = () => {
        if (!offer.endDate) return null;
        const end = new Date(offer.endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    };

    const daysRemaining = getDaysRemaining();

    // Format discount display
    const getDiscountDisplay = () => {
        if (offer.discountType === 1) {
            return {
                value: `${offer.discountValue}%`,
                subtitle: offer.maxDiscountAmount ? `up to ${offer.maxDiscountAmount} شيقل` : 'off',
                icon: <Percent className="w-5 h-5" />
            };
        } else if (offer.discountType === 2) {
            return {
                value: `${offer.discountValue}`,
                subtitle: 'شيقل off',
                icon: <DollarSign className="w-5 h-5" />
            };
        }
        return { value: 'Special', subtitle: 'Discount', icon: <Gift className="w-5 h-5" /> };
    };

    const discountDisplay = getDiscountDisplay();

    return (
        <div className={`
            bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-300 flex flex-col h-full
            hover:shadow-xl hover:-translate-y-1
            ${status.color === 'green' ? 'border-green-200' : status.border}
        `}>
            {/* Colored Top Bar */}
            <div className={`h-1.5 ${
                status.color === 'green' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    status.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                        status.color === 'orange' ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                            status.color === 'red' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                                'bg-gray-300'
            }`} />

            {/* Header */}
            <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                    {/* Title Section */}
                    <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg truncate">
                                {offer.name}
                            </h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                <div className="[&>svg]:w-3 [&>svg]:h-3">
                                    {getOfferIcon(offer.offerType)}
                                </div>
                                {getOfferTypeName(offer.offerType)}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">
                                {getDiscountTypeName(offer.discountType)}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full border flex-shrink-0
                        ${status.bg} ${status.border}
                    `}>
                        <div className={`w-2 h-2 rounded-full ${status.dotColor} ${status.pulse ? 'animate-pulse' : ''}`} />
                        <span className={`text-xs font-bold ${status.textColor}`}>
                            {status.text}
                        </span>
                    </div>
                </div>

                {/* Tags */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {badges.slice(0, 4).map((badge, i) => (
                            <span
                                key={i}
                                className={`px-2 py-0.5 rounded-md text-xs font-bold ${badge.color}`}
                                title={badge.tooltip}
                            >
                                {badge.text}
                            </span>
                        ))}
                        {badges.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-200 text-gray-700">
                                +{badges.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Discount Display - Large and Prominent */}
            <div className="px-5 pb-4">
                <div className={`
                    relative overflow-hidden rounded-xl p-4 border-2
                    ${status.color === 'green'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                }
                `}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-3xl" />
                    </div>

                    <div className="relative flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Discount
                            </div>
                            <div className={`text-4xl font-black mb-1 ${
                                status.color === 'green' ? 'text-green-600' : 'text-gray-700'
                            }`}>
                                {discountDisplay.value}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                                {discountDisplay.subtitle}
                            </div>
                            {offer.minOrderAmount && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Min. order: {offer.minOrderAmount} شيقل
                                </div>
                            )}
                        </div>
                        <div className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center
                            ${status.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}
                        `}>
                            {discountDisplay.icon}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Info */}
            <div className="px-5 pb-4 space-y-2">
                {/* Application */}
                {(offer.applyToOrderSubtotal || offer.applyToDeliveryFee) && (
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="flex items-center gap-1 flex-wrap text-xs">
                            <span className="text-gray-600">Applies to:</span>
                            {offer.applyToOrderSubtotal && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                                    Order
                                </span>
                            )}
                            {offer.applyToDeliveryFee && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                                    Delivery
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Cities */}
                {isOrderLevel && cities.length > 0 && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">
                            {cities.length === 1 ? cities[0] : `${cities.length} cities`}
                        </span>
                    </div>
                )}

                {/* Date Range */}
                {offer.startDate && offer.endDate && (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600">
                            {new Date(offer.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' → '}
                            {new Date(offer.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                )}

                {/* Days Remaining */}
                {daysRemaining !== null && (
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                        daysRemaining <= 1 ? 'bg-red-100' :
                            daysRemaining <= 3 ? 'bg-orange-100' :
                                daysRemaining <= 7 ? 'bg-yellow-100' :
                                    'bg-blue-100'
                    }`}>
                        <Clock className={`w-4 h-4 flex-shrink-0 ${
                            daysRemaining <= 1 ? 'text-red-600' :
                                daysRemaining <= 3 ? 'text-orange-600' :
                                    daysRemaining <= 7 ? 'text-yellow-600' :
                                        'text-blue-600'
                        }`} />
                        <span className={`text-xs font-semibold ${
                            daysRemaining <= 1 ? 'text-red-700' :
                                daysRemaining <= 3 ? 'text-orange-700' :
                                    daysRemaining <= 7 ? 'text-yellow-700' :
                                        'text-blue-700'
                        }`}>
                            {daysRemaining === 1 ? 'Expires tomorrow' : `${daysRemaining} days left`}
                        </span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Priority</div>
                        <div className="text-lg font-bold text-gray-900">{offer.priority ?? 5}</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Used</div>
                        <div className="text-lg font-bold text-blue-600">{offer.currentUsage ?? 0}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Limit</div>
                        <div className="text-lg font-bold text-gray-900">
                            {offer.maxUsageTotal || '∞'}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {usageProgress !== null && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium">Usage</span>
                            <span className={`font-bold ${
                                usageProgress >= 90 ? 'text-red-600' :
                                    usageProgress >= 70 ? 'text-orange-600' :
                                        'text-blue-600'
                            }`}>
                                {usageProgress}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 transition-all duration-500 ${
                                    usageProgress >= 90 ? 'bg-red-500' :
                                        usageProgress >= 70 ? 'bg-orange-500' :
                                            'bg-gradient-to-r from-blue-500 to-blue-600'
                                }`}
                                style={{ width: `${usageProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Expandable Details */}
            {(offer.description || offer.isFirstOrderOnly || offer.userTiers?.length > 0) && (
                <div className="px-5 pb-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <span className="font-medium">Details</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                        <div className="mt-3 space-y-2 text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
                            {offer.description && (
                                <p className="leading-relaxed">{offer.description}</p>
                            )}
                            {offer.isFirstOrderOnly && (
                                <div className="flex items-center gap-2 text-blue-700">
                                    <Users className="w-3 h-3" />
                                    <span>First-time customers only</span>
                                </div>
                            )}
                            {offer.userTiers && offer.userTiers.length > 0 && (
                                <div className="flex items-center gap-2 text-yellow-700">
                                    <Award className="w-3 h-3" />
                                    <span>Loyalty: {offer.userTiers.join(', ')}</span>
                                </div>
                            )}
                            {offer.dayOfWeek && offer.dayOfWeek.length > 0 && offer.dayOfWeek.length < 7 && (
                                <div className="flex items-center gap-2 text-green-700">
                                    <Clock className="w-3 h-3" />
                                    <span>{offer.dayOfWeek.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="mt-auto p-4 bg-gray-50 border-t border-gray-100 space-y-2">
                {/* Toggle Status Button */}
                <button
                    onClick={handleToggleStatus}
                    disabled={toggling}
                    className={`
            w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
            ${offer.isActive
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-2 border-orange-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                    }
            disabled:opacity-50 disabled:cursor-not-allowed
        `}
                >
                    {toggling ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : offer.isActive ? (
                        <>
                            <XCircle className="w-4 h-4" />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Activate
                        </>
                    )}
                </button>

                {/* Edit and Delete Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(offer)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all font-semibold text-gray-700 hover:text-blue-700 text-sm shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(offer.offerId)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all font-semibold text-gray-700 hover:text-red-700 text-sm shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfferCard;