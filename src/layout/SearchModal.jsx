import { useSearchStore } from '@/zustand/searchModal.store';
import React, { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from 'react-modal';
import { RiCloseFill, RiSearchLine } from 'react-icons/ri';
import supabase from '@/supabase/supabaseClient';
import Swal from 'sweetalert2';
import NavermapScriptComponent from '@/pages/MainPage/NavermapScriptComponent';
import GatheringList from '@/pages/GatheringPage/GatheringList';
import MyPage from '@/components/myPage/MyPage';
import DetailedPost from '@/pages/DetailPage/DetailedPost';

const SearchModal = () => {
  const { closeModal, setSearchKeyword, searchResults, setSearchResults } = useSearchStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const backgroundLocation = location.state?.backgroundLocation;
  const isDirect = !backgroundLocation;
  const isModalOpen = location.pathname.endsWith('/searchmodal');
  const currentDate = new Date().toISOString().split('T')[0];
  const path = location.pathname;
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordInUrl = searchParams.get('keyword') || '';

  const handleClose = () => {
    closeModal();
    const currentPath = location.pathname;
    const basePath = currentPath.replace('/searchmodal', '') || '/';
    navigate(basePath, { replace: true });
  };
  const renderFallback = () => {
    if (path.includes('/main')) return <NavermapScriptComponent />;
    if (path.includes('/gathering')) return <GatheringList />;
    if (path.includes('/mypage')) return <MyPage />;
    if (path.includes('/detail')) return <DetailedPost />;
    return null;
  };
  const searchPlace = useCallback(
    async (eOrNothing) => {
      if (eOrNothing?.preventDefault) {
        eOrNothing.preventDefault();
      }

      const keyword = searchInputRef.current?.value?.trim() || '';
      if (!keyword) {
        Swal.fire({
          title: '검색 실패',
          text: '검색어를 입력하세요',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        setSearchResults([]);
        return;
      }
      setSearchKeyword(keyword);
      setSearchParams({ keyword }, { replace: true });
      Swal.fire({ title: '검색 중입니다...', didOpen: () => Swal.showLoading() });

      try {
        const { data, error } = await supabase
          .from('Places')
          .select()
          .or(`region.ilike.%${keyword}%,sports_name.ilike.%${keyword}%,gather_name.ilike.%${keyword}%`)
          .gt('deadline', currentDate)
          .order('deadline', { ascending: true });

        if (error) throw error;

        setSearchResults(data);
        Swal.close();
      } catch (error) {
        Swal.fire({
          title: '검색 실패',
          text: error.message,
          icon: 'error'
        });
      }
    },
    [currentDate, setSearchKeyword, setSearchParams, setSearchResults]
  );

  useEffect(() => {
    if (!isModalOpen || !keywordInUrl) return;

    const timeout = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.value = keywordInUrl;
        setSearchKeyword(keywordInUrl);
        searchPlace();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isModalOpen, keywordInUrl]);

  return (
    <>
      {isDirect && renderFallback()}
      <Modal
        isOpen={isModalOpen}
        contentLabel="번개 검색 모달"
        className="modal inset-0 items-center z-50 "
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <div className="bg-white p-6 rounded-lg sm:w-2/3 absolute min-[320px]:translate-x-[-50%] min-[320px]:translate-y-[-50%] min-[320px]:top-[50%] min-[320px]:left-[50%] min-[320px]:w-[90%]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-2xl font-bold text-xl flex items-center gap-3">
              <RiSearchLine /> SparkFit 검색{' '}
            </h2>

            <button onClick={handleClose} className="w-logowidth h-logoheight">
              <RiCloseFill className="w-full h-full hover:rotate-90 transition-transform" />
            </button>
          </div>
          <form onSubmit={searchPlace} className="space-y-2">
            <div className="flex gap-2 sm:gap-4">
              <input
                type="text"
                ref={searchInputRef}
                placeholder="지역 또는 스포츠명을 입력하세요"
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-customLoginButton shadow-sm transition-all"
                maxLength={30}
                autoFocus
              />
              <button
                type="submit"
                className="bg-customLoginButton text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all shadow-sm"
              >
                검색
              </button>
            </div>
            <span className="text-xs text-gray-500 block text-right">
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
};

export default SearchModal;
