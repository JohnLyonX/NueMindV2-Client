import axios from "axios";

const instance = axios.create({
    // baseURL: 'http://nuemind.nuex.ltd/prod-api/',
    baseURL: 'http://localhost/dev-api/',
    timeout: 30000,
    // headers: {'X-Custom-Header': 'foobar'}
  });


export default instance;
