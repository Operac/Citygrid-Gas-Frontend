import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        try {
          // Set authorization header for future API calls
          if (typeof api !== 'undefined') {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          console.error('Login storage error:', error);
        }
      },

      logout: () => {
        try {
          // Remove authorization header
          if (typeof api !== 'undefined') {
            delete api.defaults.headers.common['Authorization'];
          }
          
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage');
          set({ user: null, token: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout storage error:', error);
        }
      },

      setUser: (user) => {
        try {
          localStorage.setItem('user', JSON.stringify(user));
          set({ user });
        } catch (error) {
          console.error('Set user storage error:', error);
        }
      },

      // Initialize auth state from storage (useful after page refresh)
      initializeAuth: () => {
        try {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            const user = JSON.parse(userStr);
            
            // Set authorization header
            if (typeof api !== 'undefined') {
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            
            set({ user, token, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Auth initialization error:', error);
          get().logout(); // Clear invalid storage
          return false;
        }
      },

      // Check if user has specific role
      hasRole: (role) => {
        const { user } = get();
        return user?.role?.toUpperCase() === role.toUpperCase();
      },

      // Check if user has any of the specified roles
      hasAnyRole: (roles) => {
        const { user } = get();
        if (!user?.role) return false;
        
        return roles.map(r => r.toUpperCase()).includes(user.role.toUpperCase());
      },

      // Get user ID safely
      getUserId: () => {
        const { user } = get();
        return user?.id;
      },

      // Update user profile
      updateProfile: (updates) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          get().setUser(updatedUser);
        }
      }
    }),
    {
      name: 'auth-storage',
      // Optional: Only persist specific fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);