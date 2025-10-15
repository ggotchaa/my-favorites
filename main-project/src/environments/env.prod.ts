const baseApiUrl = 'https://tcobid-backend-dev.azurewebsites.net/api';

export const environment = {
  production: true,
  apiBaseUrl: `${baseApiUrl}/api`,
  baseApiURL: baseApiUrl,
  baseURLScope: 'https://tcobid-dev.azure.chevron.com/Read',
  redirectUri:
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '',
  instance: 'https://login.microsoftonline.com/',
  tenantId: 'fd799da1-bfc1-4234-a91c-72b3a1cb9e26',
  clientId: '58a40fb4-a4a5-4a4d-b75b-1f9a312d9480',
  oidcScopes: ['Read', 'user_impersonation', 'Write'],
  graphScopes: ['User.Read', 'User.Read.All'],
  autoSignIn: true,
  popupForLogin: false,
  cacheLocation: 'localStorage',
};
