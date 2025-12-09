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
  const [authors, setAuthors] = useState("");
  //const [books, setBooks] = useState("");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [textButtom, setTextButtom] = useState("Generate Graphs");
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

  const transformedData =
    currentGraphType === "main" && records[1] && Array.isArray(records[1])
      ? Object.values(
          records[1].reduce((acc, item) => {
            const { fecpublicacion, nbrautora, sumnumviews } = item;

            if (!acc[fecpublicacion]) {
              acc[fecpublicacion] = { fecpublicacion }; // Crear la clave con la fecha
            }
            acc[fecpublicacion][nbrautora] = sumnumviews; // Asignar los views al autor correcto

            return acc;
          }, {})
        ).sort(
          (a, b) => new Date(a.fecpublicacion) - new Date(b.fecpublicacion)
        ) // Ordenar por fecha
      : [];

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
    if (!r || !r.mes || !r.nbrAutora) return [];
    return [
      {
        mes: r.mes,
        autora: r.nbrAutora,
        views: Number(r.promNumviews ?? 0),
        interactions: Number(r.promInteraction ?? 0),
      },
    ];
  });

  // Autoras únicas
  const autorasVI = Array.from(new Set(registrosVI.map((r) => r.autora)));

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

  const AutorLabelCentered = (props) => {
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

  const getDynamicFontSize = (count, base = 12, min = 8) => {
    if (!count || count <= 5) return base; // pocos elementos → tamaño base
    if (count >= 20) return min; // muchos elementos → tamaño mínimo
    // escala lineal entre base y min
    const scale = (count - 5) / (20 - 5);
    return Math.max(min, Math.round(base - scale * (base - min)));
  };

  const registrosEng = (metricsSourceRaw || []).flatMap((r) => {
    if (!r || !r.mes || !r.nbrAutora) return [];
    return [
      {
        mes: r.mes,
        autora: r.nbrAutora,
        engagement: Number(r.promNumengagement ?? 0),
      },
    ];
  });

  // Autoras únicas (para iterar barras por autora)
  const autorasEng = Array.from(new Set(registrosEng.map((r) => r.autora)));

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
  const AutorLabelBelowSingle = (props) => {
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
    autorasEng.forEach((a, i) => {
      map[a] = shuffled[i % shuffled.length];
    });
    return map;
    // si cambian las autoras o "reseteamos" el run, se regenera
  }, [autorasEng.join("|"), colorRunId]);

  const colorByAuthorEng = (autor) => colorMapEng[autor] || "#1F4E79";

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
    const autora = r?.nbautora ?? r?.nbrAutora;
    if (!mes || !autora) return [];
    return [
      {
        mes,
        autora,
        eficacia: Number(r?.eficacia ?? 0),
        realPosts: Number(r?.numposteoreal ?? 0),
      },
    ];
  });

  // autoras únicas
  const autorasEff = Array.from(new Set(registrosEff.map((r) => r.autora)));

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
    autorasEff.forEach((a, i) => {
      map[a] = shuffled[i % shuffled.length];
    });
    return map;
  }, [autorasEff.join("|"), colorRunId]);

  const colorByAuthorEff = (autor) => colorMapEff[autor] || "#1F4E79";

  // Referencias a los gráficos
  const graph1Ref = useRef(null);
  const graph2Ref = useRef(null);
  const graph3Ref = useRef(null);
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
          "📥 Successfull image download (AuthorGraphs - handleDownloadGraph): " +
            finalName
        );
      });
    }, 500); // Pequeña pausa para asegurar el renderizado completo
  };

  const handleGetDataFromDB = async () => {
    if (!dateFrom || !dateTo || !authors) {
      alert("⚠️ ACTION REQUIRED: You must fill all the fields");
      return;
    }

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    // Validamos si la fecha inicial es mayor que la final
    if (fromDate > toDate) {
      alert(
        "⚠️ The 'From' Posted Date must be earlier than the 'To' Posted Date."
      );
      return;
    }

    if (window.confirm("📊 Do you want to generate the graphs?")) {
      setRecords([]);
      setIsLoading(true);
      setDataLoaded(false);
      setTextButtom("Generating Graphs...");
      setLog([]);
      setCurrentGraphType("main"); // Set graph type to main

      try {
        const startTime = new Date();

        const formattedAuthors = authors
          .split(",")
          .map((pa) => pa.trim().toUpperCase())
          .filter((u) => u !== "");

        {
          /*const formattedBooks = books
          .split(",")
          .map((pa) => pa.trim())
          .filter((u) => u !== "");*/
        }

        const body = {
          dateFrom: dateFrom,
          dateTo: dateTo,
          Author: formattedAuthors,
          //Books: formattedBooks,
        }; // Solo agrega "Books" si tiene valores

        console.log(
          "📤 Sending request with data (AuthorGraphs - handleGetDataFromDB): ",
          body
        );
        //const azureURL = "http://localhost:8080";
        //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
        const azureURL = import.meta.env.VITE_AZURE_API_URL;
        const response = await fetch(azureURL + "/authorsgraphs/getdata", {
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
            `🚨 Server responded with status (AuthorGraphs - handleGetDataFromDB) ${response.status}`
          );
          throw new Error(
            `🚨 An error occurred while fetching the data (AuthorGraphs - handleGetDataFromDB) ${response.status}`
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

        //const NotFoundAuthors = formattedAuthors.filter(u => !(u in data[0]));

        const NotFoundAuthors = formattedAuthors.filter((u) => {
          return !data[0].some((dic) => dic && u == dic["codautora"]);
        });

        console.log(
          "API Response (AuthorGraphs - handleGetDataFromDB): ",
          data
        );
        console.log(
          "Not found Authors Code (AuthorGraphs - handleGetDataFromDB): " +
            NotFoundAuthors
        );
        setLog((prevLog) => [
          ...prevLog,
          `📊 Amount of Author Records obtained in the Database Process: ${data[0].length}`,
        ]);

        if (data[0].length > 0) {
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
          "❌ Error extracting information from DB (AuthorGraphs - handleGetDataFromDB): ",
          error
        );
        alert("❌ An error occurred while generating the graphs");
      } finally {
        setIsLoading(false);
        setTextButtom("Generate Graphs");
      }
    }
  };

  const handleMetricsPerMonth = async () => {
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

    if (window.confirm("📊 Do you want to generate the metrics per month?")) {
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
        const response = await fetch(azureURL + "/authorsgraphs/dataPerMonth", {
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
            `🚨 Server responded with status (Metrics per Month) ${response.status}`
          );
          throw new Error(
            `🚨 An error occurred while fetching metrics per month ${response.status}`
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
            `📊 Amount of Metrics per Month Records obtained: ${rows.length}`,
          ]);
          setLog((prev) => [
            ...prev,
            `✅ Metrics per Month execution completed successfully`,
          ]);
        } else {
          setLog((prev) => [
            ...prev,
            `❌ Metrics per Month execution not completed. No data available`,
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
        console.error("❌ Error extracting metrics per month from DB: ", error);
        alert("❌ An error occurred while generating the metrics per month");
      } finally {
        setIsLoading(false);
        setTextButtomMetrics("Metrics per Month");
      }
    }
  };

  const handleEffectivenessPerMonth = async () => {
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
          azureURL + "/authorsgraphs/effectivenessAuthorPerMonth",
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
        <h1>AUTHOR'S GRAPHS</h1>
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
          <label>Authors:</label>
          <textarea
            style={{ textTransform: "uppercase" }}
            placeholder="Enter the Author's code separated by commas"
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
                handleEffectivenessPerMonth();
                playSound();
              }}
              disabled={isLoading}
            >
              {textButtomEffectiveness}
            </button>
            <button
              className="generate-graphs-button4"
              onClick={() => {
                handleGetDataFromDB();
                playSound();
              }}
              disabled={isLoading}
            >
              {textButtom}
            </button>
            <button
              className="generate-graphs-button4"
              onClick={() => {
                handleMetricsPerMonth();
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
                Comparison of Average Views and Interactions per month per
                author
              </h3>

              {/* Estado vacío o con error de datos */}
              {!Array.isArray(datosVI) ||
              datosVI.length === 0 ||
              autorasVI.length === 0 ? (
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
                        const [autorName, met] = String(name).split("__");
                        const etiqueta =
                          met === "views" ? "Average Views" : "Interactions";
                        const val = Number(value ?? 0).toLocaleString();
                        return [val, `${autorName} — ${etiqueta}`];
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
                    {autorasVI.map((autor) => {
                      return (
                        <React.Fragment key={autor}>
                          {/* Views (izquierda del par) */}
                          <Bar
                            dataKey={`${autor}__views`}
                            fill="#4472C4"
                            name={`${autor}__views`}
                          >
                            <LabelList
                              dataKey={() => autor}
                              content={AutorLabelCentered}
                            />
                            <LabelList
                              dataKey={`${autor}__views`}
                              position="inside"
                              fontWeight="bold"
                              fill="black"
                              fontSize={getDynamicFontSize(autorasVI.length)}
                              formatter={(v) =>
                                Math.round(Number(v ?? 0)).toLocaleString()
                              }
                            />
                          </Bar>

                          {/* Interactions (derecha del par) */}
                          <Bar
                            dataKey={`${autor}__interactions`}
                            fill="#FF3333" // misma autora, tono más oscuro
                            name={`${autor}__interactions`}
                          >
                            <LabelList
                              dataKey={`${autor}__interactions`}
                              position="top"
                              fontWeight="bold"
                              fill="black"
                              dy={-5}
                              fontSize={getDynamicFontSize(autorasVI.length)}
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
                  "Views_Interactions_Per_Month_Combined"
                );
                playSound();
              }}
            >
              Download Graph
            </button>

            <div className="graph2" ref={graph4Ref}>
              <h3>Comparison of Engagement Rate per month per author</h3>
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
                  {autorasEng.map((autor) => (
                    <Bar
                      key={autor}
                      dataKey={autor}
                      fill={colorByAuthorEng(autor)}
                      name={autor}
                    >
                      {/* Nombre de autora centrado BAJO su barra */}
                      <LabelList
                        dataKey={() => autor}
                        content={AutorLabelBelowSingle}
                      />
                      {/* Valor en % dentro/arriba de la barra */}
                      <LabelList
                        dataKey={autor}
                        position="inside"
                        fontWeight="bold"
                        fill="black"
                        fontSize={getDynamicFontSize(autorasEng.length)}
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
                  "Engagement_Rate_Per_Month_Per_Author"
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
              <h3>Comparison of Effectiveness % per month per author</h3>
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
                  {autorasEff.map((autor, idx) => (
                    <Bar
                      key={autor}
                      dataKey={autor}
                      fill={colorByAuthorEff(autor)}
                    >
                      <LabelList
                        dataKey={() => autor}
                        content={AutorLabelBelowSingle}
                      />
                      <LabelList
                        dataKey={autor}
                        position="inside"
                        fontWeight="bold"
                        fill="black"
                        formatter={(v) => `${Number(v ?? 0).toFixed(0)}%`}
                        fontSize={getDynamicFontSize(autorasEff.length)}
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(graph6Ref, "Effectiveness_Per_Month");
                playSound();
              }}
            >
              Download Graph
            </button>

            {/* Gráfica 2: Real posts */}
            <div className="graph2" ref={graph7Ref}>
              <h3>Comparison of Real Posts per month per author</h3>
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
                  {autorasEff.map((autor, idx) => (
                    <Bar
                      key={autor}
                      dataKey={autor}
                      fill={colorByAuthorEff(autor)}
                    >
                      <LabelList
                        dataKey={() => autor}
                        content={AutorLabelBelowSingle}
                      />
                      <LabelList
                        dataKey={autor}
                        position="inside"
                        fill="black"
                        fontWeight="bold"
                        fontSize={getDynamicFontSize(autorasEff.length)}
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(graph7Ref, "RealPosts_Per_Month");
                playSound();
              }}
            >
              Download Graph
            </button>
          </>
        ) : currentGraphType === "main" &&
          Array.isArray(records[0]) &&
          records[0].length > 0 &&
          Array.isArray(records[1]) &&
          records[1].length > 0 ? (
          <>
            {/* Gráfico 1: Average Views & Interactions */}
            <div className="graph2" ref={graph1Ref}>
              <h3>Average Views - Interactions per Author</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={records[0]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nbrautora"
                    tick={{
                      dy: records[0].length >= 11 ? 21 : 10,
                      angle: records[0].length >= 11 ? -20 : 0, // 🔥 Si hay 13 o más datos, rota 30°
                      style: {
                        fontSize: records[0].length >= 11 ? "14.5px" : "16px",
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
                      paddingTop: records[0].length >= 11 ? 27 : 20,
                    }}
                    layout="horizontal"
                  />
                  <Bar dataKey="promnumviews" fill="#66D2CE" name="Views">
                    <LabelList
                      dataKey="promnumviews"
                      position="inside"
                      fontWeight="bold" // 🔥 Texto en negrita
                      fill="black" //  Color del texto
                      fontSize={records[0].length >= 7 ? "14px" : "16px"}
                    />
                    {/* 🔥 Forzar renderizado de etiquetas */}
                  </Bar>
                  <Bar
                    dataKey="prominteraction"
                    fill="#2DAA9E"
                    name="Interactions"
                  >
                    <LabelList
                      dataKey="prominteraction"
                      position="top"
                      fontWeight="bold" // 🔥 Texto en negrita
                      fill="black" //  Color del texto
                      dy={-5} // Ajusta la distancia vertical (valores negativos la suben más)
                      fontSize={records[0].length >= 7 ? "14px" : "16px"}
                    />
                    {/* 🔥 Forzar renderizado de etiquetas */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(
                  graph1Ref,
                  "Average_Views_Interactions_Per_Author"
                );
                playSound();
              }}
            >
              Download Graph
            </button>

            <div className="graph2" ref={graph2Ref}>
              <h3>Average Engagement per Author</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={records[0]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nbrautora"
                    tick={{
                      dy: records[0].length >= 11 ? 21 : 10,
                      angle: records[0].length >= 11 ? -20 : 0, // 🔥 Si hay 13 o más datos, rota 30°
                      style: {
                        fontSize: records[0].length >= 11 ? "14.5px" : "16px",
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
                      paddingTop: records[0].length >= 11 ? 27 : 20,
                    }}
                    layout="horizontal"
                  />
                  <Bar
                    dataKey="promnumengagement"
                    fill="#B5A8D5"
                    name="Engagement (%)"
                  >
                    <LabelList
                      dataKey="promnumengagement"
                      position="inside"
                      fontWeight="bold" // 🔥 Texto en negrita
                      fill="black" //  Color del texto
                      fontSize={records[0].length >= 7 ? "14px" : "16.5px"}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(graph2Ref, "Average_Engagement_per_Author");
                playSound();
              }}
            >
              Download Graph
            </button>

            {/*Gráfico 3: Average Views & Interactions*/}
            <div className="graph2" ref={graph3Ref}>
              <h3>Number of Views per Posted Day per Author</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={transformedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="fecpublicacion"
                    tick={{
                      dy: transformedData.length >= 13 ? 15 : 10,
                      angle: transformedData.length >= 13 ? -30 : 0, // 🔥 Si hay 13 o más datos, rota 30°
                      style: {
                        fontSize:
                          transformedData.length >= 13 ? "14px" : "16px",
                      },
                    }} // Desplaza los labels hacia abajo
                    interval={0} // 🔥 Muestra TODAS las etiquetas sin saltarse ninguna
                    tickFormatter={(value) => `${value}`} // 🔥 Asegura que los valores se rendericen correctamente
                    padding={{ left: 40, right: 40 }}
                  >
                    <Label offset={-40} position="insideBottom" />
                  </XAxis>

                  {(() => {
                    const maxYValue = Math.max(
                      ...transformedData.flatMap((item) =>
                        Object.values(item).filter(
                          (val) => typeof val === "number"
                        )
                      )
                    );

                    // 🔥 Redondea a la centena más cercana después de sumar 300
                    const adjustedMaxY =
                      Math.ceil((maxYValue + 4000) / 100) * 100;

                    return (
                      <YAxis
                        domain={[0, adjustedMaxY]} // 🔥 Ajuste automático con margen de 300
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                    );
                  })()}

                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      paddingTop: transformedData.length >= 13 ? 27 : 20,
                    }}
                    layout="horizontal"
                  />

                  {[...new Set(records[1].map((item) => item.nbrautora))].map(
                    (author, index) => {
                      const colores = [
                        "#F4A261",
                        "#8E44AD",
                        "#D62828",
                        "#6A0572",
                        "#1B263B",
                        "#E63946",
                        "#14213D",
                        "#F77F00",
                        "#582F0E",
                        "#9D0208",
                        "#FF6F61",
                        "#6A0572",
                        "#E83F6F",
                        "#4A90E2",
                        "#FFAA33",
                        "#1B998B",
                        "#C3423F",
                        "#D9BF77",
                        "#5A189A",
                        "#00A8E8",
                      ]; // 🔥 Guardamos el color en una variable
                      const color =
                        colores[Math.floor(Math.random() * colores.length)]; // 🔥 Color aleatorio

                      return (
                        <Line
                          key={index}
                          dataKey={author}
                          name={author}
                          stroke={color} // 🔥 Asignamos el color de la línea
                          strokeWidth={3}
                          dot={{ r: 6, fill: color }} // 🔥 Ahora los puntos tienen el mismo color
                          activeDot={{ r: 8, fill: color }} // 🔥 Puntos resaltados también del mismo color
                          connectNulls={true}
                        >
                          <LabelList
                            dataKey={author}
                            position="top"
                            fill={color}
                            fontSize="14px"
                            fontWeight="bold"
                            dy={-6}
                          />
                        </Line>
                      );
                    }
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <button
              className="download-button2"
              onClick={() => {
                handleDownloadGraph(graph3Ref, "Number_views_perDay_perAuthor");
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
