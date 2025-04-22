import React from 'react';
import { RiInformationFill } from 'react-icons/ri';

const SidebarMenuList = ({ menus, activeItem, setActiveItem, variant = 'pc' }) => {
  return (
    <ul
      className={`w-full flex ${
        variant === 'mobile' ? 'justify-around items-center h-16' : 'flex-col justify-start items-center gap-16'
      } text-xs`}
    >
      {menus.map(({ icon: Icon, text, onClick, hasAlarm }, index) => (
        <li
          key={index}
          onClick={() => {
            setActiveItem(text);
            onClick();
          }}
          className={`cursor-pointer relative text-center flex flex-col items-center ${
            activeItem === text ? 'text-[#82C0F9]' : ''
          }`}
        >
          <Icon className="w-[15px] h-[15px] mt-1" />
          <p className="mt-1">{text}</p>
          {hasAlarm && (
            <RiInformationFill
              className={`absolute text-red-500 ${
                variant === 'mobile' ? 'top-[-5px] right-[0px]' : 'top-[-25px] right-[-5px]'
              } w-[15px] h-[15px]`}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default SidebarMenuList;
