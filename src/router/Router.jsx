import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import MyPage from '@/components/myPage/MyPage';
import GatheringList from '@/pages/GatheringPage/GatheringList';
import DefaultLayout from '../layout/DefaultLayout';
import DetailedPost from '../pages/DetailPage/DetailedPost';
import HomePage from '../pages/LoginPage/HomePage';
import LoginPage from '../pages/LoginPage/LoginPage';
import SignupPage from '../pages/LoginPage/SignupPage';
import NavermapScriptComponent from '../pages/MainPage/NavermapScriptComponent';
import { PrivateRouter } from './PrivateRouter';
import { PublicRouter } from './PublicRouter';
import TermsPage from '@/pages/LoginPage/TermsPage';
import SearchModal from '@/layout/SearchModal';

export default function Router() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RoutesWithLocation />
    </BrowserRouter>
  );
}

function RoutesWithLocation() {
  const location = useLocation();
  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;
  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route element={<PublicRouter />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        <Route element={<PrivateRouter />}>
          <Route element={<DefaultLayout />}>
            <Route path="/main" element={<NavermapScriptComponent />} />
            <Route path="/main/searchmodal" element={<SearchModal />} />
            <Route path="/gathering" element={<GatheringList />} />
            <Route path="/gathering/searchmodal" element={<SearchModal />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/searchmodal" element={<SearchModal />} />
            <Route path="/detail/:id" element={<DetailedPost />} />
            <Route path="/detail/:id/searchmodal" element={<SearchModal />} />
          </Route>
        </Route>
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="/main/searchmodal" element={<SearchModal />} />
          <Route path="/gathering/searchmodal" element={<SearchModal />} />
          <Route path="/mypage/searchmodal" element={<SearchModal />} />
          <Route path="/detail/:id/searchmodal" element={<SearchModal />} />
        </Routes>
      )}
    </>
  );
}
