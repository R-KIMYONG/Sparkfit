import {
  RiSearchLine,
  RiGroupLine,
  RiArrowGoBackLine,
  RiUser3Line,
  RiLogoutBoxRLine,
  RiHome2Line
} from 'react-icons/ri';

export const getSidebarMenus = ({ openModal, navigate, hasNewPlaces, resetPlacesNotification }) => [
  { icon: RiSearchLine, text: '검색', onClick: openModal },
  {
    icon: RiGroupLine,
    text: '모임',
    hasAlarm: hasNewPlaces,
    onClick: () => {
      navigate('/gathering');
      resetPlacesNotification();
    }
  },
  { icon: RiArrowGoBackLine, text: '뒤로가기', onClick: () => navigate(-1) }
];

export const getBottomMenus = ({ navigate, handleSignOut, hasNewContracts }) => [
  {
    icon: RiUser3Line,
    text: '내 계정',
    hasAlarm: hasNewContracts,
    onClick: () => {
      navigate('/mypage');
    }
  },
  { icon: RiLogoutBoxRLine, text: '로그아웃', onClick: handleSignOut }
];

export const getMobileMenus = ({
  navigate,
  openModal,
  handleSignOut,
  hasNewPlaces,
  hasNewContracts,
  resetContractsNotification,
  resetPlacesNotification
}) => [
  { icon: RiHome2Line, text: '홈', onClick: () => navigate('/') },
  {
    icon: RiGroupLine,
    text: '모임',
    onClick: () => {
      navigate('/gathering');
      resetPlacesNotification();
    },
    hasAlarm: hasNewPlaces
  },
  { icon: RiSearchLine, text: '검색', onClick: openModal },
  {
    icon: RiUser3Line,
    text: '내 계정',
    hasAlarm: hasNewContracts,
    onClick: () => {
      navigate('/mypage');
      resetContractsNotification();
    }
  },
  { icon: RiLogoutBoxRLine, text: '로그아웃', onClick: handleSignOut }
];
