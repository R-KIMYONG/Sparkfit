import supabase from '@/supabase/supabaseClient';
import { useUserStore } from '@/zustand/auth.store';
import { usePlacesCount } from '@/zustand/placescount.store';
import { useCallback, useEffect, useState } from 'react';
import { RiArrowGoBackLine, RiCloseFill, RiInformationFill, RiSearchLine } from 'react-icons/ri';
import Modal from 'react-modal';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from './../assets/logo.png';
import { getSidebarMenus, getBottomMenus, getMobileMenus } from './sidebarMenus';

export default function Sidebar() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('홈');
  const signOut = useUserStore((state) => state.signOut);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const currentDate = new Date().toISOString().split('T')[0];
  const {
    placesCount,
    startFetching,
    stopFetching,
    hasNewContracts,
    hasNewPlaces,
    resetContractsNotification,
    resetPlacesNotification
  } = usePlacesCount((state) => state);
  const [userId, setUserId] = useState(null);
  // console.log(hasNewContracts);
  // console.log(hasNewPlaces);
  useEffect(() => {
    const authToken = localStorage.getItem('sb-muzurefacnghaayepwdd-auth-token');
    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        const userId = parsedToken?.user?.id;
        setUserId(userId);
      } catch (error) {
        console.error('토큰 파싱 실패:', error);
      }
    } else {
      console.log('토큰을 찾지 못했습니다.');
    }
    if (userId) {
      startFetching(userId);
    }
    return () => {
      stopFetching();
    };
  }, [startFetching, stopFetching, userId]);

  const openModal = () => {
    setActiveItem('검색');
    setIsModalOpen(true);
    setSearchKeyword('');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'visible';
    setSearchResults([]);
  };

  const searchPlace = useCallback(
    async (e) => {
      e.preventDefault();
      if (!searchKeyword.trim()) {
        Swal.fire({
          title: '검색 실패',
          text: '검색어를 입력하세요',
          icon: 'warning',
          confirmButtonText: '확인',
          cancelButtonText: '취소'
        });
        setSearchResults([]);
        return;
      }
      Swal.fire({
        title: '검색 중입니다...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const { data, error } = await supabase
          .from('Places')
          .select()
          .or(
            `region.ilike.%${searchKeyword}%,sports_name.ilike.%${searchKeyword}%,gather_name.ilike.%${searchKeyword}%`
          )
          .gt('deadline', currentDate)
          .order('deadline', { ascending: true });
        if (error) {
          console.log('error =>', error);
          Swal.fire({
            title: '검색 실패!',
            text: `에러: ${error.message}`,
            icon: 'error'
          });
          return;
        }
        setSearchResults([...data]);
        Swal.close();
      } catch (error) {
        console.log('서버 통신 error => ', error);
        Swal.fire({
          title: '서버 통신 오류!',
          text: `에러: ${error.message}`,
          icon: 'error'
        });
        Swal.close();
      }
    },
    [searchKeyword]
  );
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
  const sidebarMenus = getSidebarMenus({ openModal, navigate, placesCount, hasNewPlaces, resetPlacesNotification });
  const bottomMenus = getBottomMenus({
    navigate,
    handleSignOut,
    hasNewContracts
  });
  const mobileMenus = getMobileMenus({
    navigate,
    openModal,
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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="번개 검색 모달"
        className="modal inset-0 items-center z-50 "
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <div className="bg-white p-6 rounded-lg sm:w-2/3 absolute min-[320px]:translate-x-[-50%] min-[320px]:translate-y-[-50%] min-[320px]:top-[50%] min-[320px]:left-[50%] min-[320px]:w-[90%]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-2xl font-bold text-xl flex items-center gap-3">
              <RiSearchLine /> SparkFit 검색{' '}
            </h2>

            <button onClick={closeModal} className="w-logowidth h-logoheight">
              <RiCloseFill className="w-full h-full hover:rotate-90 transition-transform" />
            </button>
          </div>
          <form onSubmit={searchPlace}>
            <div className="flex gap-4 justify-between">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="지역 또는 스포츠명을 입력하세요"
                className="px-3 py-2 border rounded sm:w-5/6 box-border w-full"
                maxLength={20}
              />
              <button
                type="submit"
                className="bg-customLoginButton text-white py-1 min-[320px]:w-1/6 min-[320px]:text-xs min-[320px] rounded box-border font-bold text-sm"
              >
                검색
              </button>
            </div>
            <span className="text-xs text-gray-500">
              결과 : {searchResults.length > 99 ? '99+' : searchResults.length}
            </span>
          </form>
          <div className="h-[25rem] overflow-y-scroll text-xs scrollbar-hide">
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {searchResults.map((item) => (
                  <li key={item.id} className="px-2 py-4 box-border shadow-xl rounded-md">
                    <p className=" font-bold sm:text-sm ">{item.gather_name}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-2 mt-2 flex-wrap">
                        <p className="text-gray-700 sm:text-sm">
                          {item.texts.length > 20 ? `${item.texts.slice(0, 20)}...` : item.texts}
                        </p>
                        <p className="text-gray-500 sm:text-md">모집기한: {item.deadline}</p>
                        <p className="text-gray-500 sm:text-md">생성일 : {item.created_at.slice(0, 10)}</p>
                        <div className="text-gray-500">
                          <span>{item.region}</span> | <span>{item.sports_name}</span> |{' '}
                          <span>모집인원 : {item.max_participants}</span>
                        </div>
                      </div>

                      <button
                        className="bg-customLoginButton text-white px-2 py-1 rounded box-border"
                        onClick={() => {
                          navigate(`/detail/${item.id}`);
                          closeModal();
                        }}
                      >
                        상세보기
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 mt-2 sm:text-md text-xl min-[320px]:text-xs">
                검색 결과가 없습니다.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
