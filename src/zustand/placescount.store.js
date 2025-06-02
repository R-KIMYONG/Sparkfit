import supabase from '@/supabase/supabaseClient';
import dayjs from 'dayjs';
import { create } from 'zustand';

const getPlaceOwner = async (place_id) => {
  const { data, error } = await supabase.from('Places').select('created_by').eq('id', place_id).maybeSingle();

  if (error || !data) throw new Error(error?.message || '모임장 정보 조회 실패');
  return data.created_by;
};

const fetchContractsCount = async (userId, set, get) => {
  const { data: placesData, error: placesError } = await supabase.from('Places').select('id').eq('created_by', userId);
  if (placesError) throw new Error(placesError.message);

  const placeIds = placesData.map((place) => place.id);
  if (placeIds.length === 0) return 0;

  const { count, error: contractsError } = await supabase
    .from('Contracts')
    .select('place_id', { count: 'exact' })
    .in('place_id', placeIds);

  if (contractsError) throw new Error(contractsError.message);

  const prevCount = get().contractsCount;
  set({ contractsCount: count });
  if (prevCount !== 0 && count > prevCount) {
    set({ hasNewContracts: true });
  }
  return count;
};

const fetchNewPlaces = async (userId, set) => {
  try {
    const { data: allPlaces, error: placeError } = await supabase
      .from('Places')
      .select('id, created_at, deadline, created_by');
    if (placeError) throw new Error(placeError.message);

    const { data: viewed, error: viewedError } = await supabase
      .from('Viewed_places')
      .select('viewed_id')
      .eq('user_id', userId);
    if (viewedError) throw new Error(viewedError.message);

    const viewedIds = viewed.map((v) => v.viewed_id);

    const now = dayjs();
    const newPlaces = allPlaces.filter((place) => {
      const isWithin3Days = now.diff(dayjs(place.created_at), 'day') < 3;
      const isBeforeDeadline = dayjs(place.deadline).isAfter(now);
      const isNotViewed = !viewedIds.includes(place.id);
      const isNotOwner = place.created_by !== userId;
      return isWithin3Days && isBeforeDeadline && isNotViewed && isNotOwner;
    });

    set({
      newPlaces: newPlaces.map((p) => p.id),
      hasNewPlaces: newPlaces.length > 0
    });
  } catch (error) {
    set({ error: error.message });
  }
};

export const fetchContractAlerts = async (userId, set) => {
  try {
    const { data, error } = await supabase.from('Viewed_contracts').select('*').eq('user_id', userId).eq('read', false);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      set({
        creatorContractAlerts: [],
        userContractAlerts: []
      });
      return;
    }
    //내가 만든 모임의 id목록입니다.
    const { data: myPlaces } = await supabase.from('Places').select('id').eq('created_by', userId);

    const myPlaceIds = myPlaces?.map((place) => place.id) ?? [];
    const creatorAlerts = data
      .filter((item) => item.read === false && myPlaceIds.includes(item.place_id))
      .map((item) => ({
        placeId: item.place_id, //어느 모임에 대한 요청인지
        placeCreatorId: item.user_id, // 요청을 수신한 사람
        targetUserId: item.target_user_id //가입 요청을 보낸 사용자 ID
      }));
    const userAlerts = data
      .filter(
        (item) =>
          ['approved', 'rejected'].includes(item.type) && //모임장이 승인거절한
          item.read === false && //읽지 않는 모임을 가져와
          item.user_id === userId && //나한테 발생해야되는 알림만
          item.target_user_id !== userId // 내가 생성한 알림은 제외
      )
      .map((item) => ({
        placeId: item.place_id, //어느 '모임'에 대한 알림인지
        userId: item.user_id, // 어느 멤버의 알림인지 확인
        type: item.type // 'approved' 또는 'rejected'
      }));

    set({
      creatorContractAlerts: creatorAlerts,
      userContractAlerts: userAlerts
    });
  } catch (error) {
    set({ error: error.message });
  }
};

export const usePlacesCount = create((set, get) => ({
  contractsCount: 0,
  hasNewContracts: false,
  hasNewPlaces: false,
  newPlaces: [], // 새로운 모임 생성되면 해당 배열에 넣기
  error: null,
  creatorContractAlerts: [], // 내가 만든 모임에 새 가입 요청/가입된 모임 ID 배열
  userContractAlerts: [], // 내가 가입 요청한 모임이 승인/거절된 모임 ID 배열
  contractsChannel: null,
  placesUpdateChannel: null,

  startFetching: (userId) => {
    //여기의 userId는 로그인한 사용자의 아이디
    fetchContractsCount(userId, set, get);
    fetchNewPlaces(userId, set);
    fetchContractAlerts(userId, set);

    const contractsChannel = supabase
      .channel('contractsChannel-channel', {
        config: {
          broadcast: { self: false },
          presence: { key: 'user_id' },
          postgres_changes: { old_record: true }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Contracts' }, async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        const addCreatorAlert = get().addCreatorAlert;
        try {
          const place_id = newRow?.place_id || oldRow?.place_id;

          if (!place_id) return;

          if (eventType === 'INSERT') {
            const { place_id, user_id, status } = newRow;
            const leaderId = await getPlaceOwner(place_id);
            if (leaderId === userId && user_id !== userId && status === 'pending') {
              //로그인한 사용자가 모임장일때 알림보낸다(멤버가입된거니까)
              addCreatorAlert(place_id, leaderId, user_id);
            }

            if (leaderId === userId && user_id !== userId && (status === 'approved' || status === 'pending')) {
              await supabase
                .from('Viewed_contracts')
                .upsert(
                  { user_id: leaderId, target_user_id: user_id, place_id, type: 'request', read: false },
                  { onConflict: ['user_id', 'place_id', 'type', 'target_user_id'] }
                );
            }
            await fetchContractAlerts(leaderId, set);
          }

          if (eventType === 'UPDATE') {
            if (['approved', 'rejected'].includes(newRow.status)) {
              const place_id = newRow.place_id;
              const targetUserId = newRow.user_id;
              const leaderId = await getPlaceOwner(place_id);

              // 가입자의 알림 삽입 (승인/거절)
              await supabase.from('Viewed_contracts').upsert(
                {
                  user_id: targetUserId,
                  place_id,
                  target_user_id: leaderId,
                  type: newRow.status, // 'approved' 또는 'rejected'
                  read: false
                },
                { onConflict: ['user_id', 'place_id', 'type', 'target_user_id'] }
              );

              // 만약 현재 로그인된 사용자가 멤버 본인이면 상태 업데이트

              await fetchContractAlerts(targetUserId, set); // 최신 상태 반영
            }
          }
          if (eventType === 'DELETE') {
            const leaderId = await getPlaceOwner(place_id);
            await supabase.from('Viewed_contracts').delete().match({
              user_id: leaderId,
              place_id,
              target_user_id: oldRow.user_id
            });
            // removeCreatorAlert(place_id, leaderId, oldRow.user_id);

            await fetchContractAlerts(leaderId, set);
          }
        } catch (error) {
          console.error('Contracts 채널 에러:', error.message);
        }
      })
      .subscribe();

    const placesUpdateChannel = supabase
      .channel('places-update-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Places' }, async () => {
        fetchNewPlaces(userId, set);
      })
      .subscribe();

    set({ contractsChannel, placesUpdateChannel });
  },

  stopFetching: () => {
    const state = get();
    if (state.contractsChannel) supabase.removeChannel(state.contractsChannel);
    if (state.placesUpdateChannel) supabase.removeChannel(state.placesUpdateChannel);
    set({ contractsChannel: null, placesUpdateChannel: null });
  },

  removeNewPlace: (id) => {
    const updated = get().newPlaces.filter((pid) => pid !== id);
    set({ newPlaces: updated, hasNewPlaces: updated.length > 0 });
  },
  addCreatorAlert: (placeId, placeCreatorId, targetUserId) => {
    set((state) => {
      const exists = state.creatorContractAlerts.some(
        (a) => a.placeId === placeId && a.placeCreatorId === placeCreatorId && a.targetUserId === targetUserId
      );
      return exists
        ? {}
        : {
            creatorContractAlerts: [...state.creatorContractAlerts, { placeId, placeCreatorId, targetUserId }]
          };
    });
  },
  removeCreatorAlert: (placeId, placeCreatorId, targetUserId) => {
    set((state) => {
      const updated = state.creatorContractAlerts.filter(
        (alert) =>
          !(alert.placeId === placeId && alert.targetUserId === targetUserId && alert.placeCreatorId === placeCreatorId)
      );
      return {
        creatorContractAlerts: [...updated]
      };
    });
  },
  removeUserAlert: (placeId) => {
    set((state) => {
      const updated = state.userContractAlerts.filter((alert) => alert.placeId !== placeId);
      return {
        userContractAlerts: [...updated]
      };
    });
  },

  resetContractsNotification: () => set({ hasNewContracts: false }),
  resetPlacesNotification: () => set({ hasNewPlaces: false })
}));
