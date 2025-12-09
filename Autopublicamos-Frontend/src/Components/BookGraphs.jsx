import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthorGraphs.css";
import clickSound from "../Sounds/clicksound.mp3";
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  BarChart,
  Label,
} from "recharts";
import html2canvas from "html2canvas";
import { useMsal } from "@azure/msal-react";

const BookGraphs = () => {
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
  const [authors, setAuthors] = useState("");
  //const [books, setBooks] = useState("");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [log, setLog] = useState([]);
  const [colorRunId, setColorRunId] = useState(0);

  const [textButtomMetrics, setTextButtomMetrics] =
    useState("Metrics per Month");
  const [textButtomEffectiveness, setTextButtomEffectiveness] = useState(
    "Effectiveness per Month"
  );
  const [currentGraphType, setCurrentGraphType] = useState(""); // New state to track which button was pressed

  const audioRef = useRef(new Audio(clickSound));
  const playSound = () => {
    audioRef.current.volume = 0.5; // 🎚 Ajusta el volumen (0.0 - 1.0)
    audioRef.current.loop = false; // 🔄 Evita que el sonido se repita automáticamente
    audioRef.current.currentTime = 0; // ⏪ Reinicia el audio en cada clic para evitar retrasos
    audioRef.current.play();
  };

  // === Dataset plano para el gráfico 2 (cada X = "Autora - Mes") ===
  const metricsSourceRaw =
    Array.isArray(records[0]) && records[0].length
      ? records[0]
      : Array.isArray(records) &&
        records.length &&
        records.every((r) => r && r.mes)
      ? records
      : records[0] && typeof records[0] === "object" && records[0].mes
      ? [records[0]]
      : [];

  const registrosVI = (metricsSourceRaw || []).flatMap((r) => {
    if (!r || !r.mes || !r.deslibro) return [];
    return [
      {
        mes: r.mes,
        autora: r.deslibro,
        views: Number(r.promNumviews ?? 0),
        interactions: Number(r.promInteraction ?? 0),
      },
    ];
  });

  // Autoras únicas
  const booksVI = Array.from(new Set(registrosVI.map((r) => r.autora)));

  // Pivot: una fila por mes, y por cada autora dos columnas (author__views, author__interactions)
  const datosVI = registrosVI
    .reduce((acc, r) => {
      let fila = acc.find((x) => x.mes === r.mes);
      if (!fila) {
        fila = { mes: r.mes };
        acc.push(fila);
      }
      fila[`${r.autora}__views`] = r.views;
      fila[`${r.autora}__interactions`] = r.interactions;
      return acc;
    }, [])
    // ordena por fecha si tu mes es tipo "Jan-25", "Feb-25", etc.
    .sort((a, b) => new Date(a.mes + "-01") - new Date(b.mes + "-01"));

  // Acorta nombres para caber debajo de las barras
  const acortarNombreML = (s, max = 14) => {
    if (!s) return "";
    return String(s)
      .split(/\r?\n/) // respeta \n
      .map((line) => (line.length > max ? line.slice(0, max) + "…" : line))
      .join("\n"); // mantenemos \n para que el renderer sepa dónde cortar
  };

  // Reglas visuales similares a las que ya usabas:
  const manyMonths = (datosVI?.length || 0) >= 11;
  // separaciones entre barras (ajústalo si quieres más/menos “aire”)
  const GAP_BARRA = 6;
  const GAP_CATEGORIA = "24%";

  const BookLabelCentered = (props) => {
    const { x = 0, value, viewBox = {}, width = 0 } = props;
    // base inferior del área del chart (eje X)
    const baseY = (viewBox.y ?? 0) + (viewBox.height ?? 0);
    // centro horizontal entre views (izq) e interactions (der)
    const dx = width / 2 + (typeof GAP_BARRA === "number" ? GAP_BARRA / 2 : 3);
    // distancia fija debajo del eje X
    const authorDy = 24; // sube/baja todo el bloque
    const lineHeight = 14; // espacio entre líneas
    // respeta \n y acorta por línea
    const lines = acortarNombreML(String(value)).split("\n");
    return (
      <text
        x={x + dx}
        y={baseY + authorDy - 2}
        textAnchor="middle"
        style={{ fontSize: 12, fontWeight: 500, pointerEvents: "none" }}
      >
        {lines.map((ln, i) => (
          <tspan
            key={i}
            x={x + dx + 20}
            dy={i === 0 ? 0 : lineHeight} // líneas siguientes bajan
          >
            {ln}
          </tspan>
        ))}
      </text>
    );
  };
  const formatBookLabel = (name) =>
    !name ? "" : String(name).replace(/\s+/, "\n");

  const getDynamicFontSize = (count, base = 12, min = 8) => {
    if (!count || count <= 5) return base; // pocos elementos → tamaño base
    if (count >= 20) return min; // muchos elementos → tamaño mínimo
    // escala lineal entre base y min
    const scale = (count - 5) / (20 - 5);
    return Math.max(min, Math.round(base - scale * (base - min)));
  };

  const registrosEng = (metricsSourceRaw || []).flatMap((r) => {
    if (!r || !r.mes || !r.deslibro) return [];
    return [
      {
        mes: r.mes,
        autora: r.deslibro,
        engagement: Number(r.promNumengagement ?? 0),
      },
    ];
  });

  // Autoras únicas (para iterar barras por autora)
  const booksEng = Array.from(new Set(registrosEng.map((r) => r.autora)));

  // Pivot por mes: una fila por mes con columnas = cada autora
  const datosEng = registrosEng
    .reduce((acc, r) => {
      let fila = acc.find((x) => x.mes === r.mes);
      if (!fila) {
        fila = { mes: r.mes };
        acc.push(fila);
      }
      fila[r.autora] = r.engagement;
      return acc;
    }, [])
    .sort((a, b) => new Date(a.mes + "-01") - new Date(b.mes + "-01"));

  const manyMonthsEng = (datosEng?.length || 0) >= 11;

  // Etiqueta centrada BAJO el eje X para UNA SOLA barra (no par)
  const BookLabelBelowSingle = (props) => {
    const { x = 0, width = 0, value, viewBox = {} } = props;
    const baseY = (viewBox.y ?? 0) + (viewBox.height ?? 0); // línea del eje X
    const dx = width / 2; // centro de la barra
    const authorDy = 24; // separa del eje
    const lineHeight = 14;
    const lines = acortarNombreML(String(value)).split("\n"); // respeta \n

    return (
      <text
        x={x + dx}
        y={baseY + authorDy}
        textAnchor="middle"
        style={{ fontSize: 12, fontWeight: 500, pointerEvents: "none" }}
      >
        {lines.map((ln, i) => (
          <tspan key={i} x={x + dx} dy={i === 0 ? 0 : lineHeight}>
            {ln}
          </tspan>
        ))}
      </text>
    );
  };

  const AUTHOR_COLORS = [
    "#1F4E79", // azul marino elegante
    "#2E75B6", // azul intermedio
    "#70AD47", // verde sobrio
    "#A5A5A5", // gris neutro
    "#C00000", // rojo corporativo
    "#7030A0", // púrpura profesional
    "#264478", // azul profundo extra
  ];

  // Mapa de colores: estable dentro del render, aleatorio entre llamadas
  const colorMapEng = React.useMemo(() => {
    // baraja la paleta
    const shuffled = [...AUTHOR_COLORS].sort(() => Math.random() - 0.5);
    const map = {};
    booksEng.forEach((a, i) => {
      map[a] = shuffled[i % shuffled.length];
    });
    return map;
    // si cambian las autoras o "reseteamos" el run, se regenera
  }, [booksEng.join("|"), colorRunId]);

  const colorByBookEng = (autor) => colorMapEng[autor] || "#1F4E79";

  // -----------------------------------------------------------
  const effSourceRaw =
    currentGraphType === "effectiveness"
      ? Array.isArray(records[0]) && records[0].length
        ? records[0]
        : Array.isArray(records) &&
          records.length &&
          records.every((r) => r && (r.codmes || r.mes))
        ? records
        : records[0] &&
          typeof records[0] === "object" &&
          (records[0].codmes || records[0].mes)
        ? [records[0]]
        : []
      : [];

  // plano (mes, autora, eficacia, posts)
  const registrosEff = (effSourceRaw || []).flatMap((r) => {
    // effectiveness API: codmes, nbautora, eficacia, numposteoreal
    const mes = r?.codmes ?? r?.mes;
    const bookName = r?.deslibro;
    if (!mes || !bookName) return [];
    return [
      {
        mes,
        autora: bookName,
        eficacia: Number(r?.eficacia ?? 0),
        realPosts: Number(r?.numposteoreal ?? 0),
      },
    ];
  });

  // autoras únicas
  const BookEff = Array.from(new Set(registrosEff.map((r) => r.autora)));

  // pivot % eficacia por mes y autora
  const datosEff = registrosEff
    .reduce((acc, r) => {
      let fila = acc.find((x) => x.mes === r.mes);
      if (!fila) {
        fila = { mes: r.mes };
        acc.push(fila);
      }
      fila[r.autora] = r.eficacia;
      return acc;
    }, [])
    .sort((a, b) => new Date(a.mes + "-01") - new Date(b.mes + "-01"));

  const manyMonthsEff = (datosEff?.length || 0) >= 11;

  // pivot posts reales por mes y autora
  const datosEffPosts = registrosEff
    .reduce((acc, r) => {
      let fila = acc.find((x) => x.mes === r.mes);
      if (!fila) {
        fila = { mes: r.mes };
        acc.push(fila);
      }
      fila[r.autora] = r.realPosts;
      return acc;
    }, [])
    .sort((a, b) => new Date(a.mes + "-01") - new Date(b.mes + "-01"));

  useEffect(() => {
    if (records && records.length > 0) {
      console.log("Records structure:", records);
      console.log("Records[0] type:", typeof records[0]);
      console.log("Records[0] is array:", Array.isArray(records[0]));
      console.log("Records[0] content:", records[0]);
      console.log("Current graph type:", currentGraphType);
    }
  }, [records, currentGraphType]);

  const colorMapEff = React.useMemo(() => {
    const shuffled = [...AUTHOR_COLORS].sort(() => Math.random() - 0.5);
    const map = {};
    BookEff.forEach((a, i) => {
      map[a] = shuffled[i % shuffled.length];
    });
    return map;
  }, [BookEff.join("|"), colorRunId]);

  const colorByBookEff = (autor) => colorMapEff[autor] || "#1F4E79";

  const graph4Ref = useRef(null); // New ref for metrics chart 1
  const graph5Ref = useRef(null); // New ref for metrics chart 2
  const graph6Ref = useRef(null); // Effectiveness %
  const graph7Ref = useRef(null); // Posts reales

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
          "📥 Successfull image download (BookGraphs - handleDownloadGraph): " +
            finalName
        );
      });
    }, 500); // Pequeña pausa para asegurar el renderizado completo
  };

  const handleBookMetricsPerMonth = async () => {
    if (!dateFrom || !dateTo || !authors) {
      alert("⚠️ ACTION REQUIRED: You must fill all the fields");
      return;
    }
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    if (fromDate > toDate) {
      alert(
        "⚠️ The 'From' Posted Date must be earlier than the 'To' Posted Date."
      );
      return;
    }

    if (
      window.confirm("📊 Do you want to generate the Book's metrics per month?")
    ) {
      setRecords([]);
      setIsLoading(true);
      setDataLoaded(false);
      setTextButtomMetrics("Generating Metrics...");
      setLog([]);
      setCurrentGraphType("metrics"); // Set graph type to metrics
      try {
        const startTime = new Date();
        const formattedAuthors = authors
          .split(",")
          .map((pa) => pa.trim().toUpperCase())
          .filter((u) => u !== "");

        const body = {
          dateFrom: dateFrom,
          dateTo: dateTo,
          Author: formattedAuthors,
        };
        console.log("📤 Sending request for metrics per month: ", body);

        const azureURL = import.meta.env.VITE_AZURE_API_URL;
        const response = await fetch(azureURL + "/bookgraphs/dataPerMonth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: JSON.stringify({
            dateFrom: dateFrom,
            dateTo: dateTo,
            Author: formattedAuthors,
          }),
        });

        if (!response.ok) {
          console.error(
            `🚨 Server responded with status (Book Metrics per Month) ${response.status}`
          );
          throw new Error(
            `🚨 An error occurred while fetching book metrics per month ${response.status}`
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
          `📡 Metrics per month data successfully retrieved from the Backend`,
        ]);

        const data = await response.json();
        console.log("Metrics per Month API Response: ", data);

        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : []; // fallback seguro

        if (rows.length > 0) {
          setLog((prev) => [
            ...prev,
            `📊 Amount of Book's effectiveness per Month Records obtained: ${rows.length}`,
          ]);
          setLog((prev) => [
            ...prev,
            `✅ Book's metrics per Month execution completed successfully`,
          ]);
        } else {
          setLog((prev) => [
            ...prev,
            `❌ Book's metrics per Month execution not completed. No data available`,
          ]);
        }
        const endTime = new Date();
        const durationInSeconds = Math.floor((endTime - startTime) / 1000);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        const formattedTime = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;

        setLog((prevLog) => [
          ...prevLog,
          `⏳ Total metrics per month execution time: ${formattedTime} minutes`,
        ]);

        setRecords([rows]);
        setDataLoaded(true);
        setColorRunId((x) => x + 1);
      } catch (error) {
        console.error(
          "❌ Error extracting book's metrics per month from DB: ",
          error
        );
        alert("❌ An error occurred while generating the metrics per month");
      } finally {
        setIsLoading(false);
        setTextButtomMetrics("Metrics per Month");
      }
    }
  };

  const handleBookEffectivenessPerMonth = async () => {
    if (!dateFrom || !dateTo || !authors) {
      alert("⚠️ ACTION REQUIRED: You must fill all the fields");
      return;
    }

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    if (fromDate > toDate) {
      alert(
        "⚠️ The 'From' Posted Date must be earlier than the 'To' Posted Date."
      );
      return;
    }

    if (
      window.confirm("📊 Do you want to generate the effectiveness per month?")
    ) {
      setRecords([]);
      setIsLoading(true);
      setDataLoaded(false);
      setTextButtomEffectiveness("Generating Effectiveness...");
      setLog([]);
      setCurrentGraphType("effectiveness"); // Set graph type to effectiveness

      try {
        const startTime = new Date();

        const formattedAuthors = authors
          .split(",")
          .map((pa) => pa.trim().toUpperCase())
          .filter((u) => u !== "");

        const body = {
          dateFrom: dateFrom,
          dateTo: dateTo,
          Author: formattedAuthors,
        };

        console.log("📤 Sending request for effectiveness per month: ", body);

        const azureURL = import.meta.env.VITE_AZURE_API_URL;
        const response = await fetch(
          azureURL + "/bookgraphs/effectivenessBookPerMonth",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "cors",
            body: JSON.stringify({
              dateFrom: dateFrom,
              dateTo: dateTo,
              Author: formattedAuthors,
            }),
          }
        );

        if (!response.ok) {
          console.error(
            `🚨 Server responded with status (Effectiveness per Month) ${response.status}`
          );
          throw new Error(
            `🚨 An error occurred while fetching effectiveness per month ${response.status}`
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
          `📡 Effectiveness per month data successfully retrieved from the Backend`,
        ]);

        const data = await response.json();
        console.log("Effectiveness per Month API Response: ", data);

        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : []; // fallback seguro

        if (rows.length > 0) {
          setLog((prev) => [
            ...prev,
            `📊 Amount of Effectiveness per Month Records obtained: ${rows.length}`,
          ]);
          setLog((prev) => [
            ...prev,
            `✅ Effectiveness per Month execution completed successfully`,
          ]);
        } else {
          setLog((prev) => [
            ...prev,
            `❌ Effectiveness per Month execution not completed. No data available`,
          ]);
        }

        const endTime = new Date();
        const durationInSeconds = Math.floor((endTime - startTime) / 1000);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        const formattedTime = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;

        setLog((prevLog) => [
          ...prevLog,
          `⏳ Total effectiveness per month execution time: ${formattedTime} minutes`,
        ]);

        setRecords([rows]);
        setDataLoaded(true);
        setColorRunId((x) => x + 1);
      } catch (error) {
        console.error(
          "❌ Error extracting effectiveness per month from DB: ",
          error
        );
        alert(
          "❌ An error occurred while generating the effectiveness per month"
        );
      } finally {
        setIsLoading(false);
        setTextButtomEffectiveness("Effectiveness per Month");
      }
    }
  };

  return (
    <div className="PaGraphs-container-general2">
      <header className="PaGraphs-header2">
        <h1>BOOK'S GRAPHS</h1>
        <button
          className="return-botton-pa2"
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

      <div className="filter-image-container2">
        <div className="filter-container4">
          <label>Date Posted (From - To):</label>
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
          <label>Books:</label>
          <textarea
            style={{ textTransform: "uppercase" }}
            placeholder="Enter the Book's code separated by commas"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
          />
          {/*<label>Books:</label>
          <textarea
            placeholder="Enter the Book's name separated by commas"
            value={books}
            onChange={(e) => setBooks(e.target.value)}
          />*/}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="generate-graphs-button4"
              onClick={() => {
                handleBookEffectivenessPerMonth();
                playSound();
              }}
              disabled={isLoading}
            >
              {textButtomEffectiveness}
            </button>
            <button
              className="generate-graphs-button4"
              onClick={() => {
                handleBookMetricsPerMonth();
                playSound();
              }}
              disabled={isLoading}
            >
              {textButtomMetrics}
            </button>
          </div>
        </div>
        <div className="log-container4">
          <h3>Overview of TikTok Rest API Monitoring</h3>
          {isLoading ? (
            <div className="no-data-container4">
              <img
                src="https://i.gifer.com/4V0b.gif"
                alt="Loading..."
                className="loading-spinner"
              />
            </div>
          ) : !dataLoaded ? (
            <div className="no-data-container4">
              <h2>No Data Found</h2>
              <p>We couldn't find any data to display.</p>
            </div>
          ) : (
            <div className="no-data-container10">
              {log.map((value, index) => (
                <p key={index}> {value}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="graphs-container2">
        {/* Show Metrics Graphs when currentGraphType is "metrics" */}
        {currentGraphType === "metrics" &&
        records[0] &&
        ((Array.isArray(records[0]) && records[0].length > 0) ||
          (typeof records[0] === "object" && records[0].mes)) ? (
          <>
            <div className="graph2" ref={graph5Ref}>
              <h3>
                Comparison of Average Views and Interactions per month per Book
              </h3>

              {/* Estado vacío o con error de datos */}
              {!Array.isArray(datosVI) ||
              datosVI.length === 0 ||
              booksVI.length === 0 ? (
                <div style={{ padding: 16, fontStyle: "italic" }}>
                  No hay datos para mostrar este gráfico (views/interactions por
                  mes y autora).
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={datosVI}
                    barGap={GAP_BARRA}
                    barCategoryGap={GAP_CATEGORIA}
                    margin={{
                      top: 8,
                      right: 16,
                      left: 8,
                      bottom: manyMonths ? 88 : 80,
                    }} // ⬅️ más espacio
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    {/* Mes centrado bajo el grupo */}
                    <XAxis
                      dataKey="mes"
                      interval={0}
                      tickLine={false}
                      tick={{
                        dy: manyMonths ? 50 : 40,
                        angle: manyMonths ? -20 : 0,
                        style: {
                          fontSize: manyMonths ? "14.5px" : "17px",
                          fill: "black",
                          fontWeight: "bold",
                        },
                      }}
                      tickMargin={12}
                    />

                    <YAxis tickFormatter={(v) => v?.toLocaleString?.() ?? v} />

                    {/* Tooltip: muestra nombre y valor humano */}
                    <Tooltip
                      formatter={(value, name) => {
                        // name viene como "<autora>__views" o "<autora>__interactions"
                        const [bookName, met] = String(name).split("__");
                        const etiqueta =
                          met === "views" ? "Average Views" : "Interactions";
                        const val = Number(value ?? 0).toLocaleString();
                        return [val, `${bookName} — ${etiqueta}`];
                      }}
                      labelFormatter={(l) => `Mes: ${l}`}
                    />

                    {/* Leyenda opcional centrada; puedes quitarla si no la necesitas */}
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                      payload={[
                        {
                          value: "Average Views",
                          type: "square",
                          id: "avg",
                          color: "#4472C4",
                        },
                        {
                          value: "Interactions",
                          type: "square",
                          id: "int",
                          color: "#FF3333",
                        },
                      ]}
                    />

                    {/* Dos barras por AUTORA: views e interactions */}
                    {booksVI.map((book) => {
                      return (
                        <React.Fragment key={book}>
                          {/* Views (izquierda del par) */}
                          <Bar
                            dataKey={`${book}__views`}
                            fill="#4472C4"
                            name={`${book}__views`}
                          >
                            <LabelList
                              dataKey={() => formatBookLabel(book)}
                              content={BookLabelCentered}
                            />
                            <LabelList
                              dataKey={`${book}__views`}
                              position="inside"
                              fontWeight="bold"
                              fill="black"
                              fontSize={getDynamicFontSize(booksVI.length)}
                              formatter={(v) =>
                                Math.round(Number(v ?? 0)).toLocaleString()
                              }
                            />
                          </Bar>

                          {/* Interactions (derecha del par) */}
                          <Bar
                            dataKey={`${book}__interactions`}
                            fill="#FF3333" // misma autora, tono más oscuro
                            name={`${book}__interactions`}
                          >
                            <LabelList
                              dataKey={`${book}__interactions`}
                              position="top"
                              fontWeight="bold"
                              fill="black"
                              dy={-5}
                              fontSize={getDynamicFontSize(booksVI.length)}
                              formatter={(v) =>
                                Math.round(Number(v ?? 0)).toLocaleString()
                              }
                            />
                          </Bar>
                        </React.Fragment>
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(
                  graph5Ref,
                  "Views_Interactions_Per_Month_Per_Book"
                );
                playSound();
              }}
            >
              Download Graph
            </button>

            <div className="graph2" ref={graph4Ref}>
              <h3>Comparison of Engagement Rate per month per Book</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={datosEng}
                  barGap={GAP_BARRA}
                  barCategoryGap={GAP_CATEGORIA}
                  margin={{
                    top: 8,
                    right: 16,
                    left: 8,
                    bottom: manyMonthsEng ? 88 : 80,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  {/* Mes centrado bajo el grupo */}
                  <XAxis
                    dataKey="mes"
                    interval={0}
                    tickLine={false}
                    tick={{
                      dy: manyMonthsEng ? 50 : 40,
                      angle: manyMonthsEng ? -20 : 0,
                      style: {
                        fontSize: manyMonthsEng ? "14.5px" : "17px",
                        fill: "black",
                        fontWeight: "bold",
                      },
                    }}
                    tickMargin={13}
                  />

                  <YAxis tickFormatter={(v) => `${v}%`} />

                  <Tooltip
                    formatter={(value, name) => {
                      // name será el nombre de la autora (columna)
                      const val = Number(value ?? 0).toFixed(2);
                      return [`${val}%`, `${name} — Engagement Rate`];
                    }}
                    labelFormatter={(l) => `Mes: ${l}`}
                  />

                  {/* 1 barra POR AUTORA dentro de cada mes */}
                  {booksEng.map((book) => (
                    <Bar
                      key={book}
                      dataKey={book}
                      fill={colorByBookEng(book)}
                      name={book}
                    >
                      {/* Nombre de autora centrado BAJO su barra */}
                      <LabelList
                        dataKey={() => formatBookLabel(book)}
                        content={BookLabelBelowSingle}
                      />
                      {/* Valor en % dentro/arriba de la barra */}
                      <LabelList
                        dataKey={book}
                        position="inside"
                        fontWeight="bold"
                        fill="black"
                        fontSize={getDynamicFontSize(booksEng.length)}
                        formatter={(v) => `${Number(v ?? 0).toFixed(0)}%`}
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(
                  graph4Ref,
                  "Engagement_Rate_Per_Month_Per_Book"
                );
                playSound();
              }}
            >
              Download Graph
            </button>
          </>
        ) : currentGraphType === "effectiveness" &&
          records[0] &&
          ((Array.isArray(records[0]) && records[0].length > 0) ||
            (typeof records[0] === "object" && records[0].mes)) ? (
          <>
            {/* Gráfica 1: Effectiveness % */}
            <div className="graph2" ref={graph6Ref}>
              <h3>Comparison of Effectiveness % per month per Book</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={datosEff}
                  barGap={GAP_BARRA}
                  barCategoryGap={GAP_CATEGORIA}
                  margin={{
                    top: 8,
                    right: 16,
                    left: 8,
                    bottom: manyMonthsEff ? 88 : 80,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mes"
                    interval={0}
                    tickLine={false}
                    tick={{
                      dy: manyMonthsEff ? 50 : 40,
                      angle: manyMonthsEff ? -20 : 0,
                      style: {
                        fontSize: manyMonthsEff ? "14.5px" : "17px",
                        fill: "black",
                        fontWeight: "bold",
                      },
                    }}
                    tickMargin={12}
                  />
                  <YAxis tickFormatter={(v) => v?.toLocaleString?.() ?? v} />
                  <Tooltip
                    formatter={(v, name) => [
                      `${Number(v ?? 0).toFixed(0)}%`,
                      `${name} — Effectiveness`,
                    ]}
                    labelFormatter={(l) => `Mes: ${l}`}
                  />
                  {BookEff.map((book, idx) => (
                    <Bar key={book} dataKey={book} fill={colorByBookEff(book)}>
                      <LabelList
                        dataKey={() => formatBookLabel(book)}
                        content={BookLabelBelowSingle}
                      />
                      <LabelList
                        dataKey={book}
                        position="inside"
                        fontWeight="bold"
                        fill="black"
                        formatter={(v) => `${Number(v ?? 0).toFixed(0)}%`}
                        fontSize={getDynamicFontSize(BookEff.length)}
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(graph6Ref, "Book_Effectiveness_Per_Month");
                playSound();
              }}
            >
              Download Graph
            </button>

            {/* Gráfica 2: Real posts */}
            <div className="graph2" ref={graph7Ref}>
              <h3>Comparison of Real Posts per month per Book</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={datosEffPosts}
                  barGap={GAP_BARRA}
                  barCategoryGap={GAP_CATEGORIA}
                  margin={{
                    top: 8,
                    right: 16,
                    left: 8,
                    bottom: manyMonthsEff ? 88 : 80,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mes"
                    interval={0}
                    tickLine={false}
                    tick={{
                      dy: manyMonthsEff ? 50 : 40,
                      angle: manyMonthsEff ? -20 : 0,
                      style: {
                        fontSize: manyMonthsEff ? "14.5px" : "17px",
                        fill: "black",
                        fontWeight: "bold",
                      },
                    }}
                    tickMargin={12}
                  />
                  <YAxis />
                  <Tooltip formatter={(v, name) => [v, `${name} — Posts`]} />
                  {BookEff.map((book, idx) => (
                    <Bar key={book} dataKey={book} fill={colorByBookEff(book)}>
                      <LabelList
                        dataKey={() => formatBookLabel(book)}
                        content={BookLabelBelowSingle}
                      />
                      <LabelList
                        dataKey={book}
                        position="inside"
                        fill="black"
                        fontWeight="bold"
                        fontSize={getDynamicFontSize(BookEff.length)}
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(graph7Ref, "Book_RealPosts_Per_Month");
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
export default BookGraphs;
