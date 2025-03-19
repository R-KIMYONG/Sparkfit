import supabase from '@/supabase/supabaseClient';

class PlacesApi {
  constructor() {
    this.supabase = supabase;
  }

  async getPlaces() {
    const { data, error } = await this.supabase.from('Places').select('*').order('created_at', { ascending: false });

    if (error) {
      console.log('error => ', error);
      throw new Error('모임 가져오기 실패 => ', error);
    }

    return data;
  }
}

const placesApi = new PlacesApi();

export default placesApi;
