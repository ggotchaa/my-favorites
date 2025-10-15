export const environment = {
  production: true,
  einvoicingApiUrl: "https://einvo-dev-be-cvx.azurewebsites.net",
  cal: {
    autoSignIn: false,
    popupForLogin: false,
    instance: "https://login.microsoftonline.com/",
    tenantId: "fd799da1-bfc1-4234-a91c-72b3a1cb9e26",
    graphScopes: ["User.Read", "Directory.Read.All"],

    clientId: "753eb40e-b70a-4d19-8bec-349b932ca832",
    oidcScopes: ["https://tcosnt.azure.chevron.com/user_impersonation"],
    redirectUri: "https://finportal.tengizchevroil.com",
    sntApiUrl: "https://tcosnt-prod-core-cvx.azurewebsites.net",
    cacheLocation: "localStorage"
  }
};
