// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { Config } from "node_modules/@cvx/cal/lib-commonjs/interfaces/Config";

export const environment = {
  production: false,
  einvoicingApiUrl: "https://einvo-dev-be-cvx.azurewebsites.net",
  cal: {
    autoSignIn: false,
    popupForLogin: false,
    instance: "https://login.microsoftonline.com/",
    tenantId: "fd799da1-bfc1-4234-a91c-72b3a1cb9e26",
    graphScopes: ["User.Read", "Directory.Read.All"],

    clientId: "7d94817b-e9c1-48e6-a007-7065b4db87b6",
    oidcScopes: ["https://tcosnt-test.tengizchevroil.com/user_impersonation"],
    redirectUri: "https://finportal-dev.tengizchevroil.com",
    sntApiUrl: "https://tcosnt-dev-core-cvx.azurewebsites.net",
    cacheLocation: "localStorage"
  } as Config
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */