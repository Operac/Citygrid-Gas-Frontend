
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'RIDER') return '/rider';
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'STATION_MANAGER') return '/manager';
    return '/home';
  };

  return (
    <div className="bg-white font-display text-[#111418] min-h-screen flex flex-col overflow-x-hidden pb-24">
      {/* Navbar */}
      <div className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-md px-4 py-3 justify-between border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 relative">
            <img 
              alt="CityGrid Energy Logo" 
              className="w-full h-full object-contain" 
              src="/citygrid_logo.png" 
            />
          </div>
          <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-tight">
            CityGrid Energy
          </h2>
        </div>
        <div className="flex w-auto items-center justify-end">
          <Link to={getDashboardLink()}>
            <button className="text-[#617589] text-sm font-bold leading-normal tracking-wide shrink-0 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
              {isAuthenticated ? 'Go to Dashboard' : 'Log In'}
            </button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="@container">
        <div className="flex flex-col gap-6 px-4 py-8 @[480px]:gap-8 @[864px]:flex-row">
          <div 
            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-2xl shadow-md @[480px]:h-auto @[480px]:min-w-[400px] @[864px]:w-full relative overflow-hidden group animate-slide-up" 
            style={{ backgroundImage: 'url("/hero-truck.png")' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:bg-black/20 transition-all duration-500"></div>
          </div>
          <div className="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center animate-slide-up animate-delay-100">
            <div className="flex flex-col gap-3 text-left">
              <h1 className="text-[#111418] text-4xl font-black leading-[1.1] tracking-[-0.033em] @[480px]:text-5xl">
                Cooking Gas Delivery,<br/> <span className="text-primary">Built for Convenience.</span>
              </h1>
              <h2 className="text-[#617589] text-base font-normal leading-relaxed">
                Don't let empty gas spoil your cooking. We bring reliable LPG cylinders to your doorstep anywhere in the city.
              </h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#617589] font-medium">
              <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md text-green-700">
                <span className="material-symbols-outlined text-[18px]">door_front</span>
                <span>Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span>Standard Weight</span>
              </div>
            </div>
            <Link to={isAuthenticated ? "/home" : "/register"} className="w-full">
              <button className="relative overflow-hidden group flex w-full cursor-pointer items-center justify-center rounded-xl h-14 px-5 bg-primary hover:bg-primary-dark transition-all duration-300 text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30 transform active:scale-[0.98]">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <span className="flex items-center gap-2 relative z-10">
                  {isAuthenticated ? 'Order Gas Now' : 'Order Gas Now'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="flex flex-col bg-white py-8">
        <h2 className="text-[#111418] tracking-tight text-[26px] font-bold leading-tight px-4 pb-8 pt-2 text-center">Simple Steps to Refill</h2>
        <div className="grid grid-cols-[50px_1fr] gap-x-4 px-6 max-w-lg mx-auto w-full">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 pt-1 relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary z-10 transition-transform hover:scale-110 duration-300 ring-4 ring-white">
              <span className="material-symbols-outlined text-2xl">propane_tank</span>
            </div>
            <div className="w-[2px] bg-gradient-to-b from-primary/50 to-gray-200 h-full grow -mt-2 -mb-2 absolute top-12 bottom-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <div className="flex flex-1 flex-col pb-10 pt-2 animate-slide-up animate-delay-100">
            <p className="text-[#111418] text-lg font-bold leading-normal">Choose Your Size</p>
            <p className="text-[#617589] text-sm font-normal leading-normal mt-1">Select from 3kg, 5kg, 12.5kg, 25kg, or 50kg cylinders.</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary z-10 transition-transform hover:scale-110 duration-300 ring-4 ring-white">
              <span className="material-symbols-outlined text-2xl">edit_location</span>
            </div>
            <div className="w-[2px] bg-gradient-to-b from-gray-200 to-gray-200 h-full grow -mt-2 -mb-2 absolute top-12 bottom-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <div className="flex flex-1 flex-col pb-10 pt-2 animate-slide-up animate-delay-200">
            <p className="text-[#111418] text-lg font-bold leading-normal">Enter Address</p>
            <p className="text-[#617589] text-sm font-normal leading-normal mt-1">Enter your full delivery address and nearest landmark.</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white z-10 shadow-lg shadow-primary/30 animate-pulse-slow">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col pt-2 animate-slide-up animate-delay-300">
            <p className="text-[#111418] text-lg font-bold leading-normal">We Deliver</p>
            <p className="text-[#617589] text-sm font-normal leading-normal mt-1">Relax while our driver brings your gas to you.</p>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="px-4 py-10 bg-gray-50 mt-4">
        <h2 className="text-[#111418] tracking-tight text-[24px] font-bold leading-tight pb-6">Why Nigerians Trust Us</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="group flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="text-primary bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
            </div>
            <div>
              <h3 className="font-bold text-[#111418] text-sm">24/7 Support</h3>
              <p className="text-xs text-[#617589] mt-1">Always available.</p>
            </div>
          </div>
          <div className="group flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="text-primary bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-bold text-[#111418] text-sm">Secure Pay</h3>
              <p className="text-xs text-[#617589] mt-1">Bank transfer & cards.</p>
            </div>
          </div>
          <div className="group flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="text-primary bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div>
              <h3 className="font-bold text-[#111418] text-sm">On Time</h3>
              <p className="text-xs text-[#617589] mt-1">No "African time".</p>
            </div>
          </div>
          <div className="group flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="text-primary bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined text-[24px]">scale</span>
            </div>
            <div>
              <h3 className="font-bold text-[#111418] text-sm">Full Gauge</h3>
              <p className="text-xs text-[#617589] mt-1">Guaranteed weight.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-10 bg-white">
        <div className="flex justify-between items-end px-4 pb-6">
          <h2 className="text-[#111418] tracking-tight text-[24px] font-bold leading-tight">Happy Customers</h2>
          <div className="flex gap-1 items-center bg-yellow-50 px-2 py-1 rounded-lg">
            <span className="material-symbols-outlined text-yellow-500 text-sm filled">star</span>
            <span className="text-xs font-bold ml-1 text-yellow-700">4.9/5</span>
          </div>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-4 px-4 pb-4 snap-x snap-mandatory">
          <div className="snap-center flex-none w-[290px] rounded-2xl bg-gray-50 p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-4xl">format_quote</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="h-12 w-12 rounded-full bg-cover bg-center border-2 border-white shadow-sm" 
                style={{ backgroundImage: 'url("/chioma-testimonial.jpg")' }}
              ></div>
              <div>
                <p className="text-sm font-bold text-[#111418]">Chioma Okeke</p>
                <p className="text-xs text-[#617589]">Lekki, Lagos</p>
              </div>
            </div>
            <p className="text-sm text-[#111418] leading-relaxed italic">"Saved me during Sunday rice cooking! The driver arrived in 20 minutes. Absolutely lifesaver service."</p>
          </div>
          {/* Add more testimonials if needed, kept concise for now */}
        </div>
      </div>
      
      {/* Footer / CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-8 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex flex-col flex-1">
            <span className="text-xs text-gray-500 font-medium animate-pulse">Running low?</span>
            <span className="text-sm font-bold text-[#111418]">Order gas now</span>
          </div>
          <Link to={isAuthenticated ? "/home" : "/register"}>
            <button className="flex-none bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">fire</span>
              Get Gas
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
