import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  currentOrder: null,
  orderForm: {
    gasType: 'LPG',
    cylinderSize: '12.5kg',
    isCustomSize: false,
    customSize: '',
    orderType: 'refill',
    deliveryMethod: 'home_refill',
    quantity: 1,
    deliveryAddress: '',
    deliveryLatitude: null,
    deliveryLongitude: null,
    scheduledTime: null,
    gasPrice: 0,
    deliveryFee: 0,
    totalAmount: 0,
    paymentMethod: 'cod'
  },

  updateOrderForm: (data) =>
    set((state) => ({
      orderForm: { ...state.orderForm, ...data }
    })),

  setCurrentOrder: (order) => set({ currentOrder: order }),

  clearOrderForm: () =>
    set({
      orderForm: {
        gasType: 'LPG',
        cylinderSize: '12.5kg',
        isCustomSize: false,
        customSize: '',
        orderType: 'refill',
        deliveryMethod: 'home_refill',
        quantity: 1,
        deliveryAddress: '',
        deliveryLatitude: null,
        deliveryLongitude: null,
        scheduledTime: null,
        gasPrice: 0,
        deliveryFee: 0,
        totalAmount: 0,
        paymentMethod: 'cod'
      }
    })
}));