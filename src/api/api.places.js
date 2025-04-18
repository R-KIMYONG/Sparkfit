import supabase from '@/supabase/supabaseClient';
import dayjs from 'dayjs';

class PlacesApi {
  constructor() {
    this.supabase = supabase;
  }

  async getPlaces() {
    const today = dayjs().format('YYYY-MM-DD');
    const { data, error } = await this.supabase
      .from('Places')
      .select('*')
      .gte('deadline', today)
      .order('created_at', { ascending: false });
    if (error) {
      console.log('error => ', error);
      throw new Error('모임 가져오기 실패 => ', error);
    }

    return data;
  }
}

const placesApi = new PlacesApi();

export default placesApi;
