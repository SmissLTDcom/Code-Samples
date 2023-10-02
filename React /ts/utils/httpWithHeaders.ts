import axios from 'axios';

import config from 'config';

import { catchError, getResponseWithHeader, setConfig, showError } from './http.config';

const httpWithHeaders = axios.create({
  baseURL: config.API_URL,
});

httpWithHeaders.interceptors.request.use(setConfig, catchError);

httpWithHeaders.interceptors.response.use(getResponseWithHeader, showError);



export default httpWithHeaders;
