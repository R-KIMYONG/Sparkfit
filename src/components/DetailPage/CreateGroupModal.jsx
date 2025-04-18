import { useCallback, useEffect, useRef, useState } from 'react';
import useOutsideClick from './useOutsideClick';
import { v4 as uuidv4 } from 'uuid';
import supabase from '@/supabase/supabaseClient';
import useMapStore from '@/zustand/map.store';
import { useShallow } from 'zustand/react/shallow';
import Swal from 'sweetalert2';
import { exercises } from './exercises';
import Loading from '../common/Loading';
import Error from '../common/Error';
import CreatableSelect from 'react-select/creatable';
import { handleInputChangeWithLimit } from '@/utils/selectFn/handleInputChangeWithLimit';
import { Switch } from '@headlessui/react';
import { useUserStore } from '@/zustand/auth.store';
const CreateGroupModal = ({ close }) => {
  const [selectedInputValue, setSelectedInputValue] = useState('');
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

  const { userData, loading: isUserPending, error: isError } = useUserStore();

  const userId = userData?.id;
  const handleClose = () => close?.();

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);
  const validateForm = useCallback(() => {
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
  }, [formData]);
  const createGroupForm = useCallback(
    async (e) => {
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
            created_by: userId,
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
    },
    [formData, validateForm, userId, selectedGeoData, handleClose]
  );
  const handleSelectChange = (selected) => {
    if (selected === null) {
      return;
    }
    setFormData((prev) => {
      if (!selected) {
        return { ...prev, sportsName: '' };
      }

      if (prev.sportsName !== selected.value) {
        return { ...prev, sportsName: selected.value };
      }
      return prev;
    });
  };

  const handleSelectSportsInputChange = (value) => {
    const newValue = handleInputChangeWithLimit(value, 10);
    setSelectedInputValue(newValue);
  };

  useOutsideClick(modalRef, handleClose);

  const todayDate = () => new Date().toISOString().split('T')[0];
  const inputFields = [
    { id: 'groupName', name: 'groupName', placeholder: '모임명', type: 'text', maxLength: 20 },
    {
      id: 'sportsName',
      name: 'sportsName',
      placeholder: '스포츠명',
      type: 'select',
      options: exercises.map((sport) => ({ label: sport, value: sport })),
      inputValue: selectedInputValue
    },
    { id: 'deadline', name: 'deadline', placeholder: '마감 기한', type: 'date', min: todayDate },
    { id: 'address', name: 'address', placeholder: '주소', type: 'text' },
    { id: 'contents', name: 'contents', placeholder: '모집 설명', type: 'textarea', maxLength: 200 },
    { id: 'maxParticipants', name: 'maxParticipants', placeholder: '모집인원수', type: 'number', min: 1 },
    { id: 'isReviewed', name: 'isReviewed', placeholder: '가입 심사', type: 'switch' }
  ];

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      address: selectedGeoData?.address?.jibunAddress || ''
    }));
  }, [selectedGeoData]);

  if (isUserPending) {
    return <Loading />;
  }
  if (isError) {
    return <Error />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
      <div className="bg-white p-6 w-[24rem] rounded-md" ref={modalRef}>
        <h3 className="text-center text-lg font-bold mb-4">모임 만들기</h3>
        <form onSubmit={createGroupForm} className="space-y-3">
          {inputFields.map((field) => {
            if (field.type === 'switch') {
              return (
                <div key={field.name} className="flex items-center gap-3 px-1">
                  <Switch
                    checked={formData[field.name]}
                    onChange={(val) =>
                      handleInputChange({
                        target: { name: field.name, type: 'checkbox', checked: val }
                      })
                    }
                    className={`${
                      formData[field.name] ? 'bg-blue-500' : 'bg-gray-300'
                    } relative inline-flex h-5 w-10 items-center rounded-full`}
                  >
                    <span
                      className={`${
                        formData[field.name] ? 'translate-x-5' : 'translate-x-1'
                      } inline-block h-3 w-3 transform bg-white rounded-full transition-transform`}
                    />
                  </Switch>
                  <span className="text-xs font-semibold">{field.placeholder}</span>
                </div>
              );
            }

            if (field.type === 'select') {
              return (
                <>
                  <div key={field.id} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <CreatableSelect
                      key={field.id}
                      options={field.options}
                      placeholder={field.placeholder}
                      onChange={handleSelectChange}
                      isClearable
                      formatCreateLabel={(inputValue) => `"${inputValue}" 생성 (최대 10자)`}
                      inputValue={selectedInputValue}
                      className="text-xs"
                      onInputChange={handleSelectSportsInputChange}
                    />
                  </div>
                </>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={field.name} className="relative">
                  <textarea
                    className="w-full p-2 rounded border text-xs resize-none"
                    name={field.name}
                    rows={4}
                    maxLength={field.maxLength}
                    placeholder={`${field.placeholder} (최대 ${field.maxLength}자)`}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                  <span className="absolute bottom-2 right-2 text-[8px] text-gray-400">
                    {formData[field.name].length}/{field.maxLength}
                  </span>
                </div>
              );
            }

            return (
              <input
                key={field.name}
                type={field.type}
                name={field.name}
                min={field.min}
                maxLength={field.maxLength}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className="w-full p-2 rounded border text-xs"
                autoComplete="off"
              />
            );
          })}
          <div className="flex justify-center gap-2 pt-2">
            <button type="submit" className="text-xs px-3 py-1.5 bg-btn-blue text-white rounded hover:bg-blue-400">
              생성
            </button>
            <button
              type="button"
              onClick={close}
              className="text-xs px-3 py-1.5 bg-btn-red text-white rounded hover:bg-red-400"
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
