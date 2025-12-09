import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DataBaseQueries.css";
import clickSound from "../Sounds/clicksound.mp3"; // Asegúrate de tener este archivo en la carpeta src
import { useMsal } from "@azure/msal-react";

const DataBaseQueries = () => {
  const { instance } = useMsal();

  const [userRol, setUserRol] = useState("");
  useEffect(() => {
    const account = instance.getActiveAccount();
    const rol = account?.idTokenClaims?.jobTitle
      ? account.idTokenClaims.jobTitle.toLowerCase()
      : "null";
    setUserRol(rol);
  }, [instance]);
  const navigate = useNavigate();
  // 🔹 Estados para cada filtro
  const [postDateFrom, setPostDateFrom] = useState("");
  const [postDateTo, setPostDateTo] = useState("");
  const [trackingDateFrom, setTrackingDateFrom] = useState("");
  const [trackingDateTo, setTrackingDateTo] = useState("");
  const [author, setAuthor] = useState("");
  const [book, setBook] = useState("");
  const [publisher, setPublisher] = useState("");
  const [sceneCode, setSceneCode] = useState("");
  const [postType, setPostType] = useState("");
  const [tikTokUsername, setTikTokUsername] = useState("");
  const [postID, setpostID] = useState("");
  const [region, setRegion] = useState("");
  const [viewsRange, setViewsRange] = useState({ min: "", max: "" });
  const [LikesRange, setLikesRange] = useState({ min: "", max: "" });
  const [SavesRange, setSavesRange] = useState({ min: "", max: "" });
  const [engagement, setEngagement] = useState({ min: "", max: "" });
  const [interactions, setInteractions] = useState({ min: "", max: "" });

  // 🔹 Estados para el manejo de datos y resultados
  const [records, setRecords] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [buttonText, setButtonText] = useState("Initiate Database Query");
  const [log, setLog] = useState([]);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  // Sonidos al hacer clic
  const audioRef = useRef(new Audio(clickSound));
  const playSound = () => {
    audioRef.current.volume = 0.5; // 🎚 Ajusta el volumen (0.0 - 1.0)
    audioRef.current.loop = false; // 🔄 Evita que el sonido se repita automáticamente
    audioRef.current.currentTime = 0; // ⏪ Reinicia el audio en cada clic para evitar retrasos
    audioRef.current.play();
  };

  // Variable que determina CLICK EN BOTÓN
  const [buttonClick, setButtonClick] = useState("");
  const [buttonConcisoDisable, setButtonConcisoDisable] = useState(false);
  const [buttonConcisoText, setButtonConcisoText] = useState(
    "Initiate Short Report"
  );

  const [buttonScoreDisable, setButtonScoreDisable] = useState(false);
  const [buttonScoreText, setButtonScoreText] = useState(
    "Initiate Score Scenes"
  );

  const defaultColumns = [
    "Post Code",
    "Author Name",
    "Book Name",
    "Number of Scene",
    "Scene Name",
    "Post Type",
    "PA Name",
    "Date Posted",
    "Time Posted",
    "TikTok Username",
    "Post URL",
    "Views",
    "Likes",
    "Comments",
    "Reposted",
    "Saves",
    "Engagement Rate",
    "Interactions",
    "Hashtags",
    "# of Hashtags",
    "Sound URL",
    "Region of Posting",
    "Tracking Date",
    "Tracking Time",
    "Logged-in User",
  ];

  const conciseColumns = [
    "Author Name",
    "Book Name",
    "Scene Name",
    "Post Type",
    "Date Posted",
    "Time Posted",
    "TikTok Username",
    "Post URL",
    "Views",
    "Likes",
    "Comments",
    "Reposted",
    "Saves",
    "Engagement Rate",
    "Interactions",
    "Hashtags",
    "# of Hashtags",
    "Sound URL",
  ];

  const scoreSceneColumns = [
    "Author Name",
    "Book Name",
    "Number of Scene",
    "Scene Name",
    "Scene Score",
    "View Average",
    "Interaction Average",
  ];

  // Luego, en el JSX, antes de return:
  const columns =
    buttonClick === "conciso"
      ? conciseColumns
      : buttonClick === "scoreScene"
      ? scoreSceneColumns
      : defaultColumns;

  // 🔹 Manejo de la consulta a BD
  const handleDBQuery = async (reportType) => {
    if (!postDateFrom || !postDateTo) {
      alert("⚠️ All Posted Date fields are required!");
      return; // Detiene la ejecución si hay campos vacíos
    }

    const FechaPostDateFrom = new Date(postDateFrom);
    const FechaPostDateTo = new Date(postDateTo);

    // Validamos si la fecha inicial es mayor que la final
    if (FechaPostDateFrom > FechaPostDateTo) {
      alert(
        "⚠️ The 'From' Posted Date must be earlier than the 'To' Posted date."
      );
      return;
    }

    if (!trackingDateFrom !== !trackingDateTo) {
      alert("⚠️ Now All Tracking Date fields are required!");
      return;
    }

    if (trackingDateFrom && trackingDateTo) {
      const FechaTrackingFrom = new Date(trackingDateFrom);
      const FechaTrackingTo = new Date(trackingDateTo);
      if (FechaTrackingFrom > FechaTrackingTo) {
        alert(
          "⚠️ The 'From' Tracking Date must be earlier than the 'To' Tracking date."
        );
        return;
      }
    }

    // Confirmaciones dobles
    if (
      window.confirm("🚨 Are you sure you want to start the Database Query?")
    ) {
      setLog([]); // Limpia el log de mensajes
      setRecords([]); // Limpia los registros anteriores
      setDataLoaded(false);
      setButtonDisable(true);
      setButtonConcisoDisable(true);
      setButtonScoreDisable(true);
      setIsLoading(true);
      const startTime = new Date();

      setLog((prevLog) => [
        ...prevLog,
        `📅 ${startTime.toLocaleString()} | Starting request to the APIRest...`,
      ]);

      const requestBody = {
        PubStartDate: postDateFrom,
        PubFinishtDate: postDateTo,
        TrackStartDate: trackingDateFrom,
        TrackFinishtDate: trackingDateTo,
        AuthorList: author
          ? author
              .split(",")
              .map((item) => item.trim().toUpperCase())
              .filter(Boolean)
          : [],
        BookList: book
          ? book
              .split(",")
              .map((item) => item.trim().toUpperCase())
              .filter(Boolean)
          : [],
        PAList: publisher
          ? publisher
              .split(",")
              .map((item) => item.trim().toUpperCase())
              .filter(Boolean)
          : [],
        SceneList: sceneCode
          ? sceneCode
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        typePostList: postType
          ? postType
              .split(",")
              .map((item) => item.trim().toLowerCase())
              .filter(Boolean)
          : [],
        AccountList: tikTokUsername
          ? tikTokUsername
              .split(",")
              .map((item) => item.trim().toLowerCase())
              .filter(Boolean)
          : [],
        PostIDList: postID
          ? postID
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        RegionList: region
          ? region
              .split(",")
              .map((item) => item.trim().toUpperCase())
              .filter(Boolean)
          : [],
        viewsMin: viewsRange.min,
        viewsMax: viewsRange.max,
        likesMin: LikesRange.min,
        likesMax: LikesRange.max,
        savesMin: SavesRange.min,
        savesMax: SavesRange.max,
        EngagementMin: engagement.min,
        EngagementMax: engagement.max,
        InteractionMin: interactions.min,
        InteractionMax: interactions.max,
      };

      setLog((prevLog) => [
        ...prevLog,
        "🔄 Connecting to the PostgreSQL Database on the Azure Service",
      ]);
      // CREAR VARIABLE QUE DISTINGA CLICK EN BOTONES

      if (reportType == "conciso") {
        try {
          console.log(
            "🚀 Starting query to the database with data (DataBaseQueries - SHORT REPORT):",
            requestBody
          );
          setButtonConcisoText("Database Query in Progress..."); // Cambia el texto mientras se ejecuta
          //const azureURL = "http://localhost:8080";
          //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
          const azureURL = import.meta.env.VITE_AZURE_API_URL;
          const response = await fetch(azureURL + "/databasequery/conciso", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            alert(`❌ Server responded with status ${response.status}`);
            throw new Error(`Server responded with status ${response.status}`);
          }

          setLog((prevLog) => [
            ...prevLog,
            "📥 Successful responde from Database Query. Processing data ...",
          ]);

          const data = await response.json();
          console.log("API Response (DatabaseQueries - SHORT REPORT):", data);
          const filteredData = data.map((record) => ({
            "Author Name": record["Author name"] || "Not found: N/A",
            "Book Name": record["Book name"] || "Not found: N/A",
            "Scene Name": record["Scene name"] || "Not found: N/A",
            "Post Type": record["Post Type"] || "Not found: N/A",
            "Date Posted": record["Date posted"] || "Not found: N/A",
            "Time Posted": record["Time posted"] || "Not found: N/A",
            "TikTok Username": record["TikTok Username"] || "Not found: N/A",
            "Post URL": record["Post URL"] || "Not found: N/A",
            Views: record["Views"] || 0,
            Likes: record["Likes"] || 0,
            Comments: record["Comments"] || 0,
            Reposted: record["Reposted"] || 0,
            Saves: record["Saves"] || 0,
            "Engagement Rate":
              Math.round(record["Engagement rate"] * 100.0) / 100.0 || 0,
            Interactions: record["Interactions"] || 0,
            Hashtags: record["Hashtags"] || "Not found: N/A",
            "# of Hashtags": record["Number of Hashtags"] || 0,
            "Sound URL": record["Sound URL"] || "Not found: N/A",
          }));
          setRecords(filteredData);
          const registrosProcesados = data.length;
          setLog((prevLog) => [
            ...prevLog,
            `📊 Amount of Records from Database Query Processed: ${registrosProcesados}`,
          ]);
          const endTime = new Date();
          const durationInSeconds = Math.floor((endTime - startTime) / 1000); // 🔹 Convertimos a segundos enteros
          const minutes = Math.floor(durationInSeconds / 60); // 🔹 Extraemos los minutos
          const seconds = durationInSeconds % 60; // 🔹 Extraemos los segundos restantes
          const formattedTime = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`; // 🔹 Formateamos el tiempo

          setLog((prevLog) => [
            ...prevLog,
            `⏳ Total function execution time: ${formattedTime} minutes`,
          ]);
          if (data.length > 0) {
            setLog((prevLog) => [
              ...prevLog,
              `✅ Server is ready for downloading the generated Excel file`,
            ]);
          } else {
            setLog((prevLog) => [
              ...prevLog,
              `❌ Execution not completed. No data available`,
            ]);
          }

          setDataLoaded(true);
        } catch (error) {
          console.error(
            "❌ Error fetching data from DB (DatabaseQueries - REPORTE CONCISO):",
            error
          );
          alert("❌ Failed to fetch data from DB.");
        } finally {
          setIsLoading(false);
          setButtonDisable(false);
          setButtonConcisoText("Initiate Short Report");
        }
      } else if (reportType == "scoreScene") {
        try {
          console.log(
            "🚀 Starting query to the database with data (DataBaseQueries - SCORE SCENE):",
            requestBody
          );
          setButtonScoreText("Database Query in Progress..."); // Cambia el texto mientras se ejecuta

          //const azureURL = "http://localhost:8080";
          //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
          const azureURL = import.meta.env.VITE_AZURE_API_URL;
          const response = await fetch(azureURL + "/databasequery/scorescene", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            alert(`❌ Server responded with status ${response.status}`);
            throw new Error(`Server responded with status ${response.status}`);
          }

          setLog((prevLog) => [
            ...prevLog,
            "📥 Successful responde from Database Query. Processing data ...",
          ]);

          const data = await response.json();
          console.log("API Response (DatabaseQueries - SCORE SCENE):", data);
          const filteredData = data.map((record) => ({
            "Author Name": record["author_name"] || "Not found: N/A",
            "Book Name": record["book"] || "Not found: N/A",
            "Number of Scene": record["scene_code"] || "Not found: N/A",
            "Scene Name": record["scene"] || "Not found: N/A",
            "Scene Score": record["score_scene"] || "Not found: N/A",
            "View Average": record["promviews"] || "Not found: N/A",
            "Interaction Average":
              record["prominteracciones"] || "Not found: N/A",
          }));
          setRecords(filteredData);
          const registrosProcesados = data.length;
          setLog((prevLog) => [
            ...prevLog,
            `📊 Amount of Records from Database Query Processed: ${registrosProcesados}`,
          ]);
          const endTime = new Date();
          const durationInSeconds = Math.floor((endTime - startTime) / 1000); // 🔹 Convertimos a segundos enteros
          const minutes = Math.floor(durationInSeconds / 60); // 🔹 Extraemos los minutos
          const seconds = durationInSeconds % 60; // 🔹 Extraemos los segundos restantes
          const formattedTime = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`; // 🔹 Formateamos el tiempo

          setLog((prevLog) => [
            ...prevLog,
            `⏳ Total function execution time: ${formattedTime} minutes`,
          ]);
          if (data.length > 0) {
            setLog((prevLog) => [
              ...prevLog,
              `✅ Server is ready for downloading the generated Excel file`,
            ]);
          } else {
            setLog((prevLog) => [
              ...prevLog,
              `❌ Execution not completed. No data available`,
            ]);
          }

          setDataLoaded(true);
        } catch (error) {
          console.error(
            "❌ Error fetching data from DB (DatabaseQueries - SCORE SCENES):",
            error
          );
          alert("❌ Failed to fetch data from DB.");
        } finally {
          setIsLoading(false);
          setButtonDisable(false);
          setButtonScoreText("Initiate Score Scenes");
        }
      } else {
        try {
          console.log(
            "🚀 Starting query to the database with data (DataBaseQueries - HandleDBQuery):",
            requestBody
          );
          setButtonText("Database Query in Progress..."); // Cambia el texto mientras se ejecuta
          //const azureURL = "http://localhost:8080";
          //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
          const azureURL = import.meta.env.VITE_AZURE_API_URL;
          const response = await fetch(azureURL + "/databasequery/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            alert(`❌ Server responded with status ${response.status}`);
            throw new Error(`Server responded with status ${response.status}`);
          }

          setLog((prevLog) => [
            ...prevLog,
            "📥 Successful responde from Database Query. Processing data ...",
          ]);

          const data = await response.json();
          console.log("API Response (DatabaseQueries - handleDBQuery):", data);
          const filteredData = data.map((record) => ({
            "Post Code": record["Post Code"] || "Not found: N/A",
            "Author Name": record["Author name"] || "Not found: N/A",
            "Book Name": record["Book name"] || "Not found: N/A",
            "Number of Scene": record["Number of Scene"] || "Not found: N/A",
            "Scene Name": record["Scene name"] || "Not found: N/A",
            "Post Type": record["Post Type"] || "Not found: N/A",
            "PA Name": record["PA name"] || "Not found: N/A",
            "Date Posted": record["Date posted"] || "Not found: N/A",
            "Time Posted": record["Time posted"] || "Not found: N/A",
            "TikTok Username": record["TikTok Username"] || "Not found: N/A",
            "Post URL": record["Post URL"] || "Not found: N/A",
            Views: record["Views"] || 0,
            Likes: record["Likes"] || 0,
            Comments: record["Comments"] || 0,
            Reposted: record["Reposted"] || 0,
            Saves: record["Saves"] || 0,
            "Engagement Rate":
              Math.round(record["Engagement rate"] * 100.0) / 100.0 || 0,
            Interactions: record["Interactions"] || 0,
            Hashtags: record["Hashtags"] || "Not found: N/A",
            "# of Hashtags": record["Number of Hashtags"] || 0,
            "Sound URL": record["Sound URL"] || "Not found: N/A",
            "Region of Posting": record["Region Code"] || "Not found: N/A",
            "Tracking Date": record["Tracking date"] || "Not found: N/A",
            "Tracking Time": record["Tracking time"] || "Not found: N/A",
            "Logged-in User": record["Logged-in User"] || "Not found: N/A",
          }));
          setRecords(filteredData);
          const registrosProcesados = data.length;
          setLog((prevLog) => [
            ...prevLog,
            `📊 Amount of Records from Database Query Processed: ${registrosProcesados}`,
          ]);
          const endTime = new Date();
          const durationInSeconds = Math.floor((endTime - startTime) / 1000); // 🔹 Convertimos a segundos enteros
          const minutes = Math.floor(durationInSeconds / 60); // 🔹 Extraemos los minutos
          const seconds = durationInSeconds % 60; // 🔹 Extraemos los segundos restantes
          const formattedTime = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`; // 🔹 Formateamos el tiempo

          setLog((prevLog) => [
            ...prevLog,
            `⏳ Total function execution time: ${formattedTime} minutes`,
          ]);
          if (data.length > 0) {
            setLog((prevLog) => [
              ...prevLog,
              `✅ Server is ready for downloading the generated Excel file`,
            ]);
          } else {
            setLog((prevLog) => [
              ...prevLog,
              `❌ Execution not completed. No data available`,
            ]);
          }

          setDataLoaded(true);
        } catch (error) {
          console.error(
            "❌ Error fetching data from DB (DatabaseQueries - handleDBQuery):",
            error
          );
          alert("❌ Failed to fetch data from DB.");
        } finally {
          setIsLoading(false);
          setButtonDisable(false);
          setButtonText("Initiate Database Query");
        }
      }
    }
  };

  // 🔹 Manejo de exportar a Excel
  const handleExportToExcel = async () => {
    if (!dataLoaded) {
      alert("⚠️ You must make the database query first.");
      return;
    }
    setIsLoadingExcel(true);
    try {
      //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
      //const azureURL = "http://localhost:8080";
      const azureURL = import.meta.env.VITE_AZURE_API_URL;
      const response = await fetch(azureURL + "/databasequery/download", {
        method: "GET",
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        mode: "cors", // 🔹 IMPORTANTE para evitar bloqueos CORS
      });
      if (!response.ok) throw new Error("Error al descargar el archivo");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      // Obtener la fecha y hora actual en el formato "yyyy-MM-dd_HH-mm-ss"
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        "-" +
        String(now.getMinutes()).padStart(2, "0") +
        "-" +
        String(now.getSeconds()).padStart(2, "0");
      const fileName = `filtros_tiktok_videos_${timestamp}.xlsx`; // Nombre generado en frontend
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      // Ejemplo de llamada a tu endpoint que genera un Excel
      // El nombre del archivo podría ser "DB_Query_2025-02-13_10-42-52.xlsx" etc.
      alert("✅ Excel File exported with success");
      console.log(
        "✅ Excel File exported with success (DataBaseQueries - handleExportExcel): " +
          fileName
      );
    } catch (error) {
      console.error(
        "❌ Error downloading the Excel File (DataBaseQueries): ",
        error
      );
      alert("❌ Error downloading the Excel File");
    } finally {
      setIsLoadingExcel(false);
    }
  };

  return (
    <div className="dbqueries-container">
      {/* Header */}
      <header className="dbqueries-header">
        <h1>DATABASE QUERIES</h1>
        <button
          className="return-button"
          onClick={() => {
            if (userRol == "admin") {
              navigate("/home");
            } else if (userRol == "analyst") {
              navigate("/home-analyst");
            } else if (userRol == "null") {
              navigate("/home-analyst"); // fallback en caso no tenga rol
            } else {
              navigate("/home-analyst");
            }
            playSound();
          }}
        >
          Return to Home Screen
        </button>
      </header>

      {/* Filtros */}
      <div className="dbqueries-filters">
        <div className="date-section">
          <div className="date-group">
            <label>Post Date (From - To):</label>
            <div className="date-range-container">
              <input
                type="date"
                value={postDateFrom}
                onChange={(e) => setPostDateFrom(e.target.value)}
              />
              <input
                type="date"
                value={postDateTo}
                onChange={(e) => setPostDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="date-group">
            <label>Tracking Date (From - To):</label>
            <div className="date-range-container">
              <input
                type="date"
                value={trackingDateFrom}
                onChange={(e) => setTrackingDateFrom(e.target.value)}
              />
              <input
                type="date"
                value={trackingDateTo}
                onChange={(e) => setTrackingDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Author Name:</label>
            <textarea
              type="text"
              placeholder="e.g Author1, Author2 .."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={{ textTransform: "uppercase" }}
            />
          </div>

          <div className="filter-group">
            <label>Book Name:</label>
            <textarea
              style={{ textTransform: "uppercase" }}
              type="text"
              placeholder="e.g. book1, book2 ..."
              value={book}
              onChange={(e) => setBook(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Publisher:</label>
            <textarea
              style={{ textTransform: "uppercase" }}
              type="text"
              placeholder="e.g. PA1, PA2 ..."
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Scene code:</label>
            <textarea
              type="text"
              placeholder="e.g. SC12a, BC07v1 ..."
              value={sceneCode}
              onChange={(e) => setSceneCode(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Post type:</label>
            <textarea
              style={{ textTransform: "lowercase" }}
              type="text"
              placeholder="e.g. a, b, c"
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>TikTok Username:</label>
            <textarea
              style={{ textTransform: "lowercase" }}
              type="text"
              placeholder="e.g. user1, user2 ..."
              value={tikTokUsername}
              onChange={(e) => setTikTokUsername(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Post ID:</label>
            <textarea
              type="text"
              placeholder="e.g. 7470954750, 7567654355"
              value={postID}
              onChange={(e) => setpostID(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Post Region:</label>
            <textarea
              style={{ textTransform: "uppercase" }}
              type="text"
              placeholder="e.g. us, pe ..."
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Views (min - max):</label>
            <div className="views-range">
              <input
                type="number"
                placeholder="min"
                min="1"
                value={viewsRange.min}
                onChange={(e) =>
                  setViewsRange({ ...viewsRange, min: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
              <input
                type="number"
                placeholder="max"
                min="1"
                value={viewsRange.max}
                onChange={(e) =>
                  setViewsRange({ ...viewsRange, max: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Likes (min - max):</label>
            <div className="likes-range">
              <input
                type="number"
                placeholder="min"
                min="1"
                value={LikesRange.min}
                onChange={(e) =>
                  setLikesRange({ ...LikesRange, min: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
              <input
                type="number"
                placeholder="max"
                min="1"
                value={LikesRange.max}
                onChange={(e) =>
                  setLikesRange({ ...LikesRange, max: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Saves (min - max):</label>
            <div className="saves-range">
              <input
                type="number"
                placeholder="min"
                min="1"
                value={SavesRange.min}
                onChange={(e) =>
                  setSavesRange({ ...SavesRange, min: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
              <input
                type="number"
                placeholder="max"
                min="1"
                value={SavesRange.max}
                onChange={(e) =>
                  setSavesRange({ ...SavesRange, max: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Engagement %:</label>
            <div className="engagement-range">
              <input
                type="number"
                placeholder="min"
                min="1"
                value={engagement.min}
                onChange={(e) =>
                  setEngagement({ ...engagement, min: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
              <input
                type="number"
                placeholder="max"
                min="1"
                value={engagement.max}
                onChange={(e) =>
                  setEngagement({ ...engagement, max: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Interactions:</label>
            <div className="interactions-range">
              <input
                type="number"
                placeholder="min"
                min="1"
                value={interactions.min}
                onChange={(e) =>
                  setInteractions({ ...interactions, min: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
              <input
                type="number"
                placeholder="max"
                min="1"
                value={interactions.max}
                onChange={(e) =>
                  setInteractions({ ...interactions, max: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "." || e.key === "," || e.key === "-") {
                    e.preventDefault(); // 🔹 Bloquea la tecla de punto y coma
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="dbquery-buttons-group">
          {/* Botón para reporte conciso */}
          <button
            className="dbquery-button"
            onClick={() => {
              setButtonClick("filter");
              handleDBQuery("filter");
              playSound();
            }}
            disabled={buttonDisable}
          >
            {buttonDisable ? buttonText : buttonText}
          </button>
          <button
            className="dbquery-button"
            onClick={() => {
              setButtonClick("conciso");
              handleDBQuery("conciso");
              playSound();
            }}
            disabled={buttonDisable}
          >
            {buttonConcisoDisable ? buttonConcisoText : buttonConcisoText}
          </button>
          <button
            className="dbquery-button"
            onClick={() => {
              setButtonClick("scoreScene");
              handleDBQuery("scoreScene");
              playSound();
            }}
            disabled={buttonDisable}
          >
            {buttonScoreDisable ? buttonScoreText : buttonScoreText}
          </button>
        </div>
      </div>

      <div className="dbqueries-results">
        <h1>Overview of Database Query Monitoring</h1>
        {isLoading ? (
          <div className="no-data-container51">
            <img
              src="https://i.gifer.com/4V0b.gif"
              alt="Loading..."
              className="loading-spinner"
            />
          </div>
        ) : !dataLoaded ? (
          <div className="no-data-container51">
            <h2>No Data Found</h2>
            <p>We couldn't find any data to display.</p>
          </div>
        ) : (
          <div className="log-content">
            {log.map((entry, index) => (
              <p key={index}>{entry}</p>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {records.length > 0 ? (
              records.slice(0, 20).map((record, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => {
                    if (col === "Scene Score" || col === "Engagement Rate") {
                      let rawValue = record[col];
                      if (rawValue == "Not found: N/A") {
                        rawValue = "0";
                      }
                      const numValue = parseFloat(rawValue) || 0; // Convertimos a number (si viene como string)
                      const formatted = numValue.toFixed(2); // Siempre dos decimales: "0.50", "0.35", "0.34", etc.
                      return <td key={col}>{formatted}</td>;
                    }

                    if (
                      col === "View Average" ||
                      col === "Interaction Average" ||
                      col === "# of Hashtags" ||
                      col === "Interactions" ||
                      col === "Saves" ||
                      col === "Reposted" ||
                      col === "Comments" ||
                      col === "Likes" ||
                      col === "Views"
                    ) {
                      let rawValue = record[col]; // Ej: 0.5 o 0.346
                      if (rawValue == "Not found: N/A") {
                        rawValue = "0";
                      }
                      const numValue = Number(rawValue) || 0; // Convertimos a number (si viene como string)
                      return <td key={col}>{numValue}</td>;
                    }

                    // Si la columna es "Post URL", renderiza el link con ID de video
                    if (col === "Post URL") {
                      const url = record[col] || "";
                      const match = url.match(/video\/(\d+)/);
                      const videoId = match ? match[1] : "No URL";
                      return (
                        <td key={col}>
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {videoId}
                            </a>
                          ) : (
                            "No URL"
                          )}
                        </td>
                      );
                    }

                    // Si la columna es "Sound URL", renderiza el link con ID de sonido
                    if (col === "Sound URL") {
                      const url = record[col] || "";
                      const match = url.match(/music\/.*?-(\d+)/);
                      const soundId = match ? match[1] : "No Sound";
                      return (
                        <td key={col}>
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {soundId}
                            </a>
                          ) : (
                            "No Sound"
                          )}
                        </td>
                      );
                    }

                    // Para el resto de columnas, muestra el valor o "Not found: N/A"
                    return <td key={col}>{record[col] ?? "Not found: N/A"}</td>;
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data-placeholder">
                  <div className="no-data-row5">
                    {buttonClick === "conciso"
                      ? Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="no-data-container5 table">
                            <h2>No Data Found</h2>
                            <p>We couldn't find any data to display.</p>
                          </div>
                        ))
                      : buttonClick === "scoreScene"
                      ? Array.from({ length: 4 }).map((_, idx) => (
                          <div key={idx} className="no-data-container5 table">
                            <h2>No Data Found</h2>
                            <p>We couldn't find any data to display.</p>
                          </div>
                        ))
                      : /* default */
                        Array.from({ length: 5 }).map((_, idx) => (
                          <div key={idx} className="no-data-container5 table">
                            <h2>No Data Found</h2>
                            <p>We couldn't find any data to display.</p>
                          </div>
                        ))}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        className="export-dbquery-button"
        onClick={() => {
          handleExportToExcel();
          playSound();
        }}
      >
        Export to Excel
      </button>

      {isLoadingExcel && (
        <div className="loading-overlay">
          <div className="loading-spinner-container">
            <img src="https://i.gifer.com/XVo6.gif" alt="Loading..." />
            <p> Please wait, Downloading the Excel file </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBaseQueries;
