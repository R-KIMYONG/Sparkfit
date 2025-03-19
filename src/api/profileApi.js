import supabase from '@/supabase/supabaseClient';

// 로그인한 사용자 정보
export const loginUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
};

// 특정 사용자 정보
export const getUser = async (userId) => {
  const { data, error } = await supabase.from('userinfo').select('*').eq('id', userId).single();
  if (error) {
    console.error(error.message);
  }

  return data;
};

export const checkIfUserHasJoined = async (placeId, userId) => {
  const { data, error } = await supabase.from('Contracts').select('*').eq('place_id', placeId).eq('user_id', userId);
  if (error) {
    console.error(error.message);
    return false;
  }

  return data.length > 0;
};
