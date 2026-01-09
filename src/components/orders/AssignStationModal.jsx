import { X, MapPin, CheckCircle, Phone, Users, Package, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AssignStationModal({ stations, onAssign, onClose }) {
  const [selectedStationId, setSelectedStationId] = useState(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyActive, setShowOnlyActive] = useState(true)

  // Reset selection when stations list changes
  useEffect(() => {
    setSelectedStationId(null)
  }, [stations])

  const handleAssign = async () => {
    if (!selectedStationId) {
      return
    }
    setIsAssigning(true)
    try {
      await onAssign(selectedStationId)
    } finally {
      setIsAssigning(false)
    }
  }

  // Filter stations based on search term and active status
  const filteredStations = stations.filter(station => {
    // Filter by active status if enabled
    if (showOnlyActive && !station.isActive) return false
    
    // Filter by search term
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      station.name?.toLowerCase().includes(searchLower) ||
      station.address?.toLowerCase().includes(searchLower) ||
      station.phone?.includes(searchTerm)
    )
  })

  const getSelectedStation = () => {
    return stations.find(station => station.id === selectedStationId)
  }

  const selectedStation = getSelectedStation()

  // Get low stock count for a station
  const getLowStockCount = (station) => {
    if (!station.inventory) return 0
    return station.inventory.filter(item => 
      item.quantity <= item.lowStockThreshold
    ).length
  }

  // Check if station has inventory for common gas types
  const hasInventory = (station) => {
    if (!station.inventory || station.inventory.length === 0) return false
    return station.inventory.some(item => item.quantity > 0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assign Station to Order</h2>
            <p className="text-gray-600 text-sm mt-1">
              Select a station to fulfill this order
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
                Search Stations
              </label>
              <input
                type="text"
                placeholder="Search by name, address, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                Show only active stations
              </label>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredStations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                {searchTerm || !showOnlyActive ? 'No stations match your criteria' : 'No stations available'}
              </p>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all stations.'
                  : showOnlyActive
                    ? 'All stations are currently inactive. Try unchecking "Show only active stations".'
                    : 'No stations have been created yet.'
                }
              </p>
              {(searchTerm || showOnlyActive) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setShowOnlyActive(true)
                  }}
                  className="mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 grid md:grid-cols-2 gap-4">
              {filteredStations.map((station) => {
                const lowStockCount = getLowStockCount(station)
                const hasStock = hasInventory(station)
                
                return (
                  <button
                    key={station.id}
                    onClick={() => setSelectedStationId(station.id)}
                    disabled={!station.isActive}
                    className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                      selectedStationId === station.id
                        ? 'border-orange-500 bg-orange-50 shadow-sm'
                        : station.isActive
                          ? 'border-gray-200 hover:border-gray-300 bg-white'
                          : 'border-gray-100 bg-gray-50'
                    } ${!station.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedStationId === station.id 
                            ? 'bg-orange-100 text-orange-600' 
                            : station.isActive
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          <MapPin size={24} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {station.name}
                            </p>
                            {!station.isActive && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                            {station.isActive && !hasStock && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                No Stock
                              </span>
                            )}
                            {lowStockCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {lowStockCount} Low Stock
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin size={14} />
                              <span className="truncate">{station.address}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{station.phone}</span>
                            </div>
                            
                            {/* Station Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                              {station._count?.riders !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Users size={12} />
                                  <span>{station._count.riders} riders</span>
                                </div>
                              )}
                              {station._count?.orders !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Package size={12} />
                                  <span>{station._count.orders} orders</span>
                                </div>
                              )}
                              {station._count?.inventory !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Package size={12} />
                                  <span>{station._count.inventory} items</span>
                                </div>
                              )}
                            </div>

                            {/* Inventory Status */}
                            {station.inventory && station.inventory.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Available Inventory:</p>
                                <div className="flex flex-wrap gap-1">
                                  {station.inventory.slice(0, 3).map((item, index) => (
                                    <span 
                                      key={index}
                                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                        item.quantity > 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {item.gasType} ({item.cylinderSize}): {item.quantity}
                                    </span>
                                  ))}
                                  {station.inventory.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                      +{station.inventory.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {selectedStationId === station.id && (
                        <CheckCircle className="text-orange-500 flex-shrink-0 mt-1" size={20} />
                      )}
                    </div>

                    {/* Warning for stations without inventory */}
                    {station.isActive && !hasStock && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                        <AlertCircle size={14} />
                        <span>This station has no available inventory</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Station Summary & Actions */}
        {selectedStation && (
          <div className="border-t bg-orange-50 border-orange-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Selected Station</p>
                  <p className="text-sm text-gray-600">
                    {selectedStation.name} • {selectedStation.address}
                  </p>
                  {!hasInventory(selectedStation) && (
                    <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      This station has no available inventory
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {selectedStation.phone}
                  </p>
                  {selectedStation._count?.riders !== undefined && (
                    <p className="text-sm text-gray-600">
                      {selectedStation._count.riders} assigned riders
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
            {selectedStation 
              ? `Ready to assign ${selectedStation.name} to this order`
              : 'Select a station to assign'
            }
            {selectedStation && !hasInventory(selectedStation) && (
              <span className="text-orange-600 font-medium ml-2">
                (No inventory available)
              </span>
            )}
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
              disabled={!selectedStationId || isAssigning || stations.length === 0}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAssigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Station'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}