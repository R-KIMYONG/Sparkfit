import React from 'react';

const NewBadge = ({ className = '' }) => {
  return (
    <span className={`bg-red-500 text-white text-[10px] px-2 py-[1px] rounded-full shadow-sm ${className}`}>
      New
    </span>
  );
};

export default NewBadge;
