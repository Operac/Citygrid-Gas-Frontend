import { X, User, CheckCircle, MapPin, Star, Truck } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AssignRiderModal({ riders, onAssign, onClose }) {
  const [selectedRiderId, setSelectedRiderId] = useState(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Reset selection when riders list changes
  useEffect(() => {
    setSelectedRiderId(null)
  }, [riders])

  const handleAssign = async () => {
    if (!selectedRiderId) {
      return
    }
    setIsAssigning(true)
    try {
      await onAssign(selectedRiderId)
    } finally {
      setIsAssigning(false)
    }
  }

  // Filter riders based on search term
  const filteredRiders = riders.filter(rider => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      rider.user?.fullName?.toLowerCase().includes(searchLower) ||
      rider.user?.phone?.includes(searchTerm) ||
      rider.vehicleNumber?.toLowerCase().includes(searchLower) ||
      rider.station?.name?.toLowerCase().includes(searchLower)
    )
  })

  const getSelectedRider = () => {
    return riders.find(rider => rider.id === selectedRiderId)
  }

  const selectedRider = getSelectedRider()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assign Rider to Order</h2>
            <p className="text-gray-600 text-sm mt-1">
              Select an available rider to assign to this order
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Riders
              </label>
              <input
                type="text"
                placeholder="Search by name, phone, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                {filteredRiders.length} rider{filteredRiders.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredRiders.length === 0 ? (
            <div className="text-center py-12">
              <User size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                {searchTerm ? 'No riders match your search' : 'No available riders'}
              </p>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all available riders.'
                  : 'All riders are currently busy, offline, or assigned to other orders.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 grid md:grid-cols-2 gap-4">
              {filteredRiders.map((rider) => (
                <button
                  key={rider.id}
                  onClick={() => setSelectedRiderId(rider.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                    selectedRiderId === rider.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedRiderId === rider.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <User size={24} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {rider.user?.fullName || 'Unknown Rider'}
                          </p>
                          {rider.isOnline && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Online
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={14} />
                            <span>{rider.user?.phone || 'N/A'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Truck size={14} />
                            <span>{rider.vehicleType} • {rider.vehicleNumber}</span>
                          </div>
                          
                          {rider.station?.name && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin size={14} />
                              <span className="truncate">{rider.station.name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {rider.rating && (
                              <div className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-500 fill-current" />
                                <span>{rider.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {rider.totalDeliveries !== undefined && (
                              <span>{rider.totalDeliveries} deliveries</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedRiderId === rider.id && (
                      <CheckCircle className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Rider Summary & Actions */}
        {selectedRider && (
          <div className="border-t bg-blue-50 border-blue-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Selected Rider</p>
                  <p className="text-sm text-gray-600">
                    {selectedRider.user?.fullName} • {selectedRider.vehicleNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {selectedRider.station?.name || 'No station assigned'}
                  </p>
                  {selectedRider.rating && (
                    <p className="text-sm text-gray-600 flex items-center justify-end gap-1">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      {selectedRider.rating.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedRider 
              ? `Ready to assign ${selectedRider.user?.fullName} to this order`
              : 'Select a rider to assign'
            }
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              disabled={isAssigning}
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedRiderId || isAssigning || riders.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAssigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Rider'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}