import ReactDOM from "react-dom/client";
import { Provider as StoreProvider } from "react-redux";
import { HashRouter as Router } from "react-router-dom";
import { InteractionType, PublicClientApplication } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import reportWebVitals from "./reportWebVitals";

import { loginRequest, msalConfig } from "./api/auth";
import store from "./store/store";
import "../src/global.css";
import { App } from "./components/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
const msalInstance = new PublicClientApplication(msalConfig);

root.render(
  <StoreProvider store={store}>
    <Router>
      <MsalProvider instance={msalInstance}>
        <MsalAuthenticationTemplate
          interactionType={InteractionType.Redirect}
          authenticationRequest={loginRequest}
        >
          <App />
        </MsalAuthenticationTemplate>
      </MsalProvider>
    </Router>
  </StoreProvider>
);

reportWebVitals();
