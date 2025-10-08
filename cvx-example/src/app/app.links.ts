export interface ExternalLink {
  url: string;
  text: string;
}

export interface InternalLink {
  route: string;
  text: string;
}

export const EXTERNAL_LINKS: Record<string, ExternalLink> = {
  calExampleBranch: {
    url: 'https://dev.azure.com/chevron/ITC-APES-Components/_git/CAL-Examples?path=/CalExamples/Angular&version=GBdev',
    text: '🔗cal-example-branch'
  },
  autoSignInGuide: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/User-Sign-In-Strategies.html#auto-sign-in',
    text: '🔗Auto Sign-In Guide'
  },
  linkPlaceHolder: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular.html',
    text: '🚧 Feature not yet implemented. Currently under development. Please check back later.'
  },
  userSignInStrategies: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/User-Sign-In-Strategies.html',
    text: '🔗User Sign-In Strategies'
  },
  calAngularConfiguration: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Configuration.html',
    text: '🔗CAL Angular Configuration'
  },
  calGuard: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Using-the-CAL-Guard.html',
    text: '🔗Using the CAL Guard'
  },
  roleGuard: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Using-the-Role-Guard.html',
    text: '🔗Using the Role Guard'
  },
  getAccount: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Retrieving-Data-from-an-API.html#getaccount',
    text: '🔗getAccount()'
  },
  cvxClaimsPrincipal: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Using-the-CvxClaimsPrincipal.html#example-accessing-user-claims-with-cvxclaimsprincipal',
    text: '🔗Accessing User Claims with cvxClaimsPrincipal'
  },
  getClaims: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Using-the-CvxClaimsPrincipal.html#example-fetching-latest-user-claims-with-getclaims',
    text: '🔗Fetching Latest User Claims with getClaims()'
  },
  msGraph: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Retrieving-Data-from-Microsoft-Graph.html',
    text: '🔗Retrieving Data from Microsoft Graph'
  },
  groupCheck: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/User-Sign-In-Strategies.html#azure-ad-group-checking-for-custom-authorization',
    text: '🔗Azure AD Group Checking for Custom Authorization'
  },
  getIdTokenClaims: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Retrieving-Data-from-an-API.html#getidtokenclaims',
    text: '🔗getIdTokenClaims()'
  },
  getAccessTokenFromCache: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Retrieving-Data-from-an-API.html#getaccesstokenfromcache',
    text: '🔗getAccessTokenFromCache()'
  },
  getAADToken: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Retrieving-Data-from-an-API.html#getaadtoken',
    text: '🔗getAADToken()'
  },
  getAADTokenMsGraphApi: {
    url: 'https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular/Retrieving-Data-from-an-API.html#call-microsoft-graph-api-using-getaadtoken',
    text: '🔗Call Microsoft Graph API using getAADToken'
  }
};

export const INTERNAL_LINKS: Record<string, InternalLink> = {
  authentication: {
    route: '/signin-signout',
    text: 'Authentication'
  }
};
