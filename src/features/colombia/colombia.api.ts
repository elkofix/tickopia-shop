import axios from 'axios';

const colombiaApi = axios.create({
  baseURL: 'https://api-colombia.com/api/v1',
});

export async function getCities() {
  const res = await colombiaApi.get('/City');
  return res.data; // Devuelve un array con ciudades
}
