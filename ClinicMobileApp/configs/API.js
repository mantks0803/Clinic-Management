import axios from 'axios';

const HOST = 'http://10.0.2.2:8000';

export const endpoints = {
    'login': '/o/token/',
    'current-user': '/api/v1/users/current-user/',
    'doctors': '/api/v1/doctors/',
    'specialties': '/api/v1/specialties/',
    'appointments': '/api/v1/appointments/',
    'patients': '/api/v1/patients/',
  
};

export default axios.create({
    baseURL: HOST
});

export const authApi = (token) => axios.create({
    baseURL: HOST,
    headers: { 'Authorization': `Bearer ${token}` }
});