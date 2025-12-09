import React, { useState, useRef, useEffect } from "react";
import "./PaGraphs.css";
import { useNavigate } from "react-router-dom";
import clickSound from "../Sounds/clicksound.mp3";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import html2canvas from "html2canvas";
import { useMsal } from "@azure/msal-react";

const PaGraphs = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const [userRol, setUserRol] = useState("");

  useEffect(() => {
    const account = instance.getActiveAccount();
    const rol = account?.idTokenClaims?.jobTitle
      ? account.idTokenClaims.jobTitle.toLowerCase()
      : "null";
    setUserRol(rol);
  }, [instance]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [Publisher, setPublisher] = useState("");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [textButtom, setTextButtom] = useState("Generate Graphs");
  const [log, setLog] = useState([]);

  const audioRef = useRef(new Audio(clickSound));
  const playSound = () => {
    audioRef.current.volume = 0.5; // 🎚 Ajusta el volumen (0.0 - 1.0)
    audioRef.current.loop = false; // 🔄 Evita que el sonido se repita automáticamente
    audioRef.current.currentTime = 0; // ⏪ Reinicia el audio en cada clic para evitar retrasos
    audioRef.current.play();
  };

  // Referencias a los gráficos
  const graph1Ref = useRef(null);
  const graph2Ref = useRef(null);

  // Función para capturar y descargar gráfico
  // Función mejorada para capturar y descargar el gráfico
  const handleDownloadGraph = (graphRef, fileName) => {
    if (!graphRef.current) {
      alert("⚠️ No graph found to download.");
      return;
    }

    setTimeout(() => {
      const now = new Date(); // 🔥 Definir `now` correctamente dentro de la función

      html2canvas(graphRef.current, {
        backgroundColor: "white",
        scale: 3, // 📸 Aumentar la escala para máxima resolución
        useCORS: true, // 🚀 Evita problemas de CORS si hay imágenes externas
        logging: true, // 🔍 Ver errores en la consola

        windowWidth: graphRef.current.scrollWidth * 3, // Ajuste de ancho
        windowHeight: graphRef.current.scrollHeight * 3, // Ajuste de altura
      }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1.0);
        const timestamp = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
          now.getHours()
        ).padStart(2, "0")}-${String(now.getMinutes()).padStart(
          2,
          "0"
        )}-${String(now.getSeconds()).padStart(2, "0")}`;
        const finalName = `${fileName}_${timestamp}`;
        link.download = `${finalName}.png`;
        link.click();
        console.log(
          "📥 Successfull image download (PAGraphs - handleDownloadGraph): " +
            finalName
        );
      });
    }, 500); // Pequeña pausa para asegurar el renderizado completo
  };

  const handleGetDataFromDB = async () => {
    if (!dateFrom || !dateTo || !Publisher) {
      alert("⚠️ ACTION REQUIRED: You must fill all the fields");
      return;
    }

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    // Validamos si la fecha inicial es mayor que la final
    if (fromDate > toDate) {
      alert("⚠️ The 'From' Date must be earlier than the 'To' Date.");
      return;
    }

    if (window.confirm("📊 Do you want to generate the graphs?")) {
      setRecords([]);
      setIsLoading(true);
      setDataLoaded(false);
      setTextButtom("Generating Graphs...");
      setLog([]);
      try {
        const startTime = new Date();

        const formattedPublisher = Publisher.split(",")
          .map((pa) => pa.trim().toUpperCase())
          .filter((u) => u !== "");

        const bodyy = {
          dateFrom: dateFrom,
          dateTo: dateTo,
          Publisher: formattedPublisher,
        };

        console.log(
          "📤 Sending request with data (PAGraphs - handleGetDataFromDB): ",
          bodyy
        );

        //const azureURL = "http://localhost:8080";
        //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
        const azureURL = import.meta.env.VITE_AZURE_API_URL;
        const response = await fetch(azureURL + "/pagraphs/getdata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: JSON.stringify({
            dateFrom: dateFrom,
            dateTo: dateTo,
            Publisher: formattedPublisher,
          }),
        });

        if (!response.ok) {
          console.error(
            `🚨 Server responded with status (PAGraphs - handleGetDataFromDB) ${response.status}`
          );
          throw new Error(
            `🚨 An error occurred while fetching the data (PAGraphs - handleGetDataFromDB) ${response.status}`
          );
        }
        setLog((prevLog) => [
          ...prevLog,
          `🔗 Successful connection to the Azure container of the backend`,
        ]);

        setLog((prevLog) => [
          ...prevLog,
          `🚀 Successful connection to the PostgreSQL database `,
        ]);

        setLog((prevLog) => [
          ...prevLog,
          `📡 Data successfully retrieved from the Backend`,
        ]);

        const data = await response.json();
        if (data.length > 0) {
          setLog((prevLog) => [
            ...prevLog,
            `✅ Execution completed successfully. Graphs ready to be downloaded`,
          ]);
        } else {
          setLog((prevLog) => [
            ...prevLog,
            `❌ Execution not completed. No data available`,
          ]);
        }
        const NotFoundPA = formattedPublisher.filter((u) => {
          return !data.some((dic) => u == dic["codposteador"]);
        });
        console.log("API Response (PAGraphs - handleGetDataFromDB): ", data);
        console.log(
          "Not found Authors Code (PAGraphs - handleGetDataFromDB): " +
            NotFoundPA
        );

        setLog((prevLog) => [
          ...prevLog,
          `📊 Amount of PA Records obtained in the Database Process: ${data.length}`,
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

        setRecords(data);
        setDataLoaded(true);
      } catch (error) {
        console.error(
          "❌ Error extracting information from DB (PAGraphs - handleGetDataFromDB): ",
          error
        );
        alert("❌ An error occurred while generating the graphs");
      } finally {
        setIsLoading(false);
        setTextButtom("Generate Graphs");
      }
    }
  };
  const recordsFiltrados = records.filter((record) => record.eficacia !== null);
  const maxEficacia = Math.max(...recordsFiltrados.map((r) => r.eficacia || 0));
  const topeEficacia = Math.ceil(maxEficacia / 10) * 10;
  const ticks = Array.from({ length: topeEficacia / 10 + 1 }, (_, i) => i * 10);
  const domain = [0, topeEficacia];

  return (
    <div className="PaGraphs-container-general">
      <header className="PaGraphs-header">
        <h1>PA GRAPHS</h1>
        <button
          className="return-botton-pa"
          onClick={() => {
            if (userRol === "admin") {
              navigate("/home");
            } else if (userRol === "analyst") {
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

      <div className="filter-image-container">
        <div className="filter-container3">
          <label>Date (From - To):</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <label>Publisher:</label>
          <textarea
            style={{ textTransform: "uppercase" }}
            placeholder="Enter the Publisher's code separated by commas"
            value={Publisher}
            onChange={(e) => setPublisher(e.target.value)}
          />
          <button
            className="generate-graphs-button"
            onClick={() => {
              handleGetDataFromDB();
              playSound();
            }}
            disabled={isLoading}
          >
            {textButtom}
          </button>
        </div>

        <div className="log-container3">
          <h3>Overview of TikTok Rest API Monitoring</h3>
          {isLoading ? (
            <div className="no-data-container3">
              <img
                src="https://i.gifer.com/4V0b.gif"
                alt="Loading..."
                className="loading-spinner"
              />
            </div>
          ) : !dataLoaded ? (
            <div className="no-data-container3">
              <h2>No Data Found</h2>
              <p>We couldn't find any data to display.</p>
            </div>
          ) : (
            <div className="no-data-container8">
              {log.map((value, index) => (
                <p key={index}> {value}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="graphs-container">
        {records.length > 0 ? (
          <>
            {/* Gráfico 1: Average Views & Interactions */}
            <div className="graph" ref={graph1Ref}>
              <h3>Average Views - Interactions per PA</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={records}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nbrposteador"
                    tick={{
                      dy: records.length >= 11 ? 21 : 10,
                      angle: records.length >= 11 ? -20 : 0, // 🔥 Si hay 13 o más datos, rota 30°
                      style: {
                        fontSize: records.length >= 11 ? "14.5px" : "16px",
                      },
                    }} // Desplaza los labels hacia abajo
                    interval={0} // 🔥 Muestra TODAS las etiquetas sin saltarse ninguna
                    tickFormatter={(value) => `${value}`} // 🔥 Asegura que los valores se rendericen correctamente
                  />
                  <YAxis
                    tickFormatter={(value) => value.toLocaleString()} // 🔥 Convierte valores numéricos a string para visibilidad
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      paddingTop: records.length >= 11 ? 27 : 20,
                    }}
                    layout="horizontal"
                  />
                  <Bar dataKey="promnumviews" fill="#9013FE" name="Views">
                    <LabelList
                      dataKey="promnumviews"
                      position="inside"
                      fontWeight="bold" // 🔥 Texto en negrita
                      fill="black" //  Color del texto
                      fontSize={records.length >= 7 ? "14px" : "16px"}
                    />
                    {/* 🔥 Forzar renderizado de etiquetas */}
                  </Bar>
                  <Bar
                    dataKey="prominteraction"
                    fill="#00FFFF"
                    name="Interactions"
                  >
                    <LabelList
                      dataKey="prominteraction"
                      position="top"
                      fontWeight="bold" // 🔥 Texto en negrita
                      fill="black" //  Color del texto
                      dy={-5} // Ajusta la distancia vertical (valores negativos la suben más)
                      fontSize={records.length >= 7 ? "14px" : "16px"}
                    />
                    {/* 🔥 Forzar renderizado de etiquetas */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button"
              onClick={() => {
                handleDownloadGraph(graph1Ref, "PA_Average_Views_Interactions");
                playSound();
              }}
            >
              Download Graph
            </button>

            {recordsFiltrados.length === 0 ? (
              <div className="no-data-container6">
                <h2>No Graph Found</h2>
                <p>We couldn't find any data to display.</p>
              </div>
            ) : (
              <div className="graph" ref={graph2Ref}>
                <h3>Individual Effectiveness of Each PA</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={recordsFiltrados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="nbrposteador"
                      tick={{
                        dy: recordsFiltrados.length >= 11 ? 21 : 10,
                        angle: recordsFiltrados.length >= 11 ? -20 : 0, // 🔥 Si hay 13 o más datos, rota 30°
                        style: {
                          fontSize:
                            recordsFiltrados.length >= 11 ? "14.5px" : "16px",
                        },
                      }} // Desplaza los labels hacia abajo
                      interval={0} // 🔥 Muestra TODAS las etiquetas sin saltarse ninguna
                      tickFormatter={(value) => `${value}`} // 🔥 Asegura que los valores se rendericen correctamente
                    />
                    <YAxis
                      tickFormatter={(value) => value.toLocaleString()}
                      interval={0}
                      ticks={ticks}
                      domain={domain}
                      padding={{ top: 10 }}
                    />

                    <Tooltip />
                    <Legend
                      wrapperStyle={{
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        paddingTop: recordsFiltrados.length >= 11 ? 27 : 20,
                      }}
                      layout="horizontal"
                    />
                    <Bar
                      dataKey="eficacia"
                      fill="#1E88E5"
                      name="Effectiveness (%)"
                    >
                      <LabelList
                        dataKey="eficacia"
                        position="inside"
                        fontWeight="bold" // 🔥 Texto en negrita
                        fill="black"
                        fontSize={
                          recordsFiltrados.length >= 7 ? "14px" : "16px"
                        }
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <button
              className="download-button"
              onClick={() => {
                handleDownloadGraph(graph2Ref, "PA_Effectiveness_Graph");
                playSound();
              }}
            >
              Download Graph
            </button>
          </>
        ) : (
          <div className="no-data-container6">
            <h2>No Graph Available</h2>
            <p>We couldn't find any data to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default PaGraphs;
