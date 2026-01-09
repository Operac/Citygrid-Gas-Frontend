import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';
import { X, User } from 'lucide-react';

export default function AssignRiderModal({ isOpen, onClose, orderId, onSuccess }) {
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRiders();
      setSelectedRider('');
    }
  }, [isOpen]);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/manager/riders');
      // Filter for available riders ideally, or show all with status
      setRiders(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch riders:', error);
      toast.error('Could not load riders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRider) return toast.error('Please select a rider');

    setSubmitting(true);
    try {
      await axios.patch(`/manager/orders/${orderId}/assign`, {
        riderId: selectedRider
      });
      toast.success('Rider assigned successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign rider');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Assign Rider</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Rider
            </label>
            
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading riders...</div>
            ) : riders.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded-lg">
                No riders found for your station.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {riders.map(rider => (
                  <label 
                    key={rider.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRider === rider.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rider"
                      value={rider.id}
                      checked={selectedRider === rider.id}
                      onChange={(e) => setSelectedRider(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{rider.fullName}</div>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <span>{rider.vehicleType} - {rider.vehicleNumber}</span>
                        <span className={rider.isAvailable ? 'text-green-600' : 'text-red-500'}>
                          ● {rider.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedRider}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Assigning...' : 'Assign Rider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
