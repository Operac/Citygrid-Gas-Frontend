import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Search, UserCheck, UserX, Eye, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import StationSelectionModal from '../../components/admin/StationSelectionModal';
import { Plus } from 'lucide-react';


export default function RidersManagement() {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  const fetchRiders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/admin/riders?${params.toString()}`);
      // Response structure: { success, message, data: { riders, pagination } }
      setRiders(response.data.data?.riders || []);
    } catch {
      toast.error('Failed to load riders');
      setRiders([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const [stations, setStations] = useState([]);
  const [selectedRiderForStation, setSelectedRiderForStation] = useState(null);

  // Fetch stations for the assignment modal
  useEffect(() => {
    api.get('/admin/stations')
      .then(res => setStations(res.data.data?.stations || []))
      .catch(err => console.error('Failed to load stations:', err));
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [filters, fetchRiders]);

  const toggleRiderStatus = async (riderId, currentStatus) => {
    const newStatus = !currentStatus;
    
    try {
    await api.patch(`/admin/riders/${riderId}/status`, {
        isActive: newStatus
      });
      toast.success(`Rider ${newStatus ? 'activated' : 'suspended'}`);
      fetchRiders();
    } catch {
      toast.error('Failed to update rider status');
    }
  };

  const handleAssignStation = async (stationId) => {
    if (!selectedRiderForStation) return;

    try {
      await api.patch(`/admin/riders/${selectedRiderForStation.id}/station`, {
        stationId
      });
      toast.success('Station assigned successfully');
      setSelectedRiderForStation(null);
      fetchRiders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign station');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <Link
      to="/admin/riders"
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
    >
      <ArrowLeft size={20} />
      Back to Riders
    </Link>
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Riders Management</h1>
      <button
        onClick={() => navigate('/admin/riders/add')}
        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
      >
        <Plus size={20} />
        Add Rider
      </button>
    </div>
  </div>
</header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline mr-2" size={16} />
                Search Riders
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Riders</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Riders Grid */}
          {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading riders...</p>
          </div>
        ) : riders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏍️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No riders found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riders.map((rider) => (
              <div key={rider.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-softGray rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {rider.user?.fullName?.charAt(0) || 'R'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {rider.user.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">{rider.user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rider.isOnline && (
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      rider.user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {rider.user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Station:</span>
                    <span className="font-semibold text-gray-900">
                      {rider.station?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold text-gray-900">
                      {rider.vehicleType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      ⭐ {rider.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Deliveries:</span>
                    <span className="font-semibold text-gray-900">
                      {rider.totalDeliveries}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/admin/riders/${rider.id}`)}
                    className="flex items-center justify-center gap-2 btn-primary text-sm font-semibold"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => toggleRiderStatus(rider.id, rider.user.isActive)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                      rider.user.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {rider.user.isActive ? (
                      <>
                        <UserX size={16} />
                        Suspend
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedRiderForStation(rider)}
                    className="col-span-2 mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  >
                    <MapPin size={16} />
                    {rider.station ? 'Change Station' : 'Assign Station'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedRiderForStation && (
        <StationSelectionModal
          stations={stations}
          currentStationId={selectedRiderForStation.station?.id}
          onAssign={handleAssignStation}
          onClose={() => setSelectedRiderForStation(null)}
        />
      )}
    </div>
  );
}