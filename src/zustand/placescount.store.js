import supabase from '@/supabase/supabaseClient';
import { create } from 'zustand';

const fetchContractsCount = async (userId) => {
  // 사용자가 만든 장소를 가져옵니다.
  const { data: placesData, error: placesError } = await supabase.from('Places').select('id').eq('created_by', userId);

  if (placesError) {
    throw new Error(placesError.message);
  }

  const placeIds = placesData.map((place) => place.id);

  if (placeIds.length === 0) {
    return 0; // 사용자가 만든 장소가 없으면 0을 반환
  }

  // 사용자가 만든 장소에 해당하는 Contracts 테이블에서 가입된 인원 수를 조회합니다.
  const { count, error: contractsError } = await supabase
    .from('Contracts')
    .select('place_id', { count: 'exact' })
    .in('place_id', placeIds); // 사용자가 만든 장소에 대해 참가한 인원 수

  if (contractsError) {
    throw new Error(contractsError.message);
  }

  return count; // 사용자가 만든 모임에 가입된 총 인원 수를 반환
};

const fetchPlacesCount = async (userId) => {
  // 사용자가 만든 장소에 대한 갯수만 확인합니다.
  const { data: placesData, error: placesError } = await supabase.from('Places').select('id').eq('created_by', userId);

  if (placesError) {
    throw new Error(placesError.message);
  }

  return placesData.length; // 사용자가 만든 장소의 개수를 반환
};

export const usePlacesCount = create((set, get) => ({
  placesCount: 0,
  contractsCount: 0,
  error: null,
  hasNewContracts: false,
  hasNewPlaces: false,
  startFetching: (userId) => {
    // 'Contracts' 테이블에서 새로운 멤버가 있는지 확인하는 채널
    const contractsUpdateChannel = supabase
      .channel('contracts-update-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Contracts' }, async (payload) => {
        // 새로운 계약이 추가될 때마다 사용자가 만든 모임에 가입된 인원 수를 갱신합니다.
        if (payload.new.place_id) {
          try {
            const newContractsCount = await fetchContractsCount(userId);
            set({ contractsCount: newContractsCount, hasNewContracts: true });
          } catch (error) {
            set({ error: error.message });
          }
        }
      })
      .subscribe();

    // 'Places' 테이블에서 새로운 장소가 등록되었는지 확인하는 채널
    const placesUpdateChannel = supabase
      .channel('places-update-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Places' }, async () => {
        // 새로운 장소가 추가될 때마다 사용자가 만든 장소의 갯수를 갱신합니다.
        try {
          const newPlacesCount = await fetchPlacesCount(userId);
          set({ placesCount: newPlacesCount, hasNewPlaces: true });
        } catch (error) {
          set({ error: error.message });
        }
      })
      .subscribe();

    set({ contractsUpdateChannel, placesUpdateChannel });
  },
  stopFetching: (type) => {
    const state = get();
    const updates = {};
    if (state.contractsUpdateChannel && type === 'contracts') {
      supabase.removeChannel(state.contractsUpdateChannel);
      updates.contractsUpdateChannel = null;
      updates.hasNewContracts = false;
    }
    if (state.placesUpdateChannel && type === 'places') {
      supabase.removeChannel(state.placesUpdateChannel);
      updates.placesUpdateChannel = null;
      updates.hasNewPlaces = false;
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  // getPreviousCount: async (userId) => {
  //   try {
  //     const { data, error } = await supabase.from('userinfo').select('*').eq('id', userId);
  //     if (error) {
  //       throw new Error(error.message);
  //     }
  //     let prev = data[0].total_applicant;
  //     set({ previousCount: prev });
  //   } catch (error) {
  //     console.log('getPreviousCount함수오류', error);
  //   }
  // },
  resetContractsNotification: () => set({ hasNewContracts: false }),
  resetPlacesNotification: () => set({ hasNewPlaces: false })
  // updateApplicant: async (userId, newTotalApplicant) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('userinfo')
  //       .update({ total_applicant: newTotalApplicant })
  //       .eq('id', userId);

  //     if (error) {
  //       throw new Error(error.message);
  //     }
  //   } catch (error) {
  //     console.error('Error updating total applicant:', error.message);
  //   }
  // }
}));
