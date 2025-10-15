const baseApiUrl = 'https://tcoacd-acd-dev-backend.azurewebsites.net';

export const environment = {
  production: true,
  apiBaseUrl: `${baseApiUrl}/api`,
  baseApiURL: baseApiUrl,
  baseURLScope: 'https://tcoacd-dev.azure.chevron.com/Read',
  redirectUri:
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '',
  instance: 'https://login.microsoftonline.com/',
  tenantId: 'fd799da1-bfc1-4234-a91c-72b3a1cb9e26',
  clientId: '688a6d31-fc3c-4353-867d-95cdd927825c',
  oidcScopes: ['Read', 'user_impersonation', 'Write'],
  graphScopes: ['User.Read', 'User.Read.All'],
  autoSignIn: true,
  popupForLogin: false,
  cacheLocation: 'localStorage',
};
