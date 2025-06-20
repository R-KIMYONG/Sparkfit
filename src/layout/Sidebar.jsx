import { useUserStore } from '@/zustand/auth.store';
import { fetchContractAlerts, usePlacesCount } from '@/zustand/placescount.store';
import { useEffect, useState } from 'react';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from './../assets/logo.png';
import { getSidebarMenus, getBottomMenus, getMobileMenus } from './sidebarMenus';
import useUserId from '@/hooks/useUserId';
import { useSearchStore } from '@/zustand/searchModal.store';
import SidebarMenuList from './SidebarMenuList';
import supabase from '@/supabase/supabaseClient';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('홈');
  const signOut = useUserStore((state) => state.signOut);
  const { openModal } = useSearchStore();
  const userId = useUserId();

  const {
    startFetching,
    stopFetching,
    hasNewPlaces,
    resetContractsNotification,
    creatorContractAlerts,
    userContractAlerts
  } = usePlacesCount();

  const hasSidebarAlert =
    creatorContractAlerts.some((alert) => alert.placeCreatorId === userId && alert.targetUserId !== userId) ||
    userContractAlerts.some((alert) => alert.userId === userId && ['approved', 'rejected'].includes(alert.type));
  useEffect(() => {
    if (userId) startFetching(userId);
    return () => stopFetching();
  }, [userId]);

  useEffect(() => {
    const channel = supabase
      .channel('viewed-contracts-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Viewed_contracts'
        },
        async (payload) => {
          const { user_id, target_user_id } = payload.new || payload.old || {};
          if (user_id === userId || target_user_id === userId) {
            // 본인이 알림 대상이면 상태 업데이트
            await fetchContractAlerts(userId, usePlacesCount.setState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
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
    hasNewPlaces
  });
  const bottomMenus = getBottomMenus({
    navigate,
    handleSignOut,
    hasSidebarAlert
  });
  const mobileMenus = getMobileMenus({
    navigate,
    openModal,
    location,
    handleSignOut,
    hasNewPlaces,
    hasSidebarAlert,
    resetContractsNotification
  });
  return (
    <>
      {/* PC 사이드바 */}
      <div className="bg-white shadow-sidebarshaow fixed top-0 left-0 h-lvh w-16 justify-center items-center sm:flex hidden text-sm z-10">
        <div className="h-calc-full-minus-110 w-11 mx-auto flex flex-col justify-between gap-14">
          {/* 로고 */}
          <h1 className="w-logowidth h-logoheight mx-auto">
            <Link className="block size-full" to="/main">
              <img className="size-full block" src={logo} alt="logo" />
            </Link>
          </h1>

          <div className="flex-1 flex flex-col justify-between">
            {/* 사이드 메뉴 (PC) */}
            <SidebarMenuList
              menus={sidebarMenus}
              activeItem={activeItem}
              setActiveItem={(text) => {
                setActiveItem(text);
                sidebarMenus.find((item) => item.text === text)?.onClick();
                if (text === '모임') stopFetching();
              }}
              variant="pc"
            />

            {/* 하단 메뉴 (PC) */}
            <SidebarMenuList
              menus={bottomMenus}
              activeItem={activeItem}
              setActiveItem={(text) => {
                setActiveItem(text);
                bottomMenus.find((item) => item.text === text)?.onClick();
                if (text === '내 계정') {
                  resetContractsNotification();
                  stopFetching();
                }
              }}
              variant="pc"
            />
          </div>
        </div>
      </div>

      {/* 모바일 하단 메뉴 */}
      <nav>
        <div className="bg-white shadow-bottomsidebarshaow fixed bottom-0 left-0 w-full h-16 flex justify-around items-center sm:hidden text-sm z-10">
          <SidebarMenuList
            menus={mobileMenus}
            activeItem={activeItem}
            setActiveItem={(text) => {
              setActiveItem(text);
              mobileMenus.find((item) => item.text === text)?.onClick();
              if (text === '모임' || text === '내 계정') stopFetching();
            }}
            variant="mobile"
          />
        </div>
      </nav>

      {/* 모바일 뒤로가기 버튼 */}
      <div className="sm:hidden fixed bottom-20 right-5 cursor-pointer p-2 bg-slate-300 rounded-full flex justify-center items-center z-10">
        <RiArrowGoBackLine className="w-4 h-4" onClick={() => navigate(-1)} />
      </div>
    </>
  );
}
