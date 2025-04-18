import { useRef } from 'react';
import useOutsideClick from './useOutsideClick';

const AlertModal = ({ close }) => {
  const modalRef = useRef(null);

  const handleClose = () => {
    close?.();
  };

  useOutsideClick(modalRef, handleClose);

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-10 z-50">
      <div
        className="h-auto rounded-lg w-[700px] bg-white absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        ref={modalRef}
      >
        <div className="py-10">
          <div className="m-2 flex justify-center items-center flex-col">
            <h3 className="flex text-2xl mb-2">완료되었습니다</h3>
          </div>

          <div className="flex justify-center items-center my-3">
            <button
              className=" text-base px-5 py-2.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer "
              type="button"
              onClick={close}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
