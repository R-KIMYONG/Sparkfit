import supabase from '@/supabase/supabaseClient';
import dayjs from 'dayjs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
};

const fetchContractsCount = async (userId, set, get) => {
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
  const prevCount = get().contractsCount;
  set({ contractsCount: count });
  if (prevCount !== 0 && count > prevCount) {
    set({ hasNewContracts: true });
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

export const usePlacesCount = create(
  persist(
    (set, get) => ({
      placesCount: 0,
      contractsCount: 0,
      error: null,
      hasNewContracts: false,
      hasNewPlaces: false,
      newPlaces: [],
      removeNewPlace: (id) =>
        set((state) => {
          const updated = state.newPlaces.filter((placeId) => placeId !== id);
          return {
            newPlaces: updated,
            hasNewPlaces: updated.length > 0
          };
        }),
      removePlaceFromNew: (placeId) =>
        set((state) => ({
          newPlaces: state.newPlaces.filter((id) => id !== placeId),
          hasNewPlaces: state.newPlaces.filter((id) => id !== placeId).length > 0
        })),
      startFetching: (userId) => {
        const fetchData = async () => {
          try {
            const contractsCount = await fetchContractsCount(userId, set, get);
            set({ contractsCount });
          } catch (error) {
            set({ error: error.message });
          }
        };

        // 초기 데이터 로드
        fetchData();
        // 'Contracts' 테이블에서 새로운 멤버가 있는지 확인하는 채널
        const contractsInsertChannel = supabase
          .channel('contracts-insert-channel')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Contracts' }, async (payload) => {
            if (payload.new.status === 'approved' || payload.new.status === 'pending') {
              try {
                const { data, error } = await supabase
                  .from('Places')
                  .select('created_by')
                  .eq('id', payload.new.place_id);

                if (error) throw new Error(error.message);
                if (userId && userId === data[0].created_by) {
                  set({ hasNewContracts: true });
                }
              } catch (error) {
                set({ error: error.message });
              }
            }
          })
          .subscribe();
        // 'Contracts' 테이블에서 멤버가 가입요청 변경 있는지 확인하는 채널
        const contractsUpdateChannel = supabase
          .channel('contracts-update-channel')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Contracts' }, async (payload) => {
            if (payload.new.status === 'approved' || payload.new.status === 'rejected') {
              try {
                if (userId === payload.new.user_id) {
                  set({ hasNewContracts: true });
                }
              } catch (error) {
                set({ error: error.message });
              }
            }
          })
          .subscribe();

        // 'Places' 테이블에서 새로운 장소가 등록되었는지 확인하는 채널
        const placesUpdateChannel = supabase
          .channel('places-update-channel')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Places' }, async (payload) => {
            // 새로운 장소가 추가될 때마다 사용자가 만든 장소의 갯수를 갱신합니다.
            try {
              const place = payload.new;
              const newPlacesCount = await fetchPlacesCount(userId);

              if (place.created_by === userId) {
                set(() => ({ placesCount: newPlacesCount }));
                return;
              }

              const isWithin3Days = dayjs().diff(dayjs(place.created_at), 'day') < 3;
              const isBeforeDeadline = dayjs(place.deadline).isAfter(dayjs());

              if (isWithin3Days && isBeforeDeadline) {
                const { data: viewedData } = await supabase
                  .from('Viewed_places')
                  .select('id')
                  .eq('user_id', userId)
                  .eq('viewed_id', place.id)
                  .maybeSingle();

                const alreadyViewed = !!viewedData;

                if (!alreadyViewed) {
                  set((state) => {
                    const alreadyExists = state.newPlaces.includes(place.id);
                    const updatedNewPlaces = alreadyExists ? state.newPlaces : [...state.newPlaces, place.id];

                    return {
                      placesCount: newPlacesCount,
                      hasNewPlaces: updatedNewPlaces.length > 0,
                      newPlaces: updatedNewPlaces
                    };
                  });
                }
              } else {
                // 3일 초과이거나 마감된 경우: 알림에 추가하지 않음, 그래도 count는 갱신
                set(() => ({
                  placesCount: newPlacesCount
                }));
              }
            } catch (error) {
              set({ error: error.message });
            }
          })
          .subscribe();

        // set({ contractsUpdateChannel, placesUpdateChannel });
      },
      stopFetching: () => {
        const state = get();
        if (state.contractsUpdateChannel) {
          supabase.removeChannel(state.contractsUpdateChannel);
        }
        if (state.placesUpdateChannel) {
          supabase.removeChannel(state.placesUpdateChannel);
        }
        set({ contractsUpdateChannel: null, placesUpdateChannel: null, hasNewContracts: false });
      },
      resetContractsNotification: () => {
        set({ hasNewContracts: false });
      },
      resetPlacesNotification: () => {
        set({ hasNewPlaces: false });
      }
    }),
    {
      name: 'places-count-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        newPlaces: state.newPlaces,
        hasNewPlaces: state.hasNewPlaces
      })
    }
  )
);
