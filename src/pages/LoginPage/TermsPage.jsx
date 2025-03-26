import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getTermsValue } from './getTermsValue';
import { Link, useNavigate } from 'react-router-dom';

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

  const handleSignUpNextStep = () => {
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
    { name: 'fullAgreement', label: '전체 동의', checked: terms.all, onChange: handleAllCheck },
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
    }
  ];
  const isNextButtonDisabled = terms.termsOfService && terms.privacyPolicy;
  console.log(isNextButtonDisabled);
  return (
    <div className="flex justify-center items-center h-[100dvh] bg-customBackground">
      <div className="flex flex-col justify-center my-0 mx-auto w-80 gap-5 text-base bg-white bg-opacity-70 p-8 rounded-lg shadow-lg relative">
        {termsInputFields.map(({ name, label, checked, onChange }) => (
          <div key={name}>
            <label key={name} className="flex items-center cursor-pointer gap-2">
              <input type="checkbox" checked={checked} onChange={onChange} />
              <p>{label}</p>
            </label>
            {name !== 'fullAgreement' ? (
              <div className="w-full h-24 border p-2 mt-2 overflow-y-auto">
                <div className="text-xs" dangerouslySetInnerHTML={{ __html: getTermsValue(name) }} />
              </div>
            ) : (
              ''
            )}
          </div>
        ))}
        <div className="flex justify-between items-center gap-4">
          <Link
            to={'/login'}
            className="w-full bg-red-600 rounded-full p-1.5 cursor-pointer text-center text-xs text-white"
          >
            이전
          </Link>
          <button
            to={'/signup'}
            className={`w-full text-xs transition-all rounded-full  p-1.5 cursor-pointer text-center ${
              isNextButtonDisabled ? `bg-customLoginButton text-white ` : `bg-customSignupButton text-black`
            }`}
            onClick={handleSignUpNextStep}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
