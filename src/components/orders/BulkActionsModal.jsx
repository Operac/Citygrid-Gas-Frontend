import { X, Edit, MapPin, User, Package, Ban } from 'lucide-react'
import { useState } from 'react'

export default function BulkActionsModal({ selectedCount, stations, onAction, onClose }) {
  const [selectedAction, setSelectedAction] = useState('')
  const [actionData, setActionData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const actions = [
    {
      id: 'update_status',
      name: 'Update Status',
      icon: Edit,
      description: 'Change status for all selected orders',
      fields: [
        {
          name: 'status',
          type: 'select',
          label: 'New Status',
          options: [
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'PREPARING', label: 'Preparing' },
            { value: 'RIDER_ASSIGNED', label: 'Rider Assigned' },
            { value: 'IN_TRANSIT', label: 'In Transit' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ]
        }
      ]
    },
    {
      id: 'assign_station',
      name: 'Assign Station',
      icon: MapPin,
      description: 'Assign station to all selected orders',
      fields: [
        {
          name: 'stationId',
          type: 'select',
          label: 'Station',
          options: stations.map(station => ({
            value: station.id,
            label: station.name
          }))
        }
      ]
    },
    {
      id: 'cancel_orders',
      name: 'Cancel Orders',
      icon: Ban,
      description: 'Cancel all selected orders',
      fields: []
    }
  ]

  const handleSubmit = async () => {
    if (!selectedAction) return

    setIsLoading(true)
    try {
      await onAction(selectedAction, actionData)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedActionConfig = actions.find(action => action.id === selectedAction)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Actions</h2>
            <p className="text-gray-600 text-sm mt-1">
              Apply actions to {selectedCount} selected orders
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Action Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Action</h3>
            <div className="grid gap-3">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAction === action.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedAction === action.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <action.icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{action.name}</p>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Configuration */}
          {selectedActionConfig && selectedActionConfig.fields.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Details</h3>
              <div className="space-y-4">
                {selectedActionConfig.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={actionData[field.name] || ''}
                        onChange={(e) => setActionData(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={actionData[field.name] || ''}
                        onChange={(e) => setActionData(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={`Enter ${field.label}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation for destructive actions */}
          {selectedAction === 'cancel_orders' && (
            <div className="border-t pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Confirm Cancellation</h4>
                <p className="text-red-700 text-sm">
                  You are about to cancel {selectedCount} order{selectedCount !== 1 ? 's' : ''}. 
                  This action cannot be undone. Customers will be notified of the cancellation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedAction 
              ? `Ready to ${selectedActionConfig?.name.toLowerCase()} for ${selectedCount} orders`
              : 'Select an action to continue'
            }
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAction || isLoading || (selectedActionConfig?.fields.length > 0 && !actionData[selectedActionConfig.fields[0].name])}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                `Apply to ${selectedCount} Orders`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}