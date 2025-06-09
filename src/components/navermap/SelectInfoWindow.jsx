import useCreatedPlaceModal from '../../zustand/createdPlaceModal.store';

const CoordInfoWindow = ({ htmlAddresses, infoWindow, marker }) => {
  const { openCreateGroupModal, setCreateGroupModal } = useCreatedPlaceModal();
  const handleCloseButton = () => {
    infoWindow.close();
    marker.setMap(null);
  };

  return (
    <>
      <div className="flex flex-row justify-between">
        <h4>선택된 주소</h4>
      </div>
      <div
        className="w-full pt-2 overflow-hidden whitespace-nowrap text-ellipsis"
        dangerouslySetInnerHTML={{ __html: htmlAddresses.join('<br />') }}
      />
      <div className="flex flex-row gap-2 mt-2">
        <button
          onClick={() => {
            if (!openCreateGroupModal) {
              setCreateGroupModal(true);
            }
          }}
          id="selectCoord"
          className="bg-btn-blue hover:bg-blue-400 text-white font-bold py-0.5 px-2 rounded z-99"
        >
          모임만들기
        </button>
        <button
          id="closeCoord"
          className="bg-red-400 hover:bg-red-500 text-white font-bold py-0.5 px-2 rounded"
          onClick={handleCloseButton}
        >
          닫기
        </button>
      </div>
    </>
  );
};

export default CoordInfoWindow;
