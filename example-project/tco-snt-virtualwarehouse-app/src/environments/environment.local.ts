export const environment = {
  production: true,
  einvoicingApiUrl: "https://einvo-dev-be-cvx.azurewebsites.net",
  cal: {
    autoSignIn: false,
    popupForLogin: false,
    instance: "https://login.microsoftonline.com/",
    tenantId: "fd799da1-bfc1-4234-a91c-72b3a1cb9e26",
    graphScopes: ["User.Read", "Directory.Read.All"],

    clientId: "7d94817b-e9c1-48e6-a007-7065b4db87b6",
    oidcScopes: ["https://tcosnt-test.tengizchevroil.com/user_impersonation"],
    redirectUri: "http://localhost:4200",
    sntApiUrl: "https://localhost:5001",
    cacheLocation: "localStorage"
  }
};
