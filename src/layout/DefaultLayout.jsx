import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';
import GuideModal from '@/components/common/GuideModal';
import dayjs from 'dayjs';

export default function DefaultLayout() {
  const [showGuide, setShowGuide] = useState(false);

  const handleSkipOptionChange = (option) => {
    const now = dayjs();
    const skipUntil = option === '1day' ? now.add(1, 'day') : now.add(7, 'day');

    localStorage.setItem('skipGuideUntil', skipUntil.toISOString());
    setShowGuide(false);
  };

  const handleClose = () => {
    setShowGuide(false);
  };

  useEffect(() => {
    const skipUntil = localStorage.getItem('skipGuideUntil');
    if (skipUntil && dayjs().isBefore(dayjs(skipUntil))) {
      setShowGuide(false);
    } else {
      setShowGuide(true);
    }
  }, []);
  return (
    <main className="flex justify-center items-center">
      <Sidebar />
      <Outlet />
      <GuideModal isOpen={showGuide} onClose={handleClose} onSkipOptionChange={handleSkipOptionChange} />
    </main>
  );
}
