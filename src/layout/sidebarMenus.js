import {
  RiSearchLine,
  RiGroupLine,
  RiArrowGoBackLine,
  RiUser3Line,
  RiLogoutBoxRLine,
  RiHome2Line
} from 'react-icons/ri';

export const getSidebarMenus = ({ openModal, navigate, location, hasNewPlaces }) => [
  {
    icon: RiSearchLine,
    text: '검색',
    onClick: () => {
      const currentPath = location.pathname;
      navigate(`${currentPath}/searchmodal`, { state: { backgroundLocation: location } });
      openModal();
    }
  },
  {
    icon: RiGroupLine,
    text: '모임',
    hasAlarm: hasNewPlaces,
    onClick: () => {
      navigate('/gathering');
    }
  },
  { icon: RiArrowGoBackLine, text: '뒤로가기', onClick: () => navigate(-1) }
];

export const getBottomMenus = ({ navigate, handleSignOut, hasSidebarAlert }) => [
  {
    icon: RiUser3Line,
    text: '내 계정',
    hasAlarm: hasSidebarAlert,
    onClick: () => {
      navigate('/mypage');
    }
  },
  { icon: RiLogoutBoxRLine, text: '로그아웃', onClick: handleSignOut }
];

export const getMobileMenus = ({
  navigate,
  openModal,
  location,
  handleSignOut,
  hasNewPlaces,
  hasSidebarAlert,
  resetContractsNotification
}) => [
  { icon: RiHome2Line, text: '홈', onClick: () => navigate('/') },
  {
    icon: RiGroupLine,
    text: '모임',
    onClick: () => {
      navigate('/gathering');
    },
    hasAlarm: hasNewPlaces
  },
  {
    icon: RiSearchLine,
    text: '검색',
    onClick: () => {
      const currentPath = location.pathname;
      navigate(`${currentPath}/searchmodal`, { state: { backgroundLocation: location } });
      openModal();
    }
  },
  {
    icon: RiUser3Line,
    text: '내 계정',
    hasAlarm: hasSidebarAlert,
    onClick: () => {
      navigate('/mypage');
      resetContractsNotification();
    }
  },
  { icon: RiLogoutBoxRLine, text: '로그아웃', onClick: handleSignOut }
];
