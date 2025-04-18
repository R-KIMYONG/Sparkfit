import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/supabase/supabaseClient';
import { exercises } from '@/components/DetailPage/exercises';

import CreatableSelect from 'react-select/creatable';
import { handleInputChangeWithLimit } from '@/utils/selectFn/handleInputChangeWithLimit';
const EditPostModal = ({ close, post, postId, participantCount }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  const [formData, setFormData] = useState({
    gatherName: post?.gather_name || '',
    description: post?.texts || '',
    sportsName: post?.sports_name || '',
    deadline: post?.deadline || '',
    max_participants: post?.max_participants || 1
  });
  const [selectedInputValue, setSelectedInputValue] = useState('');
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async () => {
      const updatedPost = {
        id: postId,
        gather_name: formData.gatherName,
        texts: formData.description,
        sports_name: formData.sportsName,
        deadline: formData.deadline,
        max_participants: formData.max_participants
      };

      if (formData.max_participants < participantCount) {
        throw new Error(`이미 가입된 회원 수보다 적게 설정할 수 없습니다.`);
      }

      const { data, error } = await supabase
        .from('Places')
        .update({ ...updatedPost })
        .eq('id', postId);
      if (error) throw new Error(error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
      Swal.fire({
        icon: 'success',
        title: '수정 완료',
        text: '모임 정보가 성공적으로 수정되었습니다!',
        confirmButtonText: '확인'
      });
      close();
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: '수정 실패',
        text: `모임 수정 중 오류가 발생했습니다. ${error.message}`,
        confirmButtonText: '확인'
      });
    }
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    const missingFields = [];

    if (!formData.gatherName) missingFields.push('모임명');
    if (!formData.description) missingFields.push('모집 설명');
    if (!formData.sportsName) missingFields.push('스포츠명');
    if (!formData.deadline) missingFields.push('마감 기한');
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: '입력 값 확인',
        text: `${missingFields.join(', ')} 필드를 작성해주세요.`
      });
      return;
    }

    updateMutation.mutate();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectSportsInputChange = (value) => {
    const newValue = handleInputChangeWithLimit(value, 10);
    setSelectedInputValue(newValue);
  };

  const handleSelectChange = useCallback((selected) => {
    setFormData((prev) => {
      if (!selected) {
        return { ...prev, sportsName: '' };
      }

      if (prev.sportsName !== selected.value) {
        return { ...prev, sportsName: selected.value };
      }
      return prev;
    });
  }, []);

  const postDetails = [
    { name: 'gatherName', placeholder: '모임명', type: 'text', maxLength: 20 },
    {
      name: 'sportsName',
      placeholder: '스포츠명',
      type: 'select',
      options: exercises.map((sport) => ({ label: sport, value: sport }))
    },
    { name: 'deadline', placeholder: '마감 기한', type: 'date' },
    { name: 'description', placeholder: '모집 설명', type: 'textarea', maxLength: 200 },
    { name: 'max_participants', placeholder: '모집인원수', type: 'number', min: 1 }
  ];
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className={`bg-white p-6 rounded-lg w-[90%] xl:w-[35%] lg:w-1/3 md:w-1/3 sm:w-2/4 sm:ml-[6rem]`}>
        <h2 className="text-xl font-semibold mb-4">모임 정보 수정</h2>
        <form onSubmit={handleUpdate}>
          {postDetails.map(({ name, placeholder, type, options, min, maxLength }) => (
            <div key={name} className="mb-4">
              {type === 'select' ? (
                <CreatableSelect
                  options={options}
                  placeholder={placeholder}
                  value={
                    formData.sportsName
                      ? options.find((option) => option.value === formData.sportsName) || {
                          label: formData.sportsName,
                          value: formData.sportsName
                        }
                      : null
                  }
                  onChange={handleSelectChange}
                  className="text-xs"
                  formatCreateLabel={(inputValue) => `"${inputValue}" 생성 (최대 10자)`}
                  isClearable
                  inputValue={selectedInputValue}
                  onInputChange={handleSelectSportsInputChange}
                />
              ) : type === 'textarea' ? (
                <div className="relative w-full h-full">
                  <textarea
                    name={name}
                    className="w-full border px-3 py-2 rounded-md text-xs"
                    value={formData[name]}
                    style={{ resize: 'none' }}
                    onChange={handleInputChange}
                    autoComplete="off"
                    placeholder={placeholder + ' (최대 200자)'}
                    rows={4}
                    maxLength={maxLength}
                  />
                  <span className="text-[8px] text-gray-300 absolute right-3 bottom-2">
                    {formData[name].length}/200
                  </span>
                </div>
              ) : (
                <input
                  name={name}
                  type={type}
                  className="w-full border px-3 py-2 rounded-md text-xs"
                  value={formData[name]}
                  onChange={handleInputChange}
                  autoComplete="off"
                  min={min}
                  placeholder={placeholder}
                  maxLength={maxLength}
                />
              )}
            </div>
          ))}
          <div className="flex justify-between">
            <button
              className="text-xs px-3 py-1.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-blue-400 transition-all"
              type="submit"
            >
              완료
            </button>
            <button
              onClick={close}
              className="text-xs px-3 py-1.5 border-none bg-btn-red rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-red-400 transition-all"
              type="button"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
