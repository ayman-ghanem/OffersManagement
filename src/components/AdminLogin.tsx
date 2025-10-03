import { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, TrendingUp, Tag, Percent } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, loading } = useAuth();

    const handleSubmit = async () => {
        setError('');

        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }

        const result = await login(formData.username, formData.password);

        if (!result.success) {
            setError(result.error || 'Login failed. Please try again.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && formData.username && formData.password) {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
            </div>

            <div className="w-full h-full relative z-10 overflow-y-auto">
                <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start py-8">
                        {/* Left Side - Branding & Features - Desktop Only */}
                        <div className="hidden lg:flex flex-1 flex-col gap-6 sticky top-8">
                            {/* Logo & Title */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                    <svg className="w-16 xl:w-20 h-16 xl:h-20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="32" r="28" stroke="url(#gradient)" strokeWidth="3" fill="rgba(220, 38, 38, 0.1)"/>
                                        <circle cx="32" cy="32" r="6" fill="url(#gradient)"/>
                                        <line x1="32" y1="6" x2="32" y2="24" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <line x1="32" y1="40" x2="32" y2="58" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <line x1="6" y1="32" x2="24" y2="32" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <line x1="40" y1="32" x2="58" y2="32" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <line x1="13" y1="13" x2="25" y2="25" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <line x1="39" y1="39" x2="51" y2="51" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <line x1="51" y1="13" x2="39" y2="25" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <line x1="25" y1="39" x2="13" y2="51" stroke="url(#gradient)" strokeWidth="2.5"/>
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#ffffff" />
                                                <stop offset="100%" stopColor="#ffffff" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 xl:w-6 xl:h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                                        <Percent className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-4xl xl:text-5xl font-bold text-white mb-1 tracking-tight">WheelsNow</h1>
                                    <p className="text-white text-base xl:text-lg font-semibold">Offers Management Dashboard</p>
                                </div>
                            </div>

                            <p className="text-white text-base xl:text-lg leading-relaxed">
                                Manage your promotional campaigns, track performance metrics, and optimize your offers—all from one powerful platform.
                            </p>

                            {/* Feature Cards */}
                            <div className="space-y-4 mt-4">
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 xl:p-5 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-start gap-3 xl:gap-4">
                                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Tag className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-base xl:text-lg mb-1">Create & Manage Offers</h3>
                                            <p className="text-white text-sm">Design compelling promotions with flexible discount structures and timing controls.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 xl:p-5 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-start gap-3 xl:gap-4">
                                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-base xl:text-lg mb-1">Real-Time Analytics</h3>
                                            <p className="text-white text-sm">Monitor conversion rates, redemption patterns, and ROI in real-time.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Login Form */}
                        <div className="w-full sm:max-w-md lg:w-auto lg:min-w-[440px] xl:min-w-[480px]">
                            {/* Mobile/Tablet Logo with scrollable features */}
                            <div className="lg:hidden mb-6 sm:mb-8">
                                <div className="text-center mb-4 sm:mb-6">
                                    <div className="inline-flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="32" cy="32" r="28" stroke="#DC2626" strokeWidth="3" fill="rgba(220, 38, 38, 0.1)"/>
                                            <circle cx="32" cy="32" r="6" fill="#DC2626"/>
                                            <line x1="32" y1="6" x2="32" y2="24" stroke="#DC2626" strokeWidth="2.5"/>
                                            <line x1="32" y1="40" x2="32" y2="58" stroke="#DC2626" strokeWidth="2.5"/>
                                            <line x1="6" y1="32" x2="24" y2="32" stroke="#DC2626" strokeWidth="2.5"/>
                                            <line x1="40" y1="32" x2="58" y2="32" stroke="#DC2626" strokeWidth="2.5"/>
                                        </svg>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-white">WheelsNow</h1>
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-300">Offers Management Dashboard</p>
                                </div>

                                {/* Mobile Feature Cards */}
                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Create & Manage Offers</h3>
                                                <p className="text-gray-400 text-xs sm:text-sm">Design compelling promotions with flexible discount structures.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Real-Time Analytics</h3>
                                                <p className="text-gray-400 text-xs sm:text-sm">Monitor conversion rates and ROI in real-time.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
                                <div className="mb-6 sm:mb-8">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome Back</h2>
                                    <p className="text-sm sm:text-base text-gray-600">Sign in to access your offers dashboard</p>
                                </div>

                                <div className="space-y-4 sm:space-y-5">
                                    {/* Username Field */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                            Username / Email
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                                onKeyPress={handleKeyPress}
                                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                                placeholder="Enter your username"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                            Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                onKeyPress={handleKeyPress}
                                                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-gray-900 placeholder-gray-400"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-medium">{error}</span>
                                        </div>
                                    )}

                                    {/* Login Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !formData.username || !formData.password}
                                        className="w-full bg-gradient-to-r from-red-600 via-red-600 to-red-600 hover:from-red-900 hover:via-red-700 hover:to-red-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none shadow-xl disabled:hover:shadow-xl active:scale-95"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Authenticating...</span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                                                Sign In to Dashboard
                                            </span>
                                        )}
                                    </button>

                                    
                                </div>

                                {/* Footer */}
                                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                                    <p className="text-xs text-center text-gray-500">
                                        🔒 Secured with enterprise-grade encryption
                                    </p>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;