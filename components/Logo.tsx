import React from 'react';

const Logo = () => (
  <div className="flex items-center relative">
    <span className="text-xl font-bold">Privacy Pools V1</span>
    <span className="absolute text-red-500 text-xs" style={{ top: 0, right: '-30px' }}>beta</span>
  </div>
);

export default Logo;
