import { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, User, AlertCircle } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-auto h-16 bg-gradient-to-r">
                        <img
                            src="data:image/png;base64,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"
                            alt="WheelsNow Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2"></h1>
                    <p className="text-gray-600"></p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username / Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* API Info */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium mb-2">API Authentication:</p>
                            <p className="text-xs text-blue-700">Endpoint: POST /api/admin/OffersManagement/login</p>
                            <p className="text-xs text-blue-700">Enter your valid credentials to continue</p>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.username || !formData.password}
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-red-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-90 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In to Admin Panel'
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Secured with enterprise-grade authentication
                        </p>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        This is a secure admin area. All activities are monitored and logged.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;