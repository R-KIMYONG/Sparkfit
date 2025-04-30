// import supabase from '@/supabase/supabaseClient';
// import dayjs from 'dayjs';
// import { create } from 'zustand';
// import { createJSONStorage, persist } from 'zustand/middleware';

// const fetchContractsCount = async (userId, set, get) => {
//   const { data: placesData, error: placesError } = await supabase.from('Places').select('id').eq('created_by', userId);

//   if (placesError) throw new Error(placesError.message);

//   const placeIds = placesData.map((place) => place.id);
//   if (placeIds.length === 0) return 0;

//   const { count, error: contractsError } = await supabase
//     .from('Contracts')
//     .select('place_id', { count: 'exact' })
//     .in('place_id', placeIds);

//   if (contractsError) throw new Error(contractsError.message);

//   const prevCount = get().contractsCount;
//   set({ contractsCount: count });
//   if (prevCount !== 0 && count > prevCount) {
//     set({ hasNewContracts: true });
//   }
//   return count;
// };

// const fetchPlacesCount = async (userId) => {
//   const { data: placesData, error: placesError } = await supabase.from('Places').select('id').eq('created_by', userId);

//   if (placesError) throw new Error(placesError.message);
//   return placesData.length;
// };

// export const usePlacesCount = create(
//   persist(
//     (set, get) => ({
//       placesCount: 0,
//       contractsCount: 0,
//       error: null,
//       hasNewContracts: false,
//       hasNewPlaces: false,
//       newPlaces: [],
//       contractsInsertChannel: null,
//       contractsUpdateChannel: null,
//       placesUpdateChannel: null,

//       removeNewPlace: (id) =>
//         set((state) => {
//           const updated = state.newPlaces.filter((placeId) => placeId !== id);
//           return {
//             newPlaces: updated,
//             hasNewPlaces: updated.length > 0
//           };
//         }),

//       startFetching: (userId) => {
//         const fetchData = async () => {
//           try {
//             const contractsCount = await fetchContractsCount(userId, set, get);
//             set({ contractsCount });
//           } catch (error) {
//             set({ error: error.message });
//           }
//         };
//         fetchData();

//         const contractsInsertChannel = supabase
//           .channel('contracts-insert-channel')
//           .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Contracts' }, async (payload) => {
//             if (payload.new.status === 'approved' || payload.new.status === 'pending') {
//               try {
//                 const { data, error } = await supabase
//                   .from('Places')
//                   .select('created_by')
//                   .eq('id', payload.new.place_id);

//                 if (error) throw new Error(error.message);
//                 if (userId && userId === data[0].created_by) {
//                   set({ hasNewContracts: true });
//                 }
//               } catch (error) {
//                 set({ error: error.message });
//               }
//             }
//           })
//           .subscribe();

//         const contractsUpdateChannel = supabase
//           .channel('contracts-update-channel')
//           .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Contracts' }, async (payload) => {
//             if (payload.new.status === 'approved' || payload.new.status === 'rejected') {
//               try {
//                 if (userId === payload.new.user_id) {
//                   set({ hasNewContracts: true });
//                 }
//               } catch (error) {
//                 set({ error: error.message });
//               }
//             }
//           })
//           .subscribe();

//         const placesUpdateChannel = supabase
//           .channel('places-update-channel')
//           .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Places' }, async (payload) => {
//             try {
//               const place = payload.new;
//               const newPlacesCount = await fetchPlacesCount(userId);

//               if (place.created_by === userId) {
//                 set(() => ({ placesCount: newPlacesCount }));
//                 return;
//               }

//               const isWithin3Days = dayjs().diff(dayjs(place.created_at), 'day') < 3;
//               const isBeforeDeadline = dayjs(place.deadline).isAfter(dayjs());

//               if (isWithin3Days && isBeforeDeadline) {
//                 const { data: viewedData } = await supabase
//                   .from('Viewed_places')
//                   .select('id')
//                   .eq('user_id', userId)
//                   .eq('viewed_id', place.id)
//                   .maybeSingle();

//                 const alreadyViewed = !!viewedData;

//                 if (!alreadyViewed) {
//                   set((state) => {
//                     const alreadyExists = state.newPlaces.includes(place.id);
//                     const updatedNewPlaces = alreadyExists ? state.newPlaces : [...state.newPlaces, place.id];

//                     return {
//                       placesCount: newPlacesCount,
//                       hasNewPlaces: updatedNewPlaces.length > 0,
//                       newPlaces: updatedNewPlaces
//                     };
//                   });
//                 }
//               } else {
//                 set(() => ({ placesCount: newPlacesCount }));
//               }
//             } catch (error) {
//               set({ error: error.message });
//             }
//           })
//           .subscribe();

//         set({ contractsInsertChannel, contractsUpdateChannel, placesUpdateChannel });
//       },

//       stopFetching: () => {
//         const state = get();
//         if (state.contractsInsertChannel) supabase.removeChannel(state.contractsInsertChannel);
//         if (state.contractsUpdateChannel) supabase.removeChannel(state.contractsUpdateChannel);
//         if (state.placesUpdateChannel) supabase.removeChannel(state.placesUpdateChannel);

//         set({
//           contractsInsertChannel: null,
//           contractsUpdateChannel: null,
//           placesUpdateChannel: null,
//           hasNewContracts: false
//         });
//       },

//       resetContractsNotification: () => set({ hasNewContracts: false }),
//       resetPlacesNotification: () => set({ hasNewPlaces: false })
//     }),
//     {
//       name: 'places-count-storage',
//       storage: createJSONStorage(() => localStorage),
//       partialize: (state) => ({
//         newPlaces: state.newPlaces,
//         hasNewPlaces: state.hasNewPlaces
//       })
//     }
//   )
// );

import supabase from '@/supabase/supabaseClient';
import dayjs from 'dayjs';
import { create } from 'zustand';

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

const fetchPlacesCount = async (userId) => {
  const { data, error } = await supabase.from('Places').select('id').eq('created_by', userId);
  if (error) throw new Error(error.message);
  return data.length;
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

export const usePlacesCount = create((set, get) => ({
  contractsCount: 0,
  hasNewContracts: false,
  hasNewPlaces: false,
  newPlaces: [],
  error: null,
  contractsInsertChannel: null,
  contractsUpdateChannel: null,
  placesUpdateChannel: null,

  startFetching: (userId) => {
    fetchContractsCount(userId, set, get);
    fetchNewPlaces(userId, set);

    const contractsInsertChannel = supabase
      .channel('contracts-insert-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Contracts' }, async (payload) => {
        if (payload.new.status === 'approved' || payload.new.status === 'pending') {
          try {
            const { data, error } = await supabase.from('Places').select('created_by').eq('id', payload.new.place_id);

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

    const placesUpdateChannel = supabase
      .channel('places-update-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Places' }, async () => {
        fetchNewPlaces(userId, set);
      })
      .subscribe();

    set({ contractsInsertChannel, contractsUpdateChannel, placesUpdateChannel });
  },

  stopFetching: () => {
    const state = get();
    if (state.contractsInsertChannel) supabase.removeChannel(state.contractsInsertChannel);
    if (state.contractsUpdateChannel) supabase.removeChannel(state.contractsUpdateChannel);
    if (state.placesUpdateChannel) supabase.removeChannel(state.placesUpdateChannel);
    set({ contractsInsertChannel: null, contractsUpdateChannel: null, placesUpdateChannel: null });
  },

  removeNewPlace: (id) => {
    const updated = get().newPlaces.filter((pid) => pid !== id);
    set({ newPlaces: updated, hasNewPlaces: updated.length > 0 });
  },

  resetContractsNotification: () => set({ hasNewContracts: false }),
  resetPlacesNotification: () => set({ hasNewPlaces: false })
}));
