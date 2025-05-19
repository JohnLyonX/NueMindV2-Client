import axios from "axios";

const instance = axios.create({
    // baseURL: 'http://nuemind.nuex.ltd/prod-api/',
    baseURL: 'http://localhost/dev-api/',
    timeout: 30000,
    // headers: {'X-Custom-Header': 'foobar'}
  });
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
