// Components/SignUp.jsx
import React, { useState, useRef } from "react";

import { useNavigate } from "react-router-dom"; // Importa useNavigate
import InputField from "./InputField";
import "./Login.css";
import clickSound from "../Sounds/clicksound.mp3"; // Asegúrate de tener este archivo en la carpeta src

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  //const [paternalSurname, setPaternalSurname] = useState("");
  //const [maternalSurname, setMaternalSurname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate(); // Hook para navegar

  // Sonidos al hacer clic
  const audioRef = useRef(new Audio(clickSound));
  const playSound = () => {
    audioRef.current.volume = 0.5; // 🎚 Ajusta el volumen (0.0 - 1.0)
    audioRef.current.loop = false; // 🔄 Evita que el sonido se repita automáticamente
    audioRef.current.currentTime = 0; // ⏪ Reinicia el audio en cada clic para evitar retrasos
    audioRef.current.play();
  };

  const handleSubmit = (e) => {
    playSound();
    e.preventDefault();
    // validar las contraseñas y enviar los datos
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Name:", name, "Email:", email, "Password:", password);
    // agregar lógica para registrar al usuario
    navigate("/home"); // Redirige a HomeScreen después de registrarse
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <h1>Sign Up</h1>
        <p>Create user to Sign In</p>
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
          type="text"
          id="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {/*<InputField
          type="text"
          id="paternalSurname"
          placeholder="Paternal Surname"
          value={paternalSurname}
          onChange={(e) => setPaternalSurname(e.target.value)}
        />
        <InputField
          type="text"
          id="maternalSurname"
          placeholder="Maternal Surname"
          value={maternalSurname}
          onChange={(e) => setMaternalSurname(e.target.value)}
        />*/}
        <InputField
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          type="password"
          id="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="login-button">
          Sign Up
        </button>
      </form>
      <footer className="login-footer">
        <p>
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </footer>
    </div>
  );
};
export default SignUp;
