import React, { useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { RiCloseFill } from 'react-icons/ri';
import Modal from 'react-modal';
Modal.setAppElement('#root');
const GuideModal = ({ isOpen, onClose, onSkipOptionChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const slides = [
    {
      title: '모임 생성',
      image: '/guide/slide1.png',
      description: [
        '1) 첫 페이지 지도화면에서 원하는 장소를 클릭한 후',
        '2) "모임 생성" 버튼을 눌러 모임 정보를 입력하세요.'
      ]
    },
    {
      title: '모임 참가',
      image: '/guide/slide2.png',
      description: [
        '1) PC: 사이드바의 모임 아이콘 클릭 → 모임 리스트 진입',
        '2) 모바일: 하단 메뉴바 모임 아이콘 클릭 → 모임 리스트 진입',
        '3) 지도 마커 클릭 → 해당 모임 상세로 진입',
        '4) 검색 아이콘 클릭 → 키워드 검색 후 참여'
      ]
    },
    {
      title: '내 계정',
      image: '/guide/slide3.png',
      description: ['1) 사이드바/메뉴바의 내 계정 아이콘 클릭', '2) 내가 만든 모임, 참여 중인 모임 확인 가능']
    },
    {
      title: '모임 설명',
      image: '/guide/slide4.png',
      description: [
        '모임은 누구나 생성할 수 있습니다.',
        '하지만 승인 필요한 모임의 경우,',
        '모임장의 승인을 받아야 참여가 확정됩니다.'
      ]
    }
  ];

  const isFirst = currentSlide === 0;
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (!isLast) setCurrentSlide((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentSlide((prev) => prev - 1);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="사용자 가이드"
        className="bg-white px-5 py-4 rounded-lg w-[85%] max-w-lg h-[500px] max-h-[70vh] overflow-y-auto shadow-lg outline-none flex flex-col justify-between"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
      >
        <div className="relative w-full overflow-hidden">
          <ul
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${(100 / slides.length) * currentSlide}%)`
            }}
          >
            {slides.map(({ title, image, description }, index) => {
              return (
                <li
                  key={index}
                  className="w-full shrink-0 items-start px-4 flex flex-col h-full justify-between"
                  style={{ width: `${100 / slides.length}%` }}
                >
                  <h2 className="text-xl font-bold">{title}</h2>
                  {image && (
                    <img
                      src={image}
                      alt={title}
                      onClick={() => setZoomImage(image)}
                      className="w-full max-h-50 object-contain rounded cursor-pointer"
                    />
                  )}
                  <div>
                    {description.map((des, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-relaxed">
                        {des}
                      </p>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-[0.6rem]">
            <button onClick={() => onSkipOptionChange('1day')} className="text-gray-700 hover:text-blue-500 underline">
              오늘 하루 보지 않기
            </button>
            <button onClick={() => onSkipOptionChange('7days')} className="text-gray-700 hover:text-blue-500 underline">
              7일 동안 보지 않기
            </button>
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <button onClick={handlePrev} className="px-3 py-1 bg-gray-300 rounded">
                <IoChevronBack />
              </button>
            )}
            {!isLast ? (
              <button onClick={handleNext} className="px-3 py-1 bg-blue-500 text-white rounded">
                다음
              </button>
            ) : (
              <button onClick={onClose} className="px-3 py-1 bg-green-500 text-white rounded">
                닫기
              </button>
            )}
          </div>
        </div>
      </Modal>
      {zoomImage && (
        <Modal
          isOpen={true}
          onRequestClose={() => setZoomImage(null)}
          contentLabel="이미지 확대"
          className="bg-white p-3 rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden outline-none shadow-2xl"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
        >
          <div className="relative w-full h-full flex justify-center items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-1 right-1 text-gray-700 hover:text-black font-bold bg-gray-500 rounded-full"
            >
              <RiCloseFill size={50} className="w-full h-full hover:rotate-90 transition-transform text-white" />
            </button>
            <img
              src={zoomImage}
              alt="확대 보기"
              className="max-w-[80vw] max-h-[80vh] object-contain rounded-md shadow"
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default GuideModal;
