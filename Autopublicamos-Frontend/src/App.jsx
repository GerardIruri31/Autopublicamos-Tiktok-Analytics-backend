import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InteractionStatus } from "@azure/msal-browser";

//import SignIn from "./Components/SignIn";
//import SignUp from "./Components/SignUp";

import HomeScreen from "./Components/HomeScreen";
import APICall from "./Components/APICall";
import DataBaseQueries from "./Components/DataBaseQueries";
import DataMaintenance from "./Components/DataMaintenance";
import PaGraphs from "./Components/PaGraphs";
import AuthorGraphs from "./Components/AuthorGraphs";
import AnalystHomeScreen from "./Components/AnalystHomeScreen";
import BookGraphs from "./Components/BookGraphs";

import "./App.css";

// 🔐 Componente de ruta privada que redirige al login de B2C si no está logueado
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  useEffect(() => {
    if (!isAuthenticated) {
      instance.loginRedirect(loginRequest); // Redirige al login de B2C
    }
  }, [isAuthenticated, instance]);

  return isAuthenticated ? children : null;
};

const RedirectToLogin = () => {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      const allAccounts = instance.getAllAccounts();
      // Si no hay cuenta activa pero sí cuentas, activamos una
      if (!instance.getActiveAccount() && allAccounts.length > 0) {
        instance.setActiveAccount(allAccounts[0]);
      }

      const account = instance.getActiveAccount();

      if (isAuthenticated && account?.idTokenClaims) {
        const rol = account?.idTokenClaims?.jobTitle
          ? account.idTokenClaims.jobTitle.toLowerCase()
          : "null";

        //console.log("Valores: ", account.idTokenClaims)
        //console.log("Rol: " + rol);

        if (rol === "admin") {
          navigate("/home");
        } else if (rol === "analyst") {
          navigate("/home-analyst");
        } else if (rol == "null") {
          navigate("/home-analyst"); // fallback en caso no tenga rol
        } else {
          navigate("/home-analyst");
        }
      } else {
        const cameFromRedirect = !!window.location.hash;

        if (!cameFromRedirect) {
          instance.loginRedirect(loginRequest);
        }
      }
    }
  }, [instance, inProgress, isAuthenticated, navigate]);

  return <div>Redirigiendo a Azure B2C ...</div>;
};

const UserWrapper = () => {
  const { instance } = useMsal();
  const account = instance.getActiveAccount();

  const rol = account?.idTokenClaims?.jobTitle;
  const email = account?.idTokenClaims?.emails?.[0];
  const nombre = account?.idTokenClaims?.given_name;
  return <HomeScreen rol={rol} email={email} name={nombre} />;
};

const AnalystWrapper = () => {
  const { instance } = useMsal();
  const account = instance.getActiveAccount();
  const rol = account?.idTokenClaims?.jobTitle;
  const email = account?.idTokenClaims?.emails?.[0];
  const nombre = account?.idTokenClaims?.given_name;
  return <AnalystHomeScreen rol={rol} email={email} name={nombre} />;
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<RedirectToLogin />} />
          {/* <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} /> */}
          <Route
            path="/home-analyst"
            element={
              <PrivateRoute>
                <AnalystWrapper />
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <UserWrapper />
              </PrivateRoute>
            }
          />
          <Route
            path="/tiktok-api-call"
            element={
              <PrivateRoute>
                <APICall />
              </PrivateRoute>
            }
          />
          <Route
            path="/database-queries"
            element={
              <PrivateRoute>
                <DataBaseQueries />
              </PrivateRoute>
            }
          />
          <Route
            path="/data-maintenance"
            element={
              <PrivateRoute>
                <DataMaintenance />
              </PrivateRoute>
            }
          />
          <Route
            path="/pa-graphs"
            element={
              <PrivateRoute>
                <PaGraphs />
              </PrivateRoute>
            }
          />
          <Route
            path="/author-graphs"
            element={
              <PrivateRoute>
                <AuthorGraphs />
              </PrivateRoute>
            }
          />
          <Route
            path="/book-graphs"
            element={
              <PrivateRoute>
                <BookGraphs />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
