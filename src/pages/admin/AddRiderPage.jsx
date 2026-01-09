import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, UserPlus, Loader2, MapPin } from 'lucide-react';

export default function AddRiderPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    vehicleType: 'Motorcycle',
    vehicleNumber: '',
    licenseNumber: '',
    stationId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setIsLoadingStations(true);
      const response = await api.get('/admin/stations');
      const stationsData = response.data.data?.stations || [];
      const activeStations = stationsData.filter(station => station.isActive);
      setStations(activeStations);
      
      if (activeStations.length > 0) {
        setFormData(prev => ({ ...prev, stationId: activeStations[0].id }));
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to load stations');
    } finally {
      setIsLoadingStations(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{11}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 11 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle plate number is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.stationId) {
      newErrors.stationId = 'Please select a station';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // Format the phone number to ensure it starts with country code if needed
      const formattedData = {
        ...formData,
        phone: formData.phone.startsWith('0') ? `234${formData.phone.slice(1)}` : formData.phone
      };

      const response = await api.post('/admin/riders', formattedData);
      
      if (response.data.success) {
        toast.success('Rider added successfully! 🎉');
        
        // Wait a bit then navigate
        setTimeout(() => {
          navigate('/admin/riders');
        }, 1500);
      } else {
        toast.error(response.data.error || 'Failed to add rider');
      }
    } catch (error) {
      console.error('Error adding rider:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to add rider. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData(prev => ({ 
      ...prev, 
      phone: value 
    }));
    
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/admin/riders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Riders</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Rider</h1>
              <p className="text-gray-600">Register a new delivery rider</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h2>
            <p className="text-gray-600 text-sm">Basic details about the rider</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength="11"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="08012345678"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">11 digits, will be used for login</p>
                {errors.phone && (
                  <p className="text-red-600 text-sm">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="rider@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 pt-6 border-t">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Vehicle Information</h2>
            <p className="text-gray-600 text-sm">Details about the rider's vehicle</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleType"
                required
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Car">Car</option>
                <option value="Tricycle">Tricycle</option>
              </select>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicleNumber"
                required
                value={formData.vehicleNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.vehicleNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="ABC-123-XY"
              />
              {errors.vehicleNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.vehicleNumber}</p>
              )}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver's License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="licenseNumber"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.licenseNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="DL-12345-NG"
              />
              {errors.licenseNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.licenseNumber}</p>
              )}
            </div>

            {/* Station */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Station <span className="text-red-500">*</span>
              </label>
              <select
                name="stationId"
                required
                value={formData.stationId}
                onChange={handleChange}
                disabled={isLoadingStations}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.stationId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${isLoadingStations ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoadingStations ? (
                  <option value="">Loading stations...</option>
                ) : stations.length === 0 ? (
                  <option value="">No stations available</option>
                ) : (
                  stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name} - {station.address}
                    </option>
                  ))
                )}
              </select>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Rider will receive orders from this station
                </p>
                {errors.stationId && (
                  <p className="text-red-600 text-sm">{errors.stationId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/riders')}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || stations.length === 0 || isLoadingStations}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding Rider...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Add Rider
                </>
              )}
            </button>
          </div>

          {stations.length === 0 && !isLoadingStations && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <MapPin size={16} />
                <span className="font-medium">No stations available</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Please add a station first before adding riders. Riders need to be assigned to a station to receive orders.
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin/stations')}
                className="mt-2 text-yellow-800 hover:text-yellow-900 font-medium text-sm underline"
              >
                Go to Stations Management
              </button>
            </div>
          )}

          {isLoadingStations && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Loader2 className="animate-spin" size={16} />
                <span className="font-medium">Loading stations...</span>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}