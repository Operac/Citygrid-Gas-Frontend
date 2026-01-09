import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('CUSTOMER'); // CUSTOMER or RIDER
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Rider specific fields
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    stationId: '',
    documentsUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare request data based on user type
      const requestData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined, // Send undefined if empty
        password: formData.password,
        role: userType
      };

      // Add rider data if registering as rider
      if (userType === 'RIDER') {
        if (!formData.vehicleType || !formData.vehicleNumber || !formData.licenseNumber) {
          toast.error('Please fill in all rider information');
          setIsLoading(false);
          return;
        }
        
        requestData.riderData = {
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber,
          licenseNumber: formData.licenseNumber,
          stationId: formData.stationId || undefined,
          documentsUrl: formData.documentsUrl || undefined
        };
      }

      const response = await api.post('/auth/register', requestData);
      
      // Updated response structure
      const { user, token, message } = response.data;

      login(user, token);
      toast.success(message || 'Registration successful!');
      
      // Redirect based on role and activation status
      if (user.role === 'RIDER' && !user.isActive) {
        // Rider needs admin approval
        navigate('/pending-approval');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'RIDER') {
        navigate('/rider');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Reset rider-specific fields when switching to customer
    if (type === 'CUSTOMER') {
      setFormData(prev => ({
        ...prev,
        vehicleType: '',
        vehicleNumber: '',
        licenseNumber: '',
        stationId: '',
        documentsUrl: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-2">
            <img 
              src="/citygrid_logo.png" 
              alt="CityGrid Energy" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join CityGrid Energy today
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            I want to register as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleUserTypeChange('CUSTOMER')}
              className={`py-3 px-4 rounded-lg border-2 text-center font-medium transition-colors ${
                userType === 'CUSTOMER'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeChange('RIDER')}
              className={`py-3 px-4 rounded-lg border-2 text-center font-medium transition-colors ${
                userType === 'RIDER'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              🚴 Rider
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="08012345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Rider Specific Fields */}
          {userType === 'RIDER' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">Rider Information</h3>
              
              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-green-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  required
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
                  disabled={isLoading}
                >
                  <option value="">Select vehicle type</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Tricycle">Tricycle</option>
                  <option value="Minivan">Minivan</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>

              <div>
                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-green-700 mb-2">
                  Vehicle Number *
                </label>
                <input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  placeholder="AB123CD"
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-green-700 mb-2">
                  License Number *
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="LIC123456"
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  📝 <strong>Note:</strong> Rider accounts require admin approval before you can start accepting orders.
                </p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Creating account...
              </>
            ) : (
              `Create ${userType.toLowerCase()} account`
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}