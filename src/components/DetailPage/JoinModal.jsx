import { useRef, useState } from 'react';
import AlertModal from './AlertModal';
import useOutsideClick from './useOutsideClick';

const JoinModal = ({ close, joinMutation }) => {
  const modalRef = useRef(null);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleClose = () => {
    if (!isProcessing) close?.();
  };

  useOutsideClick(modalRef, handleClose);

  const joinGroup = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    joinMutation.mutate({
      onSuccess: () => {
        close();
      },
      onSettled: () => {
        setTimeout(() => setIsProcessing(false), 500);
      }
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-10 z-50">
      <div
        className="h-auto rounded-lg min-[320px]:w-[80%] md:w-[50%] sm:w-[60%] bg-white absolute top-[10%] left-1/2 transform -translate-x-1/2 - translate-y-1/2"
        ref={modalRef}
      >
        <div className="py-5">
          <div className="m-2 flex justify-center items-center flex-col">
            <p className="p-5 bg-[#EBF7FF] rounded-full text-2xl mb-5">🎉</p>
            <h3 className="flex text-2xl mb-2">모임 가입</h3>
            <h1 className="flex">신청 완료</h1>
          </div>

          <div className="flex justify-center items-center my-3">
            <button
              className="hover:bg-[#6FA3D4] transition-all duration-300 ease-in-out text-base px-10 py-2 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer "
              type="button"
              onClick={joinGroup}
            >
              신청
            </button>

            <button
              className="hover:bg-[#ddd] transition-all duration-300 ease-in-out text-base px-10 py-2 border-none bg-[#efefef] rounded-md text-[#2e2e2e] m-1.5 font-semibold cursor-pointer "
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
