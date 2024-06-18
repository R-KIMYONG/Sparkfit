import { useRef, useState } from 'react';
import useOutsideClick from './useOutsideClick';
import AlertModal from './AlertModal';

const JoinModal = ({ close }) => {
  // const [name, setName] = useState('');
  const modalRef = useRef(null);
  const [openAlertModal, setOpenAlertModal] = useState(false);

  const handleClose = () => {
    close?.();
  };

  useOutsideClick(modalRef, handleClose);

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-10 z-50">
      <div
        className="h-auto rounded-lg w-[700px] bg-white absolute top-[20%] left-1/2 transform -translate-x-1/2 - translate-y-1/2"
        ref={modalRef}
      >
        <div className="py-10">
          <div className="m-2 flex justify-center items-center flex-col">
            <h3 className="flex text-2xl mb-2">모임 가입</h3>
            <h1 className="flex">버튼 클릭시 즉시 신청됩니다</h1>
          </div>

          <div className="flex justify-center items-center my-3">
            <button
              className=" text-base px-5 py-2.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer "
              type="button"
              onClick={() => {
                setOpenAlertModal(true);
              }}
            >
              신청
            </button>

            <button
              className=" text-base px-5 py-2.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer "
              type="button"
              onClick={close}
            >
              닫기
            </button>
            {openAlertModal && <AlertModal close={close} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;
