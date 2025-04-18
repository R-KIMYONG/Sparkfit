import { useUserStore } from '@/zustand/auth.store';
import { usePlacesCount } from '@/zustand/placescount.store';
import { useEffect, useState } from 'react';
import { RiArrowGoBackLine, RiInformationFill } from 'react-icons/ri';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from './../assets/logo.png';
import { getSidebarMenus, getBottomMenus, getMobileMenus } from './sidebarMenus';
import useUserId from '@/hooks/useUserId';
import { useSearchStore } from '@/zustand/searchModal.store';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('홈');
  const signOut = useUserStore((state) => state.signOut);
  const { openModal } = useSearchStore();
  const {
    placesCount,
    startFetching,
    stopFetching,
    hasNewContracts,
    hasNewPlaces,
    resetContractsNotification,
    resetPlacesNotification
  } = usePlacesCount((state) => state);

  const userId = useUserId();
  useEffect(() => {
    if (userId) {
      startFetching(userId);
    }
    return () => {
      stopFetching();
    };
  }, [startFetching, stopFetching, userId]);

  const handleSignOut = async () => {
    try {
      const result = await Swal.fire({
        title: '로그아웃 하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '확인',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        await signOut();
        Swal.fire({
          title: '로그아웃 완료!',
          icon: 'success'
        });
        stopFetching();
        setTimeout(() => {
          navigate('/');
        }, 0);
      }
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);
      Swal.fire({
        title: '에러!',
        text: '로그아웃 중 문제가 발생했습니다.',
        icon: 'error'
      });
    }
  };
  const sidebarMenus = getSidebarMenus({
    openModal,
    navigate,
    location,
    placesCount,
    hasNewPlaces,
    resetPlacesNotification
  });
  const bottomMenus = getBottomMenus({
    navigate,
    handleSignOut,
    hasNewContracts
  });
  const mobileMenus = getMobileMenus({
    navigate,
    openModal,
    location,
    handleSignOut,
    placesCount,
    hasNewPlaces,
    hasNewContracts,
    resetPlacesNotification,
    resetContractsNotification
  });
  return (
    <>
      <div className="bg-white shadow-sidebarshaow fixed top-0 left-0 h-lvh w-16 justify-center items-center sm:flex hidden text-sm z-10">
        <div className="h-calc-full-minus-110 w-11 mx-auto flex flex-col justify-between">
          {/* PC 사이드바 메뉴 */}
          <div className="h-80 flex flex-col justify-between items-center">
            <h1 className="w-logowidth h-logoheight">
              <Link className="block size-full" to="/">
                <img className="size-full block" src={logo} alt="logo" />
              </Link>
            </h1>
            <nav className="sidebar">
              <ul className="w-full flex flex-col justify-start items-center text-xs gap-16">
                {sidebarMenus.map(({ icon: Icon, text, onClick, hasAlarm }, index) => {
                  return (
                    <li
                      key={index}
                      onClick={() => {
                        setActiveItem(text);
                        onClick();
                        if (text === '모임') {
                          stopFetching();
                        }
                      }}
                      className="cursor-pointer text-center relative"
                    >
                      <Icon className="absolute right-1/2 -top-1/2 w-[15px] h-[15px] translate-x-1/2 -translate-y-1/2" />
                      <p className="mt-1">{text}</p>
                      <p>{hasAlarm}</p>
                      {hasAlarm && (
                        <RiInformationFill className="absolute right-[-5px] top-[-25px] w-[15px] h-[15px] text-red-500" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="bottom-menu">
            <ul className="w-full flex flex-col justify-start items-center text-xs gap-16">
              {bottomMenus.map(({ icon: Icon, text, onClick, hasAlarm }, index) => (
                <li
                  key={index}
                  onClick={() => {
                    onClick();
                    if (text === '내 계정') {
                      resetContractsNotification();
                      stopFetching();
                    }
                  }}
                  className="cursor-pointer text-center relative"
                >
                  <Icon className="absolute right-1/2 -top-1/2 w-[15px] h-[15px] translate-x-1/2 -translate-y-1/2" />
                  <p className="mt-1">{text}</p>
                  {hasAlarm && (
                    <RiInformationFill className="absolute right-[0px] top-[-25px] w-[15px] h-[15px] text-red-500" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Mobile 사이드바 메뉴 */}
      <nav>
        <ul className="bg-white shadow-bottomsidebarshaow fixed bottom-0 left-0 w-full h-16 flex justify-around items-center sm:hidden text-sm z-10">
          {mobileMenus.map(({ icon: Icon, text, onClick, hasAlarm }, index) => (
            <li
              key={index}
              onClick={() => {
                setActiveItem(text);
                onClick();
                switch (text) {
                  case '모임':
                    stopFetching();
                    break;
                  case '내 계정':
                    stopFetching();
                  default:
                    break;
                }
              }}
              className={`mx-auto relative transition-all cursor-pointer text-center flex flex-col items-center hover:text-[#82C0F9] ${
                activeItem === text ? 'text-[#82C0F9]' : ''
              }`}
            >
              <Icon />
              <p className="text-xs mt-1">{text}</p>
              {hasAlarm && (
                <RiInformationFill className="absolute right-[0px] top-[-5px] w-[15px] h-[15px] text-red-500" />
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sm:hidden fixed bottom-20 right-5  cursor-pointer p-2 bg-slate-300 rounded-full flex justify-center items-center z-10">
        <RiArrowGoBackLine
          className="w-4 h-4"
          text="뒤로가기"
          onClick={() => {
            navigate(-1);
          }}
        />
      </div>
      {/*사이드바 검색 모달 */}
    </>
  );
}
