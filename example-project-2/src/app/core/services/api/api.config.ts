import { environment } from '../../../../environments/environment';

export const API = {
  baseUrl: environment.baseApiURL,
  endpoints: {
    getAcdRequests: '/AcdRequest/GetAcdRequests',
    getAcdRequestById: '/AcdRequest/GetAcdRequestById',
    updateAcdRequest: '/AcdRequest/UpdateAcdRequest',
    createAcdRequest: '/AcdRequest/CreateAcdRequest',
    getUserByEmailOrCanonicalId: '/User/GetUserByEmailOrCanonicalId',
    getUserByEmail: '/User/GetUserByEmail',
    createUser: '/User/CreateUser',
  },
};
