import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getTermsValue } from './getTermsValue';
import { Link, useNavigate } from 'react-router-dom';
import { Switch } from '@headlessui/react';
import { EyeIcon } from '@heroicons/react/24/outline';

const TermsPage = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState({
    all: false,
    termsOfService: false,
    privacyPolicy: false,
    optionalPrivacy: false
  });
  const handleCheck = (name) => {
    const updatedTerms = { ...terms, [name]: !terms[name] };
    updatedTerms.all = updatedTerms.termsOfService && updatedTerms.privacyPolicy && updatedTerms.optionalPrivacy;
    setTerms(updatedTerms);
  };

  const handleAllCheck = () => {
    const newState = !terms.all;
    setTerms({
      all: newState,
      termsOfService: newState,
      privacyPolicy: newState,
      optionalPrivacy: newState
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!terms.termsOfService || !terms.privacyPolicy) {
      Swal.fire({
        icon: 'error',
        title: '약관 동의 필요',
        text: '필수 약관에 동의해야 회원가입이 가능합니다.'
      });
      return;
    }
    navigate('/signup');
  };

  const termsInputFields = [
    {
      name: 'termsOfService',
      label: '(필수) SparkFit 이용약관 동의',
      checked: terms.termsOfService,
      onChange: () => handleCheck('termsOfService')
    },
    {
      name: 'privacyPolicy',
      label: '(필수) 개인정보 수집 및 이용 동의',
      checked: terms.privacyPolicy,
      onChange: () => handleCheck('privacyPolicy')
    },
    {
      name: 'optionalPrivacy',
      label: '(선택) 개인정보 마케팅 활용 동의',
      checked: terms.optionalPrivacy,
      onChange: () => handleCheck('optionalPrivacy')
    },
    { name: 'fullAgreement', label: '전체 동의', checked: terms.all, onChange: handleAllCheck }
  ];
  const isNextButtonDisabled = terms.termsOfService && terms.privacyPolicy;
  return (
    <div className="flex justify-center items-center h-[100dvh] bg-customBackground">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center my-0 mx-auto w-96 gap-5 text-base bg-white bg-opacity-70 p-8 rounded-lg shadow-lg relative"
      >
        {termsInputFields.map(({ name, label, checked, onChange }) => (
          <div key={name}>
            <label key={name} className="flex items-center cursor-pointer gap-2">
              <Switch
                checked={checked}
                onChange={onChange}
                className={`${checked ? 'bg-blue-600' : 'bg-gray-300'}
                relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
              >
                <span
                  className={`${
                    checked ? 'translate-x-5' : 'translate-x-0'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
                />
              </Switch>
              <p className="text-sm">{label}</p>
              {name !== 'fullAgreement' && (
                <button
                  type="button"
                  onClick={() =>
                    Swal.fire({
                      title: label,
                      html: `<div class="modal-scroll-content">${getTermsValue(name)}</div>`,
                      confirmButtonText: '닫기',
                      width: '25rem',
                      customClass: {
                        title: 'terms-modal-title',
                        popup: 'terms-modal-popup',
                        htmlContainer: 'terms-modal-html'
                      }
                    })
                  }
                  className="text-xs text-gray-400 underline underline-offset-2 ml-auto hover:text-gray-700 transition-all"
                >
                  전체보기
                </button>
              )}
            </label>
            {name !== 'fullAgreement' ? (
              <div className="w-full h-16 border p-2 mt-2 overflow-y-auto">
                <div className="text-[0.65rem]" dangerouslySetInnerHTML={{ __html: getTermsValue(name) }} />
              </div>
            ) : (
              ''
            )}
          </div>
        ))}
        <div className="flex justify-between items-center gap-4">
          <Link
            to={'/login'}
            className="w-full bg-red-600 rounded-full p-1.5 cursor-pointer text-center text-xs text-white hover:bg-red-400 transition-all"
          >
            이전
          </Link>
          <button
            type="submit"
            className={`w-full text-xs rounded-full  p-1.5 cursor-pointer text-center hover:bg-blue-400 transition-all ${
              isNextButtonDisabled ? `bg-customLoginButton text-white ` : `bg-customSignupButton text-black`
            }`}
          >
            다음
          </button>
        </div>
      </form>
    </div>
  );
};

export default TermsPage;
