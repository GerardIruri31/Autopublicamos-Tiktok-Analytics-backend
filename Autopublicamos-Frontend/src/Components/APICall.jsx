import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./APICall.css";
import clickSound from "../Sounds/clicksound.mp3"; // Asegúrate de tener este archivo en la carpeta src
import { useMsal } from "@azure/msal-react";

const TikTokAPICall = () => {
  const [userId, setUserId] = useState("");
  const { instance } = useMsal();

  useEffect(() => {
    const account = instance.getActiveAccount();
    const id = account?.idTokenClaims?.emails[0]
      ? account.idTokenClaims.emails[0].toLowerCase()
      : "null";
    setUserId(id);
  }, [instance]);

  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [username, setUsername] = useState("");
  const [NotFoundUsername, setNotFoundUsername] = useState([]);
  const [log, setLog] = useState([]);
  const [records, setRecords] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [buttonText, setButtonText] = useState("Initiate TikTok API Request");
  //const [huboErrorTemp, setErrorTemp] = useState(false);

  const handleStartDateChange = (event) => {
    setDateFrom(event.target.value);
  };
  const handleEndDateChange = (event) => {
    setDateTo(event.target.value);
  };
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Sonidos al hacer clic
  const audioRef = useRef(new Audio(clickSound));
  const playSound = () => {
    audioRef.current.volume = 0.5; // 🎚 Ajusta el volumen (0.0 - 1.0)
    audioRef.current.loop = false; // 🔄 Evita que el sonido se repita automáticamente
    audioRef.current.currentTime = 0; // ⏪ Reinicia el audio en cada clic para evitar retrasos
    audioRef.current.play();
  };

  const handleDownloadExcel = async () => {
    if (!dataLoaded) {
      alert("⚠️ You must make the API call first.");
      return;
    }
    setIsLoadingExcel(true);
    try {
      //const azureURL = "http://localhost:8080";
      //const azureURL = "https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
      const azureURL = import.meta.env.VITE_AZURE_API_URL;
      const formattedUsernames = username
        .split(",")
        .map((u) => u.trim().toLowerCase())
        .filter((u) => u !== "");
      const requestBody = {
        StartDate: dateFrom,
        FinishDate: dateTo,
        AccountList: formattedUsernames,
        NotFoundAccountList: NotFoundUsername,
      };
      const response = await fetch(azureURL + "/api/excel/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "cors", // 🔹 IMPORTANTE para evitar bloqueos CORS
      });

      console.log(
        "📤 Sending request to download Excel with data (APICall - handleDownload):",
        requestBody
      );

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
      const fileName = `backup_tiktok_videos_${timestamp}.xlsx`; // Nombre generado en frontend
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      console.log(
        "✅ Excel File exported with success (APICall - handleDownloadExcel): " +
          fileName
      );
      alert("✅ Excel File exported with success");
    } catch (error) {
      console.error(
        "❌ Error downloading the Excel File (APICall - handleDownloadExcel):",
        error
      );
      alert("❌ Error downloading the Excel File");
    } finally {
      setIsLoadingExcel(false);
    }
  };

  function dividirCuentas(listas) {
    const bloques = [];
    for (let i = 0; i < listas.length; i += 15) {
      bloques.push(listas.slice(i, i + 15));
    }
    return bloques;
  }

  const handleAPICall = async () => {
    if (!dateFrom || !dateTo || !username) {
      alert("⚠️ You must complete all the filters first");
      return;
    }

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    // Validamos si la fecha inicial es mayor que la final
    if (fromDate > toDate) {
      alert("⚠️ The 'From' date must be earlier than the 'To' date.");
      return;
    }

    if (
      window.confirm("🚨 Are you sure you want to start the API request?") &&
      window.confirm("🚨 Are you really sure? This action cannot be undone")
    ) {
      setButtonDisable(true);
      setButtonText("API Call in Progress..."); // Cambia el texto mientras se ejecuta

      const startTime = new Date();
      setIsLoading(true);
      setLog((prevLog) => [
        ...prevLog,
        `📅 ${startTime.toLocaleString()} | Requesting APIRest`,
      ]);
      try {
        const formattedUsernames = username
          .split(",")
          .map((u) => u.trim().toLowerCase())
          .filter((u) => u !== "");

        console.log("🚀 Initiating API request (APICall - handleAPICall)");
        const dividedAccounts = dividirCuentas(formattedUsernames);
        const comulativeList = [];
        console.log("🚨 Separation of TikTok Accounts: ", dividedAccounts);
        let huboError = false;
        let huboErrorTemp = false;
        for (let i = 0; i < dividedAccounts.length; i++) {
          const requestBody = {
            StartDate: dateFrom,
            FinishDate: dateTo,
            AccountList: dividedAccounts[i],
            UserId: userId,
          };
          console.log(
            "📤 Sending request with data (APICall - handleAPICall):",
            requestBody
          );

          //const azureURL = "http://localhost:8080";

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 220000); // 3:40 minutos
          let dataTemporal = [];

          try {
            const azureURL = import.meta.env.VITE_AZURE_API_URL;
            const response = await fetch(azureURL + "/api/filtrar", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              mode: "cors",
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            if (!response.ok) {
              huboError = true;
              console.error(
                `🚨 Server responded with status (APICall - handleAPICall) ${response.status}`
              );
              throw new Error(
                `🚨 Server responded with status (APICall - handleAPICall) ${response.status}`
              );
            }
            dataTemporal = await response.json();
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              alert(
                `⏱️ Timeout in Azure Container Apps: Please resend these accounts separately, as they were not processed: ${dividedAccounts[i]}`
              );
              console.log(
                `⏱️ Timeout in Azure Container Apps: these accounts were not procesed ${dividedAccounts[i]}`
              );
            }
            continue;
          }

          //let huboErrorTemp = false;
          let ContrasttempNotFoundUsername = [];

          for (let i = 0; i < dataTemporal.length; i++) {
            const username = dataTemporal[i]["TikTok Account Username"];
            if (username && !ContrasttempNotFoundUsername.includes(username)) {
              ContrasttempNotFoundUsername.push(username);
            }
          }

          if (!dataTemporal[0].hasOwnProperty("error")) {
            if (
              !(
                ContrasttempNotFoundUsername.length == dividedAccounts[i].length
              )
            ) {
              alert(
                `⚠️ Warning: Some records of these accounts were not processed: ${dividedAccounts[
                  i
                ].join(
                  ", "
                )}. The accounts placed in the filter after these will not be processed due to insufficient funds in APIFY.`
              );
              console.log(
                `⚠️ Recommendation: Check money in APIFY and resend these accounts, as well as the ones added to the filter after them, to APIFY: ${dividedAccounts[
                  i
                ].join(", ")}`
              );
              huboErrorTemp = true;
            }
          }
          if (!huboErrorTemp) {
            console.log(
              `✅ The records for ${dividedAccounts[i].length} accounts have arrived.`
            );
          }
          console.log(
            "✅ Records received and stored in the database during this TikTok API call: ",
            dataTemporal
          );
          comulativeList.push(...dataTemporal);

          if (dataTemporal[0].hasOwnProperty("error")) {
            console.log(
              "⚠️ The money in APIFY has run out. Check the console for more details (APICall - handleAPICall). Error: ",
              dataTemporal?.[0]?.error
            );
            alert("⚠️ APIFY MONEY: Monthly usage hard limit exceeded");
            if (huboErrorTemp) {
              setLog((prevLog) => [
                ...prevLog,
                "⚠️ APIFY MONEY: Monthly usage hard limit exceeded while EXECUTING. No worries, the previous records were scrapped successfully",
              ]);
            } else {
              setLog((prevLog) => [
                ...prevLog,
                "❌ APIFY MONEY: Monthly usage hard limit exceeded.  No accounts were processed in this execution.",
              ]);
            }
            huboError = true;
            break;
          }
        }

        setLog((prevLog) => [
          ...prevLog,
          "🔄 Connecting to the TIKTOK APIFY API...",
        ]);

        setLog((prevLog) => [
          ...prevLog,
          "📥 Successful responde from APIFY. Processing data....",
        ]);

        const data = comulativeList;
        console.log(
          "✅ ACCUMULATIVE API RESPONSE (APICall - handleAPICall): ",
          data
        );

        let dic = {};
        let tempNotFoundUsername = [];
        let registrosProcesados = 0;
        for (let i = 0; i < data.length; i++) {
          if (data[i]["Date posted"] != "Not found: N/A") {
            registrosProcesados += 1;
            if (!dic.hasOwnProperty(data[i]["TikTok Account Username"])) {
              dic[data[i]["TikTok Account Username"]] = 1;
            }
          } else {
            if (
              !tempNotFoundUsername.includes(data[i]["TikTok Account Username"])
            ) {
              tempNotFoundUsername.push(data[i]["TikTok Account Username"]);
            }
          }
        }
        setNotFoundUsername(tempNotFoundUsername);
        console.log(
          "⚠️ The following TikTok accounts have no records within the selected date range: ",
          tempNotFoundUsername
        );
        const cuentasProcesadas = Object.keys(dic).length;
        setLog((prevLog) => [
          ...prevLog,
          `📊 Amount of Records Processed: ${registrosProcesados}`,
        ]);
        setLog((prevLog) => [
          ...prevLog,
          `👤 Amount of Accounts Processed: ${cuentasProcesadas}`,
        ]);

        if (!huboError) {
          setLog((prevLog) => [
            ...prevLog,
            "✅ Data has been successfully stored in the PostgreSQL database. Download the Excel File.",
          ]);
        }
        const filteredData = data.map((record) => ({
          "Post Code": record["Post code"] || "Not found: N/A",
          "Author Name": record["Author name"] || "Not found: N/A",
          "Book Name": record["Book name"] || "Not found: N/A",
          "Number of Scene": record["Number of Scene"] || "Not found: N/A",
          "Scene Name": record["Scene name"] || "Not found: N/A",
          "Post Type": record["Post type"] || "Not found: N/A",
          "PA Name": record["PA name"] || "Not found: N/A",
          "Date Posted": record["Date posted"] || "Not found: N/A",
          "Time Posted": record["Time posted"] || "Not found: N/A",
          "TikTok Username":
            record["TikTok Account Username"] || "Not found: N/A",
          "Post URL": record["Post Link"] || "Not found: N/A",
          Views: record["Views"] || 0,
          Likes: record["Likes"] || 0,
          Comments: record["Comments"] || 0,
          Reposted: record["Reposted"] || 0,
          Saves: record["Saves"] || 0,
          "Engagement Rate":
            Math.round(record["Engagement rate"] * 100.0) / 100.0 || 0,
          Interactions: record["Interactions"] || 0,
          Hashtags: record["Hashtags"] || "Not found: N/A",
          "# of Hashtags": record["# of Hashtags"] || 0,
          "Sound URL": record["Sound URL"] || "Not found: N/A",
          "Region of Posting": record["Region of posting"] || "Not found: N/A",
          "Tracking Date": record["Tracking date"] || "Not found: N/A",
          "Tracking Time": record["Tracking time"] || "Not found: N/A",
          "Logged-in User": record["Logged-in User"] || "Not found: N/A",
        }));
        setRecords(filteredData);
        setTimeout(() => setDataLoaded(true), 100);

        const endTime = new Date();
        const durationInSeconds = Math.floor((endTime - startTime) / 1000); // 🔹 Convertimos a segundos enteros
        const minutes = Math.floor(durationInSeconds / 60); // 🔹 Extraemos los minutos
        const seconds = durationInSeconds % 60; // 🔹 Extraemos los segundos restantes
        const formattedTime = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`; // 🔹 Formateamos el tiempo

        setLog((prevLog) => [
          ...prevLog,
          `⏳ Total execution time: ${formattedTime} minutes`,
        ]);
        setIsLoading(false);
        setButtonText("Reload to request TikTok API again");
      } catch (error) {
        console.error(
          "❌ Error fetching data (APICall - handleAPICall):",
          error
        );
        setIsLoading(false);
        alert("❌ Failed to fetch data.");
      }
    }
  };

  return (
    <div className="tiktok-api-call-container">
      <header className="tiktok-api-header">
        <h1>TIKTOK API CALL</h1>
        <button
          className="return-button"
          onClick={() => {
            navigate("/home");
            playSound();
          }}
        >
          Return to Home Screen
        </button>
      </header>
      {/* Contenedor de filtros y logs */}
      <div className="filters-log-container">
        <div className="filters-container">
          <label>Date (From - To):</label>
          <input
            type="date"
            value={dateFrom}
            onChange={handleStartDateChange}
          />
          <input type="date" value={dateTo} onChange={handleEndDateChange} />
          <label>Username Account:</label>
          <textarea
            style={{ textTransform: "lowercase" }}
            placeholder="Enter usernames separated by commas"
            value={username}
            onChange={handleUsernameChange}
          />
          <button
            className="api-request-button"
            onClick={() => {
              handleAPICall();
              playSound();
            }}
            disabled={buttonDisable}
          >
            {buttonDisable ? buttonText : buttonText}
          </button>
        </div>

        <div className="log-container">
          <h3>Overview of TikTok API Call Monitoring</h3>

          {isLoading ? (
            // 🔹 Mostrar la barra de carga cuando isLoading es true
            <div className="no-data-container">
              <img
                src="https://i.gifer.com/4V0b.gif"
                alt="Loading..."
                className="loading-spinner"
              />
            </div>
          ) : !dataLoaded ? (
            // 🔹 Si no hay datos cargados y no está cargando, mostrar "No Data Found"
            <div className="no-data-container">
              <h2>No Data Found</h2>
              <p>We couldn't find any data to display.</p>
            </div>
          ) : (
            // 🔹 Si ya hay datos cargados, mostrar los logs normalmente
            <div className="no-data-container">
              {log.map((entry, index) => (
                <p key={index}>{entry}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* La imagen ahora estará debajo, donde estaba el overview */}
      {/*  <div className="image-container">
        <img
          src="https://baystatebanner.com/wp-content/uploads/2024/03/TikTok_logo.svg-copy-1024x299.jpg"
          alt="Placeholder"
          className="image"
        />
      </div>*/}

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Post Code</th>
              <th>Author Name</th>
              <th>Book Name</th>
              <th>Number of Scene</th>
              <th>Scene Name</th>
              <th>Post Type</th>
              <th>PA Name</th>
              <th>Date Posted</th>
              <th>Time Posted</th>
              <th>Username TikTok Account</th>
              <th>Post URL</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Reposted</th>
              <th>Saves</th>
              <th>Engagement Rate</th>
              <th>Interactions</th>
              <th>Hashtags</th>
              <th># of Hashtags</th>
              <th>Sound URL</th>
              <th>Region of Posting</th>
              <th>Tracking Date</th>
              <th>Tracking Time</th>
              <th>Logged-in User</th>
            </tr>
          </thead>

          <tbody>
            {records.length > 0 ? (
              records.slice(0, 20).map((record, index) => {
                const videoUrl = record["Post URL"] || "";
                const match = videoUrl.match(/video\/(\d+)/);
                const videoId = match ? match[1] : "Unknown";

                const soundURL = record["Sound URL"] || "";
                const soundmatch = soundURL.match(/music\/.*?-(\d+)/);
                const soundId = soundmatch ? soundmatch[1] : "Unknown";

                return (
                  <tr key={index}>
                    <td>{record["Post Code"]}</td>
                    <td>{record["Author Name"]}</td>
                    <td>{record["Book Name"]}</td>
                    <td>{record["Number of Scene"]}</td>
                    <td>{record["Scene Name"]}</td>
                    <td>{record["Post Type"]}</td>
                    <td>{record["PA Name"]}</td>
                    <td>{record["Date Posted"]}</td>
                    <td>{record["Time Posted"]}</td>
                    <td>{record["TikTok Username"]}</td>
                    <td>
                      {videoId != "Unknown" ? (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {videoId}
                        </a>
                      ) : (
                        "Not found: N/A"
                      )}
                    </td>
                    <td>{record["Views"]}</td>
                    <td>{record["Likes"]}</td>
                    <td>{record["Comments"]}</td>
                    <td>{record["Reposted"]}</td>
                    <td>{record["Saves"]}</td>
                    <td>{record["Engagement Rate"]}</td>
                    <td>{record["Interactions"]}</td>
                    <td>{record["Hashtags"]}</td>
                    <td>{record["# of Hashtags"]}</td>
                    <td>
                      {soundId != "Unknown" ? (
                        <a
                          href={soundURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {soundId}
                        </a>
                      ) : (
                        "Not found: N/A"
                      )}
                    </td>
                    <td>{record["Region of Posting"]}</td>
                    <td>{record["Tracking Date"]}</td>
                    <td>{record["Tracking Time"]}</td>
                    <td>{record["Logged-in User"]}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="25" className="no-data-placeholder">
                  <div className="no-data-row">
                    <div className="no-data-container5 table">
                      <h2>No Data Found</h2>
                      <p>We couldn't find any data to display.</p>
                    </div>
                    <div className="no-data-container5 table">
                      <h2>No Data Found</h2>
                      <p>We couldn't find any data to display.</p>
                    </div>
                    <div className="no-data-container5 table">
                      <h2>No Data Found</h2>
                      <p>We couldn't find any data to display.</p>
                    </div>
                    <div className="no-data-container5 table">
                      <h2>No Data Found</h2>
                      <p>We couldn't find any data to display.</p>
                    </div>
                    <div className="no-data-container5 table">
                      <h2>No Data Found</h2>
                      <p>We couldn't find any data to display.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        className="export-button"
        onClick={() => {
          handleDownloadExcel();
          playSound();
        }}
      >
        Export all to Excel
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

export default TikTokAPICall;
