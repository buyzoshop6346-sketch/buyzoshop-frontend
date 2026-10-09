'use client';

import React from 'react';
import Image from 'next/image';

const Banner = () => {
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto">
        <div className="relative h-[220px] overflow-hidden rounded-xs shadow-2xl sm:h-[350px] lg:h-[500px]">
          <Image
            src="/images/banner.webp"
            alt="Banner"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;
