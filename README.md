src/

# 🅰️ CAL Angular Example

## Overview

This project is a comprehensive demonstration of integrating the Chevron Authentication Library (CAL) into an Angular 19 application. It covers authentication, route protection, role-based access, Azure AD token handling, and Microsoft Graph API usage. The example is designed to help developers quickly understand and implement CAL in their own Angular projects.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [App Routes](#app-routes)
- [Component Details](#component-details)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Features

### Authentication
- Sign In / Sign Out with Azure AD using CAL
- Reactive user state and claims via Angular Signals

### Authorization
- Route protection with `CalGuardService`
- Role-based guard with `RoleGuardService` (default role: `Testing.Read`)
- Azure AD group membership checks

### Microsoft Graph Integration
- Fetch user properties from Microsoft Graph
- Work with ID token claims and access tokens

---

## Project Structure

```
src/
├── app/
│   ├── app.component.*            # Main app component
│   ├── app.routes.ts              # Route definitions (guards, roles)
│   ├── components/
│   │   ├── signin-signout/        # Sign-in/out UI
│   │   ├── cal-guard/             # Auth-protected route
│   │   ├── role-guard/            # Role-protected route
│   │   ├── user-info/             # User claims/profile
│   │   ├── ms-graph/              # Microsoft Graph demo
│   │   ├── check-aad-group/       # AAD group membership check
│   │   └── aad-token/             # Token/claims demo
│   ├── services/
│   │   └── auth-state-signals.service.ts # Signals-based auth state
├── assets/
│   └── config.json            # CAL/MSAL config (runtime override)
└── main.ts                        # App bootstrap & config loader
```

---

## Configuration

Configuration is loaded at runtime from `src/assets/config.json` by `CalConfigService` before bootstrapping the app. This allows pipeline deployments to override settings easily.

**Sample `config.json`:**

```json
{
	"autoSignIn": false,
	"popupForLogin": true,
	"cacheLocation": "localStorage",
	"instance": "https://login.microsoftonline.com/",
	"tenantId": "<your-tenant-id>",
	"clientId": "<your-client-id>",
	"redirectUri": "http://localhost:4200",
	"oidcScopes": ["openid", "profile", "offline_access", "User.Read"],
	"graphScopes": ["User.Read", "User.Read.All"]
}
```

**Key Settings:**
- `autoSignIn`: Automatically sign in users on load
- `popupForLogin`: Use popup for login (vs. redirect)
- `cacheLocation`: Where to store tokens
- `instance`: Azure AD authority base URL
- `tenantId`: Azure AD tenant ID
- `clientId`: App registration client ID
- `redirectUri`: Redirect URL after login
- `oidcScopes`: OIDC scopes for authentication
- `graphScopes`: Microsoft Graph API scopes

**Role Guard:**
The default role for `RoleGuardService` is `Testing.Read`. Update this in `app.routes.ts` or assign the role to your users in Azure AD.

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- Angular CLI
- Azure AD application registration (with redirect URI and scopes)

### Installation & Running

1. **Install dependencies:**
	 ```cmd
	 npm install
	 ```
2. **Configure Azure AD:**
	 - Update `src/assets/config.json` with your Azure AD details (`clientId`, `tenantId`, `redirectUri`, scopes, etc.)
3. **Start the development server:**
	 ```cmd
	 npm start
	 ```
	 or
	 ```cmd
	 ng serve
	 ```
4. **Open your browser:**
	 - Navigate to [http://localhost:4200](http://localhost:4200)

---

## App Routes

| Path              | Component              | Guard/Role         |
|-------------------|-----------------------|--------------------|
| `/signin-signout` | SigninSignoutComponent| None               |
| `/cal-guard`      | CalGuardComponent     | Auth required      |
| `/role-guard`     | RoleGuardComponent    | Role: Testing.Read |
| `/user-info`      | UserInfoComponent     | None               |
| `/ms-graph`       | MsGraphComponent      | None               |
| `/check-aad-group`| CheckAadGroupComponent| None               |
| `/aad-token`      | AadTokenComponent     | None               |

Default route redirects to `/signin-signout`.

---

## Component Details

- **Signin/Signout:** Uses `AuthStateSignalsService` for reactive authentication state. Methods: `signIn()`, `signOut()`.
- **CAL Guard:** Protects routes requiring authentication (`CalGuardService`).
- **Role Guard:** Protects routes requiring specific roles (`RoleGuardService`).
- **User Info:** Displays current user claims and profile information.
- **MS Graph:** Fetches user properties from Microsoft Graph (e.g., department, mail, country).
- **AAD Token:** Demonstrates ID token claims, AAD token retrieval, and access token usage.
- **AAD Group Check:** Verifies Azure AD group membership.

---

## Scripts

- `npm start` — Start the development server
- `npm run build` — Build for production
- `npm test` — Run unit tests
- `npm run lint` — Lint the codebase

---

## Dependencies

- `@cvx/cal-angular` — CAL integration for Angular
- `@cvx/nextpage` — Chevron header/footer UI components
- `@angular/*` — Angular 19 framework
- `@angular/material` — Material UI (optional)

---

## Troubleshooting

- **Login issues:**
	- Double-check your Azure AD `clientId`, `tenantId`, and `redirectUri` in `config.json`.
	- Ensure your app registration has the correct redirect URI and API permissions.
- **Role-based access not working:**
	- Make sure users are assigned the required app role in Azure AD.
	- Update the `roles` array in `app.routes.ts` if needed.
- **Graph API errors:**
	- Verify that the required scopes are granted and consented in Azure AD.
- **Token issues:**
	- Check browser storage settings (`cacheLocation`).

---

## Resources

- [CAL Angular Examples (Azure DevOps Repo)](https://dev.azure.com/chevron/ITC-APES-Components/_git/CAL-Examples?path=/CalExamples/Angular&version=GBdev)
- [CAL Documentation: Using CAL in Angular](https://cdas.azure.chevron.com/itc-apes-components.wiki/CAL-Wiki/Using-CAL-in-Angular.html)

