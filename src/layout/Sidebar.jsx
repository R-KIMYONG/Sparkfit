import supabase from '@/supabase/supabaseClient';
import { useUserStore } from '@/zustand/auth.store';
import { usePlacesCount } from '@/zustand/placescount.store';
import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowGoBackLine,
  RiCloseFill,
  RiGroupLine,
  RiHome2Line,
  RiInformationFill,
  RiLogoutBoxRLine,
  RiSearchLine,
  RiUser3Line
} from 'react-icons/ri';
import Modal from 'react-modal';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from './../assets/logo.png';

export default function Sidebar() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');
  const signOut = useUserStore((state) => state.signOut);
  const checkSignIn = useUserStore((state) => state.checkSignIn);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const currentDate = new Date().toISOString().split('T')[0];
  const userData = useUserStore((state) => state.userData);
  const { placesCount, startFetching, stopFetching, getPreviousCount, previousCount, updateApplicant } = usePlacesCount(
    (state) => state
  );

  useEffect(() => {
    if (userData) {
      getPreviousCount(userData.user.id);
      startFetching(userData.user.id);
    }
  }, [checkSignIn, getPreviousCount, startFetching, userData]);

  const handleUpdateAlarm = async () => {
    try {
      if (userData) {
        await updateApplicant(userData.user.id, placesCount);
        getPreviousCount(userData.user.id);
      }
      navigate('/gathering');
    } catch (error) {
      console.error('Error', error);
    }
  };

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
          .or(`region.ilike.%${searchKeyword}%,sports_name.ilike.%${searchKeyword}%`)
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
        confirmButtonText: '확인'
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
  return (
    <>
      <div className="bg-white shadow-sidebarshaow fixed top-0 left-0 h-lvh w-20 justify-center items-center h-screen sm:flex hidden text-sm z-10">
        <div className="h-calc-full-minus-110 w-11 mx-auto flex flex-col justify-between">
          <div className="h-80 flex flex-col justify-between items-center">
            <h1 className="w-logowidth h-logoheight">
              <Link className="block size-full" to="/">
                <img className="size-full block" src={logo} alt="logo" />
              </Link>
            </h1>

            <ul className="h-60 flex flex-col justify-around items-center text-xs">
              <SidebarItem icon={RiSearchLine} text="검색" onClick={openModal} />
              <SidebarItem
                icon={RiGroupLine}
                text="모임"
                placesCount={placesCount}
                previousCount={previousCount}
                onClick={handleUpdateAlarm}
              />
              <SidebarItem
                icon={RiArrowGoBackLine}
                text="뒤로가기"
                onClick={() => {
                  navigate(-1);
                }}
              />
            </ul>
          </div>

          <div className="h-36">
            <ul className="text-xs h-full flex flex-col justify-around items-center">
              <SidebarItem
                icon={RiUser3Line}
                text="내 계정"
                onClick={() => {
                  navigate('/mypage');
                }}
              />
              <SidebarItem icon={RiLogoutBoxRLine} text="로그아웃" onClick={handleSignOut} />
            </ul>
          </div>
        </div>
      </div>

      <ul className="bg-white shadow-bottomsidebarshaow fixed bottom-0 left-0 w-full h-16 flex justify-around items-center sm:hidden text-sm z-10">
        <SidebarItem
          icon={RiHome2Line}
          text="홈"
          isActive={activeItem === '홈'}
          onClick={() => {
            setActiveItem('홈');
            navigate('/');
          }}
        />
        <SidebarItem
          icon={RiGroupLine}
          text="모임"
          placesCount={placesCount}
          previousCount={previousCount}
          isActive={activeItem === '모임'}
          onClick={() => {
            setActiveItem('모임');
            navigate('/gathering');
          }}
        />
        <SidebarItem icon={RiSearchLine} text="검색" isActive={activeItem === '검색'} onClick={openModal} />
        <SidebarItem
          icon={RiUser3Line}
          text="내 계정"
          isActive={activeItem === '내 계정'}
          onClick={() => {
            setActiveItem('내 계정');
            navigate('/mypage');
          }}
        />
        <SidebarItem
          icon={RiLogoutBoxRLine}
          text="로그아웃"
          isActive={activeItem === '로그아웃'}
          onClick={handleSignOut}
        />
      </ul>
      <div className="sm:hidden fixed bottom-20 right-5  cursor-pointer p-4 bg-slate-300 rounded-full flex justify-center items-center z-10">
        <RiArrowGoBackLine
          className="w-5 h-5"
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
        className="modal inset-0 w-full h-full items-center z-50 "
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 absolute z-40"
        shouldCloseOnOverlayClick={false}
      >
        <div className="bg-white p-6 rounded-lg sm:w-2/3 absolute min-[320px]:translate-x-[-50%] min-[320px]:translate-y-[-50%] min-[320px]:top-[50%] min-[320px]:left-[50%] min-[320px]:w-[90%]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-2xl font-bold text-xl flex items-center gap-3">
              <RiSearchLine /> Spark Fit 검색{' '}
            </h2>

            <button onClick={closeModal} className="w-logowidth h-logoheight">
              <RiCloseFill className="w-full h-full" />
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
                className="bg-customLoginButton sm:px-5 text-white px-8 py-1 min-[320px]:w-1/6 min-[320px]:text-xs min-[320px]:px-2 rounded box-border font-bold text-lg"
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
                  <li key={item.id} className="py-4 box-border">
                    <p className=" font-bold sm:text-sm ">{item.gather_name}</p>
                    <p className="text-gray-700 sm:text-sm mt-2 mb-2 ">
                      {item.texts.length > 100 ? `${item.texts.slice(0, 100)}...` : item.texts}
                    </p>
                    <p className="text-gray-500 sm:text-md">모집기한: {item.deadline}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-gray-500">
                        <span>{item.region}</span> | <span>{item.sports_name}</span> |{' '}
                        <span>{item.created_at.slice(0, 10)}</span>
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

const SidebarItem = ({ icon: Icon, text, onClick, isActive, placesCount, previousCount }) => (
  <li className="cursor-pointer text-center relative" onClick={onClick}>
    {text === '모임' && placesCount > previousCount && (
      <RiInformationFill className="absolute right-[-5px] top-[-5px] w-[15px] h-[15px] text-red-500" />
    )}
    <Icon className={`mx-auto w-iconwidth transition-all h-iconheight ${isActive ? 'text-customLoginButton' : ''}`} />
    <p className={`mt-1.5 transition-all ${isActive ? 'text-[#82C0F9]' : ''}`}>{text}</p>
  </li>
);
