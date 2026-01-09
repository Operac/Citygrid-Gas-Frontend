import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingCart, MapPin, Loader2, LogOut, Navigation, Building, Truck, Home } from 'lucide-react';

// Available cylinder sizes (hardcoded)
const AVAILABLE_SIZES = ['3kg', '6kg', '12.5kg', '25kg', '50kg'];

// Mock pricing for cylinder sizes
const CYLINDER_PRICES = {
  '3kg': 3500,
  '6kg': 6500,
  '12.5kg': 12000,
  '25kg': 22000,
  '50kg': 40000
};

export default function HomePage() {
  const navigate = useNavigate();
  const { orderForm, updateOrderForm, clearOrderForm } = useOrderStore();
  const { user, logout, shouldRedirect } = useAuthStore();
  
  // Redirect non-customers to their dashboards
  useEffect(() => {
    if (user?.role === 'ADMIN') navigate('/admin');
    if (user?.role === 'RIDER') navigate('/rider');
    if (user?.role === 'STATION_MANAGER') navigate('/manager');
  }, [user, navigate]);

  // FIXED: Initialize with empty arrays instead of undefined
  const [stations, setStations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [nearestStation, setNearestStation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingStation, setIsFindingStation] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch all stations with inventory
  const fetchStations = async () => {
    try {
      const response = await api.get('/stations');
      
      // FIXED: Correct response structure - backend returns { success, data: [...] }
      const stationsData = response.data?.data || [];
      setStations(stationsData);
      
      if (stationsData.length > 0 && !selectedStation) {
        // Set first station as default if none selected
        setSelectedStation(stationsData[0]);
        setInventory(stationsData[0].inventory || []);
      }
    } catch (error) {
      console.error('Failed to load stations:', error);
      toast.error('Could not load nearby stations');
    }
  };

  // Real-time Inventory Updates
  const { socket } = useSocket() || {};
  
  useEffect(() => {
    if (!socket) return;

    socket.on('inventory_updated', (data) => {
       // Only update if it affects the currently viewed station
       if (selectedStation && data.stationId === selectedStation.id) {
          setInventory(prev => {
             const updated = [...prev];
             const index = updated.findIndex(item => item.id === data.inventoryId || (item.gasType === data.gasType && item.cylinderSize === data.cylinderSize));
             
             if (index !== -1) {
                updated[index] = { ...updated[index], price: data.price, quantity: data.quantity };
                // If this is the currently selected cylinder, update the order form price too
                if (orderForm.cylinderSize === data.cylinderSize && orderForm.gasType === data.gasType) {
                   const deliveryFee = calculateDeliveryFee();
                   updateOrderForm({
                      gasPrice: data.price,
                      totalAmount: data.price + deliveryFee
                   });
                   toast.success(`Price updated to ₦${data.price}`);
                }
             }
             return updated;
          });
       }
       // Also update the master stations list background logic if needed, but local inventory state is priority
    });

    return () => {
       socket.off('inventory_updated');
    };
  }, [socket, selectedStation, orderForm.cylinderSize, orderForm.gasType]);
  
  // Initial fetch
  useEffect(() => {
     fetchStations();
  }, []);


  useEffect(() => {
    // FIXED: Check if user is logged in before fetching
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStations();
  }, [user, navigate]);

  // Find nearest station based on delivery address coordinates
  const findNearestStation = async (lat, lng) => {
    try {
      setIsFindingStation(true);
      const response = await api.get('/stations/find-nearest', {
        params: { latitude: lat, longitude: lng }
      });
      
      if (response.data?.station) {
        setNearestStation(response.data.station);
        setSelectedStation(response.data.station);
        setInventory(response.data.station.inventory || []);
        toast.success(`Auto-selected nearest station: ${response.data.station.name}`);
      }
    } catch (error) {
      console.error('Failed to find nearest station:', error);
      // Fallback: select first station
      if (stations.length > 0) {
        setSelectedStation(stations[0]);
        setInventory(stations[0].inventory || []);
      }
    } finally {
      setIsFindingStation(false);
    }
  };

  // Geocode address to coordinates (mock implementation - replace with real geocoding service)
  const geocodeAddress = async (address) => {
    // In a real app, you would use a geocoding service like Google Maps, Mapbox, etc.
    // For now, we'll use mock coordinates (Lagos)
    return {
      latitude: 6.5244 + (Math.random() - 0.5) * 0.1,
      longitude: 3.3792 + (Math.random() - 0.5) * 0.1
    };
  };

  // Handle address change
  const handleAddressChange = (address) => {
    updateOrderForm({ deliveryAddress: address });
  };

  // Get available cylinder sizes for selected gas type
  const getAvailableSizes = () => {
    // Return hardcoded available sizes
    if (!orderForm.gasType) return [];
    return AVAILABLE_SIZES;
  };

  // Handle cylinder size selection with dynamic pricing
  const handleCylinderSizeChange = (size) => {
    // Try to find price from current station's inventory
    const inventoryItem = inventory.find(item => item.cylinderSize === size && item.gasType === orderForm.gasType);
    
    // Fallback to hardcoded if not found (though backend validation will likely fail if not in inventory)
    const gasPrice = inventoryItem ? inventoryItem.price : (CYLINDER_PRICES[size] || 0);

    const deliveryFee = calculateDeliveryFee();
    updateOrderForm({
      cylinderSize: size,
      gasPrice,
      deliveryFee,
      totalAmount: gasPrice + deliveryFee
    });
  };

  // Calculate delivery fee based on distance (simplified)
  const calculateDeliveryFee = () => {
    const baseFee = 1500;
    return baseFee;
  };

  // Handle station selection
  const handleStationChange = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(station);
      setInventory(station.inventory || []);
      
      // Reset cylinder selection if not available in new station
      if (orderForm.cylinderSize) {
        const availableSizes = getAvailableSizes();
        if (!availableSizes.includes(orderForm.cylinderSize)) {
          updateOrderForm({
            cylinderSize: '',
            gasPrice: 0,
            totalAmount: 0
          });
        }
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!orderForm.gasType) errors.gasType = 'Please select gas type';
    if (!orderForm.cylinderSize) errors.cylinderSize = 'Please select or enter cylinder size';
    if (!orderForm.orderType) errors.orderType = 'Please select order type (Refill/New Cylinder)';
    if (!orderForm.deliveryMethod) errors.deliveryMethod = 'Please select delivery method';
    if (!orderForm.deliveryAddress?.trim()) errors.deliveryAddress = 'Please enter delivery address';
    if (!selectedStation) errors.station = 'Please select a station';
    
    // Auto-set payment method to card if missing (since we enforce it)
    if (!orderForm.paymentMethod) {
       updateOrderForm({ paymentMethod: 'card' });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFlutterwavePayment = useFlutterwave({
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
    tx_ref: Date.now(),
    amount: orderForm.totalAmount || 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email,
      phone_number: user?.phone,
      name: user?.fullName,
    },
    customizations: {
      title: 'CityGrid Gas Purchase',
      description: 'Payment for Gas Delivery',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  });

  // Place order
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);

    // Force Flutterwave payment for all orders (Anti-theft measure)
    try {
      handleFlutterwavePayment({
        callback: async (response) => {
          console.log('Flutterwave Response:', response);
          closePaymentModal();
          
          if (response.status === 'successful' || response.status === 'completed') {
             // Proceed to create order on backend with payment details
             await createBackendOrder(response.transaction_id);
          } else {
             console.error('Payment response validation failed:', response);
             toast.error(`Payment not verified: ${response.status}`);
             setIsLoading(false);
          }
        },
        onClose: () => {
           toast('Payment cancelled');
           setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Payment init error:', error);
      toast.error('Failed to initialize payment');
      setIsLoading(false);
    }
  };

  const createBackendOrder = async (transactionId) => {
    try {
      const orderData = {
        gasType: orderForm.gasType,
        cylinderSize: orderForm.cylinderSize,
        deliveryAddress: orderForm.deliveryAddress,
        deliveryLatitude: orderForm.deliveryLatitude || 6.5244,
        deliveryLongitude: orderForm.deliveryLongitude || 3.3792,
        stationId: selectedStation.id,
        orderType: orderForm.orderType,
        paymentMethod: orderForm.paymentMethod,
        gasPrice: orderForm.gasPrice,
        deliveryFee: orderForm.deliveryFee,
        transactionId: transactionId // Pass FLW Transaction ID if available
      };

      const response = await api.post('/orders', orderData);
      
      // Order created successfully (implies payment valid if card was used)
      clearOrderForm();
      // Navigate to success page
      toast.dismiss(); 
      const createdOrderData = response.data.data?.order || response.data.data || response.data.order;
      
      navigate('/order-success', { 
         state: { 
           order: createdOrderData 
         } 
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      console.log('Backend Error Details:', error.response?.data); // Added debug log
      const errorMessage = error.response?.data?.message || 'Failed to create order. Please try again.';
      toast.error(errorMessage);
      navigate('/order-failure', { 
        state: { error: errorMessage } 
      });
    } finally {
      setIsLoading(false);
      closePaymentModal();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const availableSizes = getAvailableSizes();

  // FIXED: Show loading state while fetching stations
  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gas Delivery</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.fullName || 'User'}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              My Orders
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Place Your Order</h2>

                {/* Gas Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gas Type
                  </label>
                  <select
                    value={orderForm.gasType}
                    onChange={(e) => {
                      updateOrderForm({ 
                        gasType: e.target.value,
                        cylinderSize: '',
                        gasPrice: 0,
                        totalAmount: 0
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Gas Type</option>
                    <option value="LPG">LPG (Liquefied Petroleum Gas)</option>
                    <option value="Natural Gas">Natural Gas</option>
                  </select>
                  {formErrors.gasType && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.gasType}</p>
                  )}
                </div>

                {/* Cylinder Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cylinder Size (kg)
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {AVAILABLE_SIZES.map((size) => {
                      const inventoryItem = inventory.find(i => i.cylinderSize === size && i.gasType === orderForm.gasType);
                      const displayPrice = inventoryItem ? inventoryItem.price : (CYLINDER_PRICES[size] || 0);
                      const isAvailable = !!inventoryItem;

                      return (
                      <button
                        key={size}
                        onClick={() => {
                          handleCylinderSizeChange(size);
                          updateOrderForm({ isCustomSize: false });
                        }}
                        className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                          orderForm.cylinderSize === size && !orderForm.isCustomSize
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300'
                        } ${!isAvailable ? 'opacity-50' : ''}`}
                      >
                        {size}
                        <div className="text-xs font-normal mt-1">
                          ₦{displayPrice.toLocaleString()}
                        </div>
                      </button>
                    )})}
                  </div>
                  
                  {/* Custom Size Option */}
                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <label className="flex items-center mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderForm.isCustomSize}
                        onChange={(e) => {
                          updateOrderForm({ isCustomSize: e.target.checked });
                          if (e.target.checked) {
                            updateOrderForm({ cylinderSize: '' });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Custom Size</span>
                    </label>
                    
                    {orderForm.isCustomSize && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Enter size in kg"
                          value={orderForm.customSize}
                          onChange={(e) => {
                            const size = e.target.value;
                            updateOrderForm({ customSize: size });
                            if (size) {
                              const pricePerKg = 3500 / 3; // ₦1,166.67 per kg based on 3kg = ₦3,500
                              const price = Math.round(parseInt(size) * pricePerKg);
                              updateOrderForm({
                                cylinderSize: `${size}kg`,
                                gasPrice: price,
                                deliveryFee: calculateDeliveryFee(),
                                totalAmount: price + calculateDeliveryFee()
                              });
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          min="1"
                        />
                        <span className="py-2 px-3 bg-gray-50 rounded-lg text-sm font-medium">
                          ₦{orderForm.gasPrice ? orderForm.gasPrice.toLocaleString() : '0'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {formErrors.cylinderSize && (
                    <p className="text-red-500 text-sm mt-2">{formErrors.cylinderSize}</p>
                  )}
                </div>

                {/* Delivery Method */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Delivery Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateOrderForm({ deliveryMethod: 'home_refill' })}
                      className={`p-4 border-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        orderForm.deliveryMethod === 'home_refill'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <Home size={20} />
                      Home Refill
                    </button>
                    <button
                      onClick={() => updateOrderForm({ deliveryMethod: 'pickup' })}
                      className={`p-4 border-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        orderForm.deliveryMethod === 'pickup'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <Truck size={20} />
                      Pickup
                    </button>
                  </div>
                  {formErrors.deliveryMethod && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.deliveryMethod}</p>
                  )}
                </div>

                {/* Order Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateOrderForm({ orderType: 'refill' })}
                      className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                        orderForm.orderType === 'refill'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      Refill Only
                    </button>
                    <button
                      onClick={() => updateOrderForm({ orderType: 'new_cylinder' })}
                      className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                        orderForm.orderType === 'new_cylinder'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      New Cylinder
                    </button>
                  </div>
                  {formErrors.orderType && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.orderType}</p>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Delivery Address
                    {isFindingStation && (
                      <span className="ml-2 text-blue-500 text-sm">
                        <Loader2 className="inline animate-spin" size={14} />
                        Finding nearest station...
                      </span>
                    )}
                  </label>
                  <textarea
                    value={orderForm.deliveryAddress}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="Enter your full delivery address for automatic station selection..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  {formErrors.deliveryAddress && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.deliveryAddress}</p>
                  )}
                </div>

                {/* Station Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline mr-2" size={16} />
                    Serving Station
                  </label>
                  <select
                    value={selectedStation?.id || ''}
                    onChange={(e) => handleStationChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a station</option>
                    {stations && stations.length > 0 && stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name} - {station.address}
                      </option>
                    ))}
                  </select>
                  {selectedStation && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>{selectedStation.name}</strong><br />
                        {selectedStation.address}<br />
                        Phone: {selectedStation.phone}
                      </p>
                    </div>
                  )}
                  {formErrors.station && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.station}</p>
                  )}
                </div>

                {/* Payment Method - Enforced Online Payment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 flex justify-between items-center cursor-not-allowed">
                    <span>Online Payment (Flutterwave)</span>
                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">SECURE</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * All orders must be paid online to ensure secure delivery.
                  </p>
                </div>

                {formErrors.inventory && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{formErrors.inventory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gradient-to-br from-primary bg-green-700 rounded-xl shadow-lg p-6 text-white sticky top-4">
                <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-green-400">
                    <span className="text-green-100">Gas Type:</span>
                    <span className="font-semibold">{orderForm.gasType || 'Not selected'}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-green-400">
                    <span className="text-green-100">Cylinder Size:</span>
                    <span className="font-semibold">{orderForm.cylinderSize || 'Not selected'}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-green-400">
                    <span className="text-green-100">Order Type:</span>
                    <span className="font-semibold capitalize">
                      {orderForm.orderType ? orderForm.orderType.replace('_', ' ') : 'Not selected'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-green-400">
                    <span className="text-green-100">Delivery Method:</span>
                    <span className="font-semibold capitalize">
                      {orderForm.deliveryMethod ? orderForm.deliveryMethod.replace('_', ' ') : 'Not selected'}
                    </span>
                  </div>

                  {selectedStation && (
                    <div className="flex justify-between items-center pb-3 border-b border-green-400">
                      <span className="text-green-100">Station:</span>
                      <span className="font-semibold text-sm text-right">
                        {selectedStation.name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-3 border-b border-green-400">
                    <span className="text-green-100">Gas Price:</span>
                    <span className="font-semibold">
                      ₦{orderForm.gasPrice ? orderForm.gasPrice.toLocaleString() : '0'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-green-400">
                    <span className="text-green-100">Delivery Fee:</span>
                    <span className="font-semibold">
                      ₦{orderForm.deliveryFee ? orderForm.deliveryFee.toLocaleString() : '0'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xl pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">
                      ₦{orderForm.totalAmount ? orderForm.totalAmount.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !orderForm.deliveryAddress || !selectedStation}
                  className="w-full bg-white text-green-600 py-4 rounded-lg font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={24} />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2" size={24} />
                      Pay & Place Order
                    </>
                  )}
                </button>

                <p className="text-center text-green-100 text-sm mt-4">
                  ⚡ Fast delivery in 30-60 minutes
                </p>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}