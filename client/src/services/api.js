import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — extract data
API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

// ── Token APIs ──
export const createToken = (data) => API.post('/tokens', data);
export const getQueue = () => API.get('/tokens');
export const getTokenById = (id) => API.get(`/tokens/${id}`);
export const cancelToken = (id) => API.patch(`/tokens/${id}/cancel`);

// ── Doctor APIs ──
export const callNextPatient = () => API.post('/doctor/call-next');
export const completeConsultation = (tokenNumber) => API.post(`/doctor/complete/${tokenNumber}`);
export const startDoctorSession = (data) => API.post('/doctor/session/start', data);
export const endDoctorSession = () => API.post('/doctor/session/end');
export const getDoctorSession = () => API.get('/doctor/session');

// ── Summary APIs ──
export const getLiveStats = () => API.get('/summary');
export const getDailySummary = () => API.get('/summary/daily');
export const getSummaryByDate = (date) => API.get(`/summary/${date}`);

// ── Emergency APIs ──
export const getEmergencyRedirect = (data) => API.post('/emergency/redirect', data);
export const getNearbyHospitals = (lat, lng) => API.get(`/emergency/nearby?lat=${lat}&lng=${lng}`);
export const selectHospital = (data) => API.post('/emergency/select', data);

export default API;
