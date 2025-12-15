const baseApiUrl = 'https://tcobid-backend.azurewebsites.net';

export const environment = {
  production: true,
  apiBaseUrl: `${baseApiUrl}`,
  baseApiURL: baseApiUrl,
  baseURLScope: 'https://tcobid.azure.chevron.com/',
  redirectUri:
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '',
  instance: 'https://login.microsoftonline.com/',
  tenantId: 'fd799da1-bfc1-4234-a91c-72b3a1cb9e26',
  clientId: 'd4b7eadd-4b7d-406b-9a87-94f0199bcd5f',
  oidcScopes: ['User.Read', 'https://tcobid-test.azure.chevron.com/user_impersonation', 'User.Write', 'https://tcobid-test.azure.chevron.com/access_as_user'],
  graphScopes: ['User.Read', 'User.Read.All'],
  autoSignIn: true,
  popupForLogin: false,
  cacheLocation: 'localStorage',
};
