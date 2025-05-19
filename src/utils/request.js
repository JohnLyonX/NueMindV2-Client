import axios from "axios";

const instance = axios.create({
    // baseURL: 'http://nuemind.nuex.ltd/prod-api/',
    baseURL: 'http://localhost/dev-api/',
    timeout: 30000,
    // headers: {'X-Custom-Header': 'foobar'}
  });
instance.interceptors.request.use(
  (config) => {
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('token');
    if (token) {
      // 将 token 添加到请求头中
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
