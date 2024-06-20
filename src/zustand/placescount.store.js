import supabase from '@/supabase/supabaseClient';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const fetchPlacesCount = async (userId) => {
  const { data: placesData, error: placesError } = await supabase.from('Places').select('*').eq('created_by', userId);

  if (placesError) {
    throw new Error(placesError.message);
  }
  console.log(placesData);
  const placeIds = placesData.map((place) => place.id);

  if (placeIds.length === 0) {
    return 0;
  }

  const { count, error: contractsError } = await supabase
    .from('Contracts')
    .select('place_id', { count: 'exact' })
    .in('place_id', placeIds);

  if (contractsError) {
    throw new Error(contractsError.message);
  }

  return count;
};

export const usePlacesCount = create(
  immer((set, get) => ({
    placesCount: 0,
    error: null,
    isPending: false,
    intervalId: null,
    previousCount: 0,
    startFetching: (userId) => {
      set({ isPending: true });
      const interval = setInterval(async () => {
        try {
          const newCount = await fetchPlacesCount(userId);
          set({ placesCount: newCount, isPending: false });
        } catch (error) {
          set({ error: error.message, isPending: false });
        }
      }, 5000); // 5 초 간격으로 모집인원 체크

      set({ intervalId: interval });
    },
    stopFetching: () => {
      const state = get();
      clearInterval(state.intervalId);
      set({ intervalId: null });
    },
    getPreviousCount: async (userId) => {
      try {
        const { data, error } = await supabase.from('Users').select('*').eq('user_id', userId);
        if (error) {
          throw new Error(error.message);
        }
        let prev = data[0].total_applicant;
        set({ previousCount: prev, isPending: false });
      } catch (error) {
        console.log('getPreviousCount함수오류', error);
      }
    },
    updateApplicant: async (userId, newTotalApplicant) => {
      try {
        const { data, error } = await supabase
          .from('Users')
          .update({ total_applicant: newTotalApplicant })
          .eq('user_id', userId);

        if (error) {
          throw new Error(error.message);
        }
        console.log('Total applicant updated successfully:', data);
      } catch (error) {
        console.error('Error updating total applicant:', error.message);
      }
    },
    setpreviousCount: () => {
      const state = get();
      return state.previousCount;
    }
  }))
);
