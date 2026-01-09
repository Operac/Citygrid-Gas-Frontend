import { X, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function StationSelectionModal({ stations = [], currentStationId, onAssign, onClose }) {
  const [selectedStationId, setSelectedStationId] = useState(currentStationId || null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter stations based on search term
  const filteredStations = stations.filter(station => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      station.name?.toLowerCase().includes(searchLower) ||
      station.address?.toLowerCase().includes(searchLower)
    )
  })

  const handleAssign = async () => {
    if (!selectedStationId) return
    
    setIsAssigning(true)
    try {
      await onAssign(selectedStationId)
    } finally {
      setIsAssigning(false)
    }
  }

  const selectedStation = stations.find(s => s.id === selectedStationId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Station</h2>
            <p className="text-gray-600 text-sm mt-1">
              Select a station for this rider
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b">
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredStations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No stations found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                    selectedStationId === station.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    selectedStationId === station.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <MapPin size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{station.name}</div>
                    <div className="text-sm text-gray-500">{station.address}</div>
                  </div>
                  {currentStationId === station.id && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            disabled={isAssigning}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedStationId || isAssigning || selectedStationId === currentStationId}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}
