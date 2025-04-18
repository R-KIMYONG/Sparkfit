import { useState } from 'react';

export const useValidation = () => {
  const [pwError, setPwError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [genderError, setGenderError] = useState('');

  const validateAll = ({ email, password, confirmPassword, nickname, gender }) => {
    let isValid = true;

    // 이메일 검사
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      isValid = false;
    } else if (!/^([0-9a-zA-Z_.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z]+){1,2}$/.test(email)) {
      setEmailError('이메일 형식을 맞춰 작성해주세요.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // 비밀번호 검사
    if (!password) {
      setPwError('비밀번호를 입력해주세요');
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*()_+]).{8,}$/.test(password)) {
      setPwError('8자 이상의 소문자, 숫자, 특수문자를 사용해주세요.');
      isValid = false;
    } else {
      setPwError('');
    }

    // 비밀번호 확인
    if (!confirmPassword) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    // 닉네임
    if (!nickname) {
      setNicknameError('닉네임을 입력해주세요.');
      isValid = false;
    } else {
      setNicknameError('');
    }

    // 성별
    if (!gender) {
      setGenderError('성별을 선택해주세요.');
      isValid = false;
    } else {
      setGenderError('');
    }

    return isValid;
  };

  return {
    emailError,
    pwError,
    nicknameError,
    confirmPasswordError,
    genderError,
    validateAll
  };
};
