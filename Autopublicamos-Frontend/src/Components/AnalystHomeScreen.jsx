import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AnalystHomeScreen.css";
import clickSound from "../Sounds/clicksound.mp3"; // Asegúrate de tener este archivo en la carpeta src
import { useMsal } from "@azure/msal-react";

const HomeScreen = ({ rol, email, name }) => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleSelectChange = (event) => {
    playSound();
    const selectedValue = event.target.value;
    if (selectedValue === "logout") {
      instance.logoutRedirect(); // 🔐 Cierra sesión con Azure B2C
    }
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
    <div className="home-container">
      <header className="home-header">
        <div className="logo-container77">
          <h1>WELCOME TO HOMESCREEN</h1>
          <img
            src="https://www.autopublicamos.com/wp-content/uploads/2022/08/logo-Autopublicamos-white.png"
            alt="Logo Autopublicamos"
            className="logo77"
          />
        </div>
        <div className="user-dropdown">
          <select onChange={handleSelectChange}>
            <option value="usuario">{name}</option>
            <option value="logout">LOGOUT</option>
          </select>
        </div>
      </header>

      <main className="home-main">
        <div className="image-placeholder77">
          <img
            src="https://billiken.lat/wp-content/uploads/2023/07/Number-of-Books-Published-Per-Year.jpg"
            alt="Placeholder"
            className="placeholder77"
          />
        </div>

        <div className="buttons-grid77">
          <button
            className="home-button77"
            onClick={() => {
              navigate("/book-graphs");
              playSound();
            }}
          >
            <span className="icono-grande77">menu_book</span> Book Graphs
          </button>
          <button
            className="home-button77"
            onClick={() => {
              navigate("/author-graphs");
              playSound();
            }}
          >
            <span className="icono-grande77">bar_chart</span> Author Graphs
          </button>

          <button
            className="home-button77"
            onClick={() => {
              navigate("/pa-graphs");
              playSound();
            }}
          >
            <span className="icono-grande77">insights</span> PA Graphs
          </button>

          {/*<button
            className="home-button"
            onClick={() => {
              navigate("/tiktok-api-call");
              playSound();
            }}
          >
            <span className="material-icons">cloud</span> TikTok API Call
          </button>*/}

          <button
            className="home-button77"
            onClick={() => {
              navigate("/database-queries");
              playSound();
            }}
          >
            <span className="icono-grande77">storage</span> Database Queries
          </button>
          {/*<button
            className="home-button full-width-button"
            onClick={() => {
              navigate("/data-maintenance");
              playSound();
            }}
          >
            <span className="material-icons">build</span> Data Maintenance
          </button>*/}
        </div>
      </main>

      <footer className="home-footer">
        <span className="material-icons social-icon">camera_alt</span>{" "}
        {/* Instagram */}
        <a
          href="https://www.youtube.com/@Autopublicamos"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="material-icons social-icon">ondemand_video</span>{" "}
          {/* YouTube */}
        </a>
        <a
          href="https://www.instagram.com/autopublicamos/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-instagram social-icon"></i>
          {/* Instagram */}
        </a>
      </footer>
    </div>
  );
};

export default HomeScreen;
