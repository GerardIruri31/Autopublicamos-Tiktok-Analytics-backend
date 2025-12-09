import React, { useState, useRef } from "react";

import { useNavigate } from "react-router-dom"; // Importa useNavigate
import "./Login.css";
import InputField from "./InputField";
import clickSound from "../Sounds/clicksound.mp3"; // Asegúrate de tener este archivo en la carpeta src

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Declara navigate

  const handleSubmit = (e) => {
    playSound();
    e.preventDefault();
    console.log("Email:", email, "Password:", password);

    // Aquí puedes agregar lógica para autenticación

    navigate("/home"); // Redirige a HomeScreen después de iniciar sesión
  };

  // Sonidos al hacer clic
  const audioRef = useRef(new Audio(clickSound));
  const playSound = () => {
    audioRef.current.volume = 0.5; // 🎚 Ajusta el volumen (0.0 - 1.0)
    audioRef.current.loop = false; // 🔄 Evita que el sonido se repita automáticamente
    audioRef.current.currentTime = 0; // ⏪ Reinicia el audio en cada clic para evitar retrasos
    audioRef.current.play();
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <h1>Sign In</h1>
        <p>Login to your Account</p>
      </header>
      <form className="login-form" onSubmit={handleSubmit}>
        <InputField
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button">
          Sign In
        </button>
      </form>
      <footer className="login-footer">
        <p>
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
      </footer>
    </div>
  );
};

export default SignIn;
