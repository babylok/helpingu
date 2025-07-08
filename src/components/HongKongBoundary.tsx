
import React from 'react';
import { MapIcon } from 'lucide-react';

const HongKongBoundary = () => {
  return (
    <div className="bg-kawaii-blue/10 rounded-[20px] p-5 text-center">
      <div className="flex justify-center items-center gap-2 mb-3">
        <MapIcon className="text-kawaii-blue" size={20} />
        <h3 className="font-kawaii text-lg text-kawaii-blue">香港地區專用</h3>
      </div>
      <p className="text-sm">This service is only available within Hong Kong area</p>
      <div className="mt-4 p-2 rounded-lg bg-white/50 inline-block">
        <svg width="100" height="60" viewBox="0 0 150 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Simplified Hong Kong map shape */}
          <path d="M30,50 C35,40 45,35 55,30 C65,25 80,15 90,20 C100,25 110,30 115,40 C120,50 125,60 120,70 C115,80 100,85 85,80 C70,75 60,70 50,65 C40,60 25,60 30,50 Z" 
            fill="#FFE0EF" 
            stroke="#FF97C1" 
            strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default HongKongBoundary;
