import supabase from '@/supabase/supabaseClient';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  if (count > get().contractsCount) {
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
            // 모임장이 가입을 승인하면 일반 회원에게 알림을 보냅니다.
            //모임장에 갈 알림
            //일단 이벤트 발생한 내용중 payload.new.place_id를 가져와 모임장이 누군지 확인하기
            //Places테이블에서 payload.new.place_id와 created_by 일치한거를 찾고
            //찾은 결과물이 모임장이니 현재로그인한 사용자가 모임장인지 구분
            //현재로그인한 사람이 모임장이면 알림 true  아니면 동작하지않는다

            if (payload.new.status === 'approved' || payload.new.status === 'pending') {
              try {
                const { data: ownerId, error: ownerIdError } = await supabase
                  .from('Places')
                  .select('*')
                  .eq('id', payload.new.place_id);

                const { data, error } = await supabase.auth.getUser();
                if (error || !data?.user) {
                  console.error('로그인된 사용자 정보를 가져올 수 없습니다.');
                  return;
                }

                const userId = data.user.id; //현재 로그인중인 사용자가 모임장인지 체크
                if (ownerIdError) {
                  throw new Error(ownerIdError.message);
                }
                if (userId === ownerId[0].created_by) {
                  set({ hasNewContracts: true });
                }
              } catch (error) {
                set({ error: error.message });
              }
            }
          })
          .subscribe();

        const contractsUpdateChannel = supabase
          .channel('contracts-update-channel')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Contracts' }, async (payload) => {
            if (payload.new.status === 'approved' || payload.new.status === 'rejected') {
              try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data?.user) {
                  console.error('로그인된 사용자 정보를 가져올 수 없습니다.');
                  return;
                }
                const userId = data.user.id; //현재 로그인중인 사용자가 모임장인지 체크
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
        set({ contractsUpdateChannel: null, placesUpdateChannel: null, hasNewContracts: false, hasNewPlaces: false });
      },
      resetContractsNotification: () => {
        set({ hasNewContracts: false });
      },
      resetPlacesNotification: () => {
        set({ hasNewPlaces: false });
      }
    }),
    {
      name: 'places-count-storage', // 로컬스토리지에 저장될 이름
      getStorage: () => sessionStorage // localStorage 사용 (sessionStorage로 변경 가능)
    }
  )
);
