'use client';

import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import Link from 'next/link';
import SearchBar from './SearchBar';
import { useCartStore } from '@/store/cart.store';
import { getUser } from '@/utils/auth';
import UserDropdown from './UserDropdown';
import RightDesktopNev from './RightDesktopNev';
import MobileSidebar from './MobileSidebar';
import { IUser } from '@/types/auth';
import { FaShoppingCart } from 'react-icons/fa';

const PublicNavbar = ({ className }: { className?: string }) => {
  const [scrolled, setScrolled] = useState(false);

  // Get cart items from Zustand
  const cartItems = useCartStore(state => state.items);

  // Total quantity
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const currentUser = getUser();

    if (currentUser) {
      queueMicrotask(() => setUser(currentUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className={cn('border-b bg-white sticky top-0 z-50 w-full', className)}
    >
      {/* Promo Banner */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          scrolled ? 'max-h-0 opacity-0' : 'max-h-[100px] opacity-100'
        }`}
      >
        {/* <PromoBanner1 /> */}
      </div>

      <div className="container mx-auto px-3 sm:px-4">
        {/* Top Navbar */}
        <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          {/* LEFT */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
              {/* mobile navbar  open + onOpenChange make this a controlled Sheet */}
              <MobileSidebar user={user}></MobileSidebar>

              {/* Mobile Logo */}
              <Link href="/" className="flex md:hidden shrink-0 items-center">
                <div className="flex items-center gap-2">
                  {/* Brand Icon */}
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                    <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />

                    <FaShoppingCart className="text-[25px] text-[#0F1F5A]" />
                  </div>

                  {/* Brand Text */}
                  <div className="flex flex-col">
                    <div className="flex items-center whitespace-nowrap leading-none">
                      <span className="text-[19px] font-extrabold tracking-[-1px] text-[#0F1F5A]">
                        SHOP
                      </span>

                      <span className="ml-1 text-[19px] font-extrabold tracking-[-1px] text-[#FF6B35]">
                        DEAL
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <span className="h-px w-4 bg-[#0F1F5A]/25" />

                      <span className="text-[7px] font-bold uppercase tracking-[3px] text-[#0F1F5A]/65">
                        MART
                      </span>

                      <span className="h-px w-4 bg-[#0F1F5A]/25" />
                    </div>
                  </div>
                </div>
              </Link>
              {/* Desktop Logo */}
              <Link
                href="/"
                className="hidden md:flex items-center shrink-0 group"
              >
                <div className="flex items-center gap-3.5">
                  {/* Brand Icon */}
                  <div
                    className="
        relative flex h-12 w-12 items-center justify-center
        rounded-[14px]
        
       
       
        
      "
                  >
                    {/* Orange Accent */}
                    <span
                      className="
          absolute right-1.5 top-1.5
          h-2 w-2 rounded-full
          bg-[#FF6B35]
          
        "
                    />

                    <FaShoppingCart
                      className="
          h-[40px] w-[40px]
          text-[#0F1F5A]
        "
                    />
                  </div>

                  {/* Brand Typography */}
                  <div className="flex flex-col -ml-3 mt-1">
                    {/* Main Brand */}
                    <div className="flex items-center leading-[0.9]">
                      <span
                        className="
            text-[20px] font-[800]
            tracking-[-0.065em]
            text-[#0F1F5A]
          "
                      >
                        SHOP
                      </span>

                      <span
                        className="
            ml-[5px]
            text-[20px] font-[800]
            tracking-[-0.065em]
            text-[#FF6B35]
          "
                      >
                        DEAL
                      </span>
                    </div>

                    {/* MART */}
                    <div className=" flex items-center gap-2">
                      <span className="h-px w-6 bg-[#0F1F5A]/25" />

                      <span
                        className="
            text-[8px] font-extrabold
            uppercase
            tracking-[0.48em]
            text-[#0F1F5A]/65
          "
                      >
                        MART
                      </span>

                      <span className="h-px w-6 bg-[#0F1F5A]/25" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Mobile: profile + cart (right side) */}
            <div className="flex items-center gap-3 md:hidden">
              {user && <UserDropdown user={user} />}
              <div className="relative">
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-4 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {cartCount}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Center: Search bar */}
          <SearchBar />

          {/* RIGHT DESKTOP */}
          <RightDesktopNev></RightDesktopNev>
        </div>

        {/* DESKTOP NAV */}
        {/* <DesktopNav /> */}

        {/* MOBILE SCROLL LINKS */}
        {/* <div className="flex lg:hidden gap-4 py-2 text-xs text-gray-600 overflow-x-auto whitespace-nowrap border-t scrollbar-hide">
          <a className="hover:text-orange-500">Order protections</a>
          <a className="hover:text-orange-500">Tax exemption</a>
          <a className="hover:text-orange-500">Buyer Central</a>
        </div> */}
      </div>
    </section>
  );
};

export { PublicNavbar };
