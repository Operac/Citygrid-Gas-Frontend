import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function AddInventoryModal({ isOpen, onClose, stationId, onSuccess }) {
  const [formData, setFormData] = useState({
    gasType: 'LPG',
    cylinderSize: '6kg',
    quantity: '',
    price: '',
    lowStockThreshold: '5'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/inventory', {
        ...formData,
        stationId,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        lowStockThreshold: parseInt(formData.lowStockThreshold)
      });
      toast.success('Inventory item added successfully');
      setFormData({
        gasType: 'LPG',
        cylinderSize: '6kg',
        quantity: '',
        price: '',
        lowStockThreshold: '5'
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold mb-6">Add Inventory Item</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gas Type</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.gasType}
                onChange={e => setFormData({ ...formData, gasType: e.target.value })}
              >
                <option value="LPG">LPG</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder Size</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.cylinderSize}
                onChange={e => setFormData({ ...formData, cylinderSize: e.target.value })}
              >
                <option value="3kg">3kg</option>
                <option value="5kg">5kg</option>
                <option value="6kg">6kg</option>
                <option value="10kg">10kg</option>
                <option value="12.5kg">12.5kg</option>
                <option value="25kg">25kg</option>
                <option value="50kg">50kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold</label>
            <input
              type="number"
              required
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.lowStockThreshold}
              onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Alert when quantity falls below this number</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
