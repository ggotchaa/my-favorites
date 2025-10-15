export const environment = {
  production: false,
  baseApiURL: 'https://tcoacd-acd-test-backend.azurewebsites.net',
  baseURLScope: 'https://tcoacd-test.azure.chevron.com/user_impersonation',
  redirectUri: window.location.origin,
  instance: 'https://login.microsoftonline.com/',
  tenantId: 'fd799da1-bfc1-4234-a91c-72b3a1cb9e26',
  clientId: 'd4d6f04b-c317-47ee-ac32-60422ccbe7f5',
  oidcScopes: ['openid', 'profile', 'email', 'User.Read', 'offline_access'],
  graphScopes: ['User.Read', 'User.Read.All'],
  roles: {
    "AcdIMSupervisor": "tco-acd-admin",
    "AcdApprover": "tco-acd-approver",
    "AcdImConsultant": "tco-acd-im-consultant",
    "AcdRequestor": "tco-acd-requestor"
  }
};
