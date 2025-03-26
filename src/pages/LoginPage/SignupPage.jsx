import { useValidation } from '@/hooks/useValidation';
import { useUserStore } from '@/zustand/auth.store';
import { useState } from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { RiLockPasswordLine, RiUser3Line, RiLockPasswordFill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUserErrorMessage } from './getUserErrorMessage';
import { BsGenderAmbiguous } from 'react-icons/bs';
import { PiUserCirclePlus } from 'react-icons/pi';
const SignupPage = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const signUp = useUserStore((state) => state.signUp);
  const navigate = useNavigate();
  const { pwError, setPwError, emailError, setEmailError, validatePassword, validateEmail } = useValidation();

  const handleChangePassword = (e) => {
    const { value } = e.target;
    console.log(e.target);
    setPassword(value);
    if (value) {
      validatePassword(value);
    } else if (!value) {
      setPwError('');
    }
  };

  const handleChangeEmail = (e) => {
    const { value } = e.target;
    setEmail(value);
    if (value) {
      validateEmail(value);
    } else if (!value) {
      setEmailError('');
    }
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmPassword(value);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (!email || !password || !nickname || !gender || password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: '입력값을 다시 확인해주세요',
        text: password !== confirmPassword ? '비밀번호가 일치하지 않습니다.' : '모든 필수 정보를 입력해주세요.'
      });
      return;
    }

    try {
      await signUp(email, password, nickname, gender);

      setEmail('');
      setPassword('');
      setNickname('');
      setGender('');

      Swal.fire({
        title: '회원가입 완료!',
        text: '로그인을 해주세요',
        icon: 'success'
      });
      navigate('/login'); // 회원가입 후 로그인 페이지로 이동
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: getUserErrorMessage(error)
      });
    }
  };

  const inputFields = [
    {
      name: 'nickname',
      type: 'text',
      placeholder: 'nickname',
      value: nickname,
      onChange: (e) => setNickname(e.target.value),
      Icon: RiUser3Line,
      error: null
    },
    {
      name: 'email',
      type: 'email',
      placeholder: 'email',
      value: email,
      onChange: handleChangeEmail,
      Icon: MdOutlineEmail,
      error: emailError
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'password',
      value: password,
      onChange: handleChangePassword,
      Icon: RiLockPasswordLine,
      error: pwError
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Confirm password',
      value: confirmPassword,
      onChange: handleConfirmPasswordChange,
      Icon: RiLockPasswordFill,
      error: null
    }
  ];

  return (
    <div className="flex justify-center items-center h-[100dvh] bg-customBackground">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col justify-center items-center mx-auto w-auto gap-4 text-base bg-white bg-opacity-70 p-8 rounded-lg shadow-lg relative pt-20"
      >
        <div className="absolute -top-8 bg-white shadow-lg rounded-full overflow-hidden">
          <PiUserCirclePlus className="text-6xl" />
        </div>
        {inputFields.map(({ name, type, placeholder, value, onChange, Icon, error }) => (
          <div key={name} className="w-full items-center border bg-white rounded-full flex gap-2 px-4 relative">
            <Icon className="text-xl" />
            <input
              className="w-full border-none text-xs px-1.5 py-2 focus:outline-none placeholder:text-xs"
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              maxLength={name === 'password' && name === 'confirmPassword' ? 20 : 12}
            />
            {error && <p className="text-red-300 text-[0.5rem] absolute -bottom-5">{error}</p>}
          </div>
        ))}

        <div className="w-full items-center border bg-white rounded-full px-4 py-1.5 flex gap-6">
          <BsGenderAmbiguous className="text-xl" />
          <div className="flex justify-start gap-4 w-full">
            <label className="flex items-center gap-2">
              <input type="radio" value="male" checked={gender === 'male'} onChange={handleGenderChange} />
              <p className="text-xs">남성</p>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="female" checked={gender === 'female'} onChange={handleGenderChange} />
              <p className="text-xs">여성</p>
            </label>
          </div>
        </div>
        <div className="flex items-center w-full gap-4">
          <button className="w-full text-xs rounded-full bg-customLoginButton text-white p-1.5 cursor-pointer">
            회원가입
          </button>
          <Link
            to="/login"
            className="w-full text-xs rounded-full bg-customSignupButton text-black p-1.5 cursor-pointer text-center"
          >
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
