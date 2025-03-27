import { useEffect, useRef, useState } from 'react';
import useOutsideClick from './useOutsideClick';
import { v4 as uuidv4 } from 'uuid';
import supabase from '@/supabase/supabaseClient';
import { loginUser } from '@/api/profileApi';
import { useQuery } from '@tanstack/react-query';
import useMapStore from '@/zustand/map.store';
import { useShallow } from 'zustand/react/shallow';
import Swal from 'sweetalert2';
import { exercises } from './exercises';
import Select from 'react-select';
import Loading from '../common/Loading';
import Error from '../common/Error';

const CreateGroupModal = ({ close }) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    groupName: '',
    sportsName: '',
    deadline: '',
    contents: '',
    maxParticipants: '',
    address: '',
    isReviewed: false
  });

  const { selectedGeoData } = useMapStore(
    useShallow((state) => ({ selectedGeoData: state.selectedGeoData, setUserGps: state.setUserGps }))
  );

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      address: selectedGeoData?.address?.jibunAddress || ''
    }));
  }, [selectedGeoData]);

  const { data: user, isPending: isUserPending, isError } = useQuery({ queryKey: ['user'], queryFn: loginUser });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const missingFields = [];
    const fieldNames = {
      groupName: '모임명',
      sportsName: '스포츠명',
      deadline: '마감 기한',
      contents: '모집 설명',
      maxParticipants: '모집 인원수',
      address: '주소'
    };

    Object.entries(formData).forEach(([key, value]) => {
      if (!value && key !== 'isReviewed') missingFields.push(fieldNames[key] || key);
    });

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: `${missingFields.join(', ')} 항목을 입력해주세요!`,
        showConfirmButton: false,
        timer: 1000
      });
      return false;
    }
    return true;
  };

  const createGroupForm = async (e) => {
    e.preventDefault();
    const groupId = uuidv4();
    if (!validateForm()) return;
    const { data, error } = await supabase
      .from('Places')
      .insert([
        {
          id: groupId,
          sports_name: formData.sportsName,
          gather_name: formData.groupName,
          deadline: formData.deadline,
          region: formData.address,
          texts: formData.contents,
          created_by: user?.id,
          lat: selectedGeoData.coord.lat,
          long: selectedGeoData.coord.long,
          max_participants: formData.maxParticipants,
          isReviewed: formData.isReviewed
        }
      ])
      .select();

    if (error) {
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: error.message || '오류가 발생했습니다.'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: '모임 생성 완료',
        text: '모임이 성공적으로 생성되었습니다!'
      }).then(handleClose());
    }
  };

  const handleClose = () => close?.();

  useOutsideClick(modalRef, handleClose);

  const todayDate = new Date().toISOString().split('T')[0];
  const inputFields = [
    { name: 'groupName', placeholder: '모임명', type: 'text' },
    { name: 'sportsName', placeholder: '스포츠명', type: 'select', options: exercises },
    { name: 'deadline', placeholder: '마감 기한', type: 'date', min: todayDate },
    { name: 'address', placeholder: '주소', type: 'text' },
    { name: 'contents', placeholder: '모집 설명', type: 'textarea' },
    { name: 'maxParticipants', placeholder: '모집인원수', type: 'number', min: 1 },
    { name: 'isReviewed', placeholder: '가입 심사', type: 'checkbox' }
  ];

  if (isUserPending) {
    return <Loading />;
  }
  if (isError) {
    return <Error />;
  }
  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-30 z-50 flex justify-center items-center">
      <div className="bg-white p-6 w-[24rem] rounded-md" ref={modalRef}>
        <div className="m-2 flex justify-center items-center">
          <h3>모임 만들기</h3>
        </div>
        <form onSubmit={createGroupForm}>
          <div className="my-3 mx-3 flex flex-col gap-2">
            {inputFields.map((field, index) =>
              field.type === 'select' ? (
                <Select
                  options={exercises.map((sport) => ({ label: sport, value: sport }))}
                  placeholder="스포츠명 선택"
                  onChange={(selected) => setFormData((prev) => ({ ...prev, sportsName: selected.value }))}
                  className="text-xs"
                  key={index}
                />
              ) : field.type === 'checkbox' ? (
                <label key={field.name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name]}
                    onChange={handleInputChange}
                    autoComplete="off"
                    key={index}
                  />
                  <span className="text-xs font-semibold">{field.placeholder}</span>
                </label>
              ) : field.name === 'contents' ? (
                <div className="relative w-full h-full">
                  <textarea
                    key={field.name}
                    className="w-full h-full rounded-md font-semibold border p-2 box-border text-xs block"
                    style={{ resize: 'none' }}
                    placeholder={field.placeholder + ' (최대 200자)'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    autoComplete="off"
                    rows={4}
                    maxLength={200}
                  />
                  <span className="text-[8px] text-gray-300 absolute right-3 bottom-2">
                    {formData[field.name].length}/200
                  </span>
                </div>
              ) : (
                <input
                  key={field.name}
                  className="w-full rounded-md font-semibold border p-2 box-border text-xs"
                  type={field.type}
                  placeholder={field.placeholder}
                  name={field.name}
                  value={formData[field.name]}
                  min={field.min}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              )
            )}
          </div>
          <div className="flex justify-center items-center my-3">
            <button
              className="text-xs px-3 py-1.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-blue-400 transition-all"
              type="submit"
            >
              생성
            </button>
            <button
              className="text-xs px-3 py-1.5 border-none bg-btn-red rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-red-400 transition-all"
              type="button"
              onClick={handleClose}
            >
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
