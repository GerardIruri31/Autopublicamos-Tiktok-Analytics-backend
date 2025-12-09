import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { msalConfig, loginRequest } from "./authConfig";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

const msalInstance = new PublicClientApplication(msalConfig);
const root = ReactDOM.createRoot(document.getElementById("root"));

msalInstance
  .handleRedirectPromise()
  .then((response) => {
    if (response?.account) {
      msalInstance.setActiveAccount(response.account);
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }

    const active = msalInstance.getActiveAccount();

    // ✅ Si NO hay cuenta activa → login B2C
    if (!active) {
      msalInstance.loginRedirect(loginRequest);
      return;
    }

    // ✅ Si ya está logueado → renderizamos app
    root.render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("❌ Error en handleRedirectPromise:", error);

    // ⛔ Si el usuario canceló el login (AADB2C90091), volvemos a mostrar login
    if (error.errorMessage && error.errorMessage.includes("AADB2C90091")) {
      console.warn("🔁 Usuario canceló el login, redirigiendo nuevamente...");
      msalInstance.loginRedirect(loginRequest);
    }
  });
