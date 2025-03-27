import React from 'react';
import { BiError } from 'react-icons/bi';
import { Link } from 'react-router-dom';
const Error = ({ message = '오류가 발생했습니다. 다시 시도해주세요!' }) => {
  return (
    <div className="bg-[#FFE5E5] w-[100%] h-[100dvh] absolute top-0 left-0 flex flex-col items-center justify-center text-[#D9534F]">
      <BiError size={50} />
      <div className="flex flex-col gap-3 items-center">
        <p className="mt-5 text-sm font-bold">{message}</p>
        <Link
          to={'/main'}
          className="text-xs px-3 py-1.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-blue-400 transition-all"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
};

export default Error;
