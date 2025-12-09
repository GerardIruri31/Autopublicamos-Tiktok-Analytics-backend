import React, { useState, useRef, useEffect } from "react";
import "./DataMaintenance.css";
import { useNavigate } from "react-router-dom";
import clickSound from "../Sounds/clicksound.mp3"; // Asegúrate de tener este archivo en la carpeta src
import { useMsal } from "@azure/msal-react";

const DataMaintenance = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [log, setLog] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [file, SetFile] = useState(null);
  const [isLoadingImportExcel, setIsLoadingImportExcel] = useState(false);

  const { instance } = useMsal();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const account = instance.getActiveAccount();
    const id = account?.idTokenClaims?.emails[0]
      ? account.idTokenClaims.emails[0].toLowerCase()
      : "null";
    setUserId(id);
  }, [instance]);

  // Sonidos al hacer clic
  const audioRef = useRef(new Audio(clickSound));
  const playSound = () => {
    audioRef.current.volume = 0.5; // 🎚 Ajusta el volumen (0.0 - 1.0)
    audioRef.current.loop = false; // 🔄 Evita que el sonido se repita automáticamente
    audioRef.current.currentTime = 0; // ⏪ Reinicia el audio en cada clic para evitar retrasos
    audioRef.current.play();
  };

  // nombres de tablas en BD
  const categories = {
    Authors: "m_autora",
    Books: "m_libro",
    "Scene name": "m_escenalibro",
    "Type post": "m_tipopost",
    Publisher: "m_posteadorasistente",
    "Post meta PA": "m_metaposteadorasistente",
    "Post meta Author": "m_metapostautora", // ✅ nuevo
    "Post meta Book": "m_metapostlibro",
  };

  // Diccionarios de campos
  const Tables = {
    Authors: {
      "Author Code": "codautora" || "Not found: N/A",
      "Author Name": "nbautora" || "Not found: N/A",
      "Author First name": "apeautora" || "Not found: N/A",
      "Active Record?": "flvigente" || "Not found: N/A",
      "Audit User": "codusuarioauditoria" || "Not found: N/A",
      "Creation Date": "fecreacionregistro" || "Not found: N/A",
      "Creation Hour": "horacreacionregistro" || "Not found: N/A",
      "Actualization Date": "fecactualizacionregistro" || "Not found: N/A",
      "Actualization Hour": "horaactualizacionregistro" || "Not found: N/A",
    },

    Books: {
      "Book Code": "codlibro" || "Not found: N/A",
      "Book Name": "deslibro" || "Not found: N/A",
      "Active Record?": "flvigente" || "Not found: N/A",
      "Audit User": "codusuarioauditoria" || "Not found: N/A",
      "Creation Date": "fecreacionregistro" || "Not found: N/A",
      "Creation Hour": "horacreacionregistro" || "Not found: N/A",
      "Actualization Date": "fecactualizacionregistro" || "Not found: N/A",
      "Actualization Hour": "horaactualizacionregistro" || "Not found: N/A",
    },

    "Scene name": {
      "Scene Code": "codescena" || "Not found: N/A",
      "Scene Name": "desscena" || "Not found: N/A",
      "Active Record?": "flvigente" || "Not found: N/A",
      "Audit User": "codusuarioauditoria" || "Not found: N/A",
      "Creation Date": "fecreacionregistro" || "Not found: N/A",
      "Creation Hour": "horacreacionregistro" || "Not found: N/A",
      "Actualization Date": "fecactualizacionregistro" || "Not found: N/A",
      "Actualization Hour": "horaactualizacionregistro" || "Not found: N/A",
    },

    "Type post": {
      "TypePost Code": "tippublicacion" || "Not found: N/A",
      "TypePost Name": "despost" || "Not found: N/A",
      "Active Record?": "flvigente" || "Not found: N/A",
      "Audit User": "codusuarioauditoria" || "Not found: N/A",
      "Creation Date": "fecreacionregistro" || "Not found: N/A",
      "Creation Hour": "horacreacionregistro" || "Not found: N/A",
      "Actualization Date": "fecactualizacionregistro" || "Not found: N/A",
      "Actualization Hour": "horaactualizacionregistro" || "Not found: N/A",
    },

    Publisher: {
      "PA Code": "codposteador" || "Not found: N/A",
      "PA DNI": "dniposteador" || "Not found: N/A",
      "PA Name": "nbposteador" || "Not found: N/A",
      "PA Paternal Name": "apepatposteador" || "Not found: N/A",
      "PA Maternal Name": "apematposteador" || "Not found: N/A",
      "Active Record?": "flvigente" || "Not found: N/A",
      "Audit User": "codusuarioauditoria" || "Not found: N/A",
      "Creation Date": "fecreacionregistro" || "Not found: N/A",
      "Creation Hour": "horacreacionregistro" || "Not found: N/A",
      "Actualization Date": "fecactualizacionregistro" || "Not found: N/A",
      "Actualization Hour": "horaactualizacionregistro" || "Not found: N/A",
    },

    "Post meta PA": {
      "PA Code": "codposteador" || "Not found: N/A",
      "Start Date": "fecinicioperiodometa" || "Not found: N/A",
      "Finish Date": "fecfinperiodometa" || "Not found: N/A",
      "Post Meta": "numpostemeta" || "Not found: N/A",
      "Active Record?": "flvigente" || "Not found: N/A",
      "Audit User": "codusuarioauditoria" || "Not found: N/A",
      "Creation Date": "fecreacionregistro" || "Not found: N/A",
      "Creation Hour": "horacreacionregistro" || "Not found: N/A",
      "Actualization Date": "fecactualizacionregistro" || "Not found: N/A",
      "Actualization Hour": "horaactualizacionregistro" || "Not found: N/A",
    },
    "Post meta Author": {
      "Author Code": "codautora",
      "Month Code": "codmes",
      "Post Meta": "numposteometa",
      "Active Record?": "flvigente",
      "Audit User": "codusuarioauditoria",
      "Creation Date": "fecreacionregistro",
      "Creation Hour": "horacreacionregistro",
      "Actualization Date": "fecactualizacionregistro",
      "Actualization Hour": "horaactualizacionregistro",
    },

    // ✅ Nuevo
    "Post meta Book": {
      "Book Code": "codlibro",
      "Month Code": "codmes",
      "Post Meta": "numposteometa",
      "Active Record?": "flvigente",
      "Audit User": "codusuarioauditoria",
      "Creation Date": "fecreacionregistro",
      "Creation Hour": "horacreacionregistro",
      "Actualization Date": "fecactualizacionregistro",
      "Actualization Hour": "horaactualizacionregistro",
    },
  };

  const handleExportToExcel = async () => {
    if (!dataLoaded) {
      alert("⚠️ ACTION REQUIRED: You must select a category first!");
      return;
    }

    try {
      //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
      //const azureURL = "http://localhost:8080";
      const azureURL = import.meta.env.VITE_AZURE_API_URL;
      const response = await fetch(azureURL + "/datamaintenance/download", {
        method: "GET",
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        mode: "cors",
      });
      if (!response.ok) {
        console.error(
          "❌ Error in server response (DataMaintenance - handleExportExcel):"
        );
        throw new Error(
          "❌ Error downloading the Excel file (DataMaintenance - handleExportExcel)"
        );
      }
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
      const fileName = `Maestras_tiktok_${selectedCategory}_${timestamp}.xlsx`; // Nombre generado en frontend
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      alert("✅ Excel File exported with success");
      console.log(
        "✅ Excel File exported with success (DataMaintenance - handleExportExcel): " +
          fileName
      );
    } catch (error) {
      console.error(
        "❌ Error downloading the Excel File (DataMaintenance - handleExportExcel):",
        error
      );
      alert("❌ Error downloading the Excel File");
    }
  };

  const SelectTable = (TableName) => {
    setSelectedCategory(TableName); // ✅ Guarda la categoría seleccionada

    switch (TableName) {
      case "Authors":
        handleShowDbRecords(categories["Authors"], Tables["Authors"]);
        break;
      case "Books":
        handleShowDbRecords(categories["Books"], Tables["Books"]);
        break;
      case "Scene name":
        handleShowDbRecords(categories["Scene name"], Tables["Scene name"]);
        break;
      case "Type post":
        handleShowDbRecords(categories["Type post"], Tables["Type post"]);
        break;
      case "Publisher":
        handleShowDbRecords(categories["Publisher"], Tables["Publisher"]);
        break;
      case "Post meta PA":
        handleShowDbRecords(categories["Post meta PA"], Tables["Post meta PA"]);
        break;
      case "Post meta Author":
        handleShowDbRecords(
          categories["Post meta Author"],
          Tables["Post meta Author"]
        );
        break;
      case "Post meta Book":
        handleShowDbRecords(
          categories["Post meta Book"],
          Tables["Post meta Book"]
        );
        break;
      default:
        console.warn(
          "⚠️ Invalid table selected (DataMaintenance - SelectTable)"
        );
    }
  };

  const handleShowDbRecords = async (tableName, RendererTable) => {
    if (!tableName || isLoading) return;
    setLog([]);
    setIsLoading(true);
    setRecords([]);
    setDataLoaded(false);

    try {
      const startTime = new Date();
      //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
      //const azureURL = "http://localhost:8080";
      const azureURL = import.meta.env.VITE_AZURE_API_URL;
      const response = await fetch(azureURL + "/datamaintenance/tablerecords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TableName: tableName.toLowerCase(),
        }),
      });

      if (!response.ok) {
        console.error(
          "❌ Error in server response (DataMaintenance - handleShowDbRecords):"
        );
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      console.log(
        "API Response (DataMaintenance - HandleShowDbRecords):",
        data
      );

      const filteredData = data.map((record) => {
        let transformedRecord = {};
        Object.keys(RendererTable).forEach((key) => {
          if (record.hasOwnProperty(RendererTable[key])) {
            transformedRecord[key] = record[RendererTable[key]];
          } else {
            console.warn(
              `Field "${RendererTable[key]}" not found on record (DataMaintenance - handleShowRecords)`,
              record
            );
            transformedRecord[key] = "Not found: N/A";
          }
        });
        return transformedRecord;
      });

      setRecords(filteredData);
      const processedRecords = data.length;
      if (data.length > 0) {
        setLog((prevLog) => [
          ...prevLog,
          `✅ Execution completed successfully. Data from PostgreSQL records`,
        ]);
      } else {
        setLog((prevLog) => [
          ...prevLog,
          `❌ Execution not completed. No data available`,
        ]);
      }
      setLog((prevLog) => [
        ...prevLog,
        `📊 Amount of Records from Database Query Processed: ${processedRecords}`,
      ]);
      const endTime = new Date();
      const durationInSeconds = Math.floor((endTime - startTime) / 1000); // 🔹 Convertimos a segundos enteros
      const minutes = Math.floor(durationInSeconds / 60); // 🔹 Extraemos los minutos
      const seconds = durationInSeconds % 60; // 🔹 Extraemos los segundos restantes
      const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`; // 🔹 Formateamos el tiempo

      setLog((prevLog) => [
        ...prevLog,
        `⏳ Total function execution time: ${formattedTime} minutes`,
      ]);
      setDataLoaded(true);
    } catch (error) {
      console.error(
        "❌ Error extracting information from DB (DataMaintenance - handleShowDbRecords): ",
        error
      );
      alert("❌ Error extracting information from DB");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la selección del archivo
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]; // 🔹 Guardamos el archivo en una variable local
    if (selectedFile) {
      SetFile(selectedFile); // ✅ Guardamos el archivo en el estado
      handleImportExcel(selectedFile);
      event.target.value = ""; // Permitir seleccionar el mismo archivo nuevamente
    }
  };

  const handleImportExcel = async (file) => {
    if (!file) {
      alert("⚠️ You must import an Excel file first!");
      return;
    }
    setLog([]);
    setIsLoadingImportExcel(true);
    setDataLoaded(false);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    try {
      const startTime = new Date();
      //const azureURL ="https://capp-springbootv1.thankfulfield-1f17e46d.centralus.azurecontainerapps.io";
      //const azureURL = "http://localhost:8080";
      const azureURL = import.meta.env.VITE_AZURE_API_URL;
      const response = await fetch(azureURL + "/datamaintenance/uploadexcel", {
        method: "POST",
        body: formData,
        mode: "cors", // 🔹 IMPORTANTE para evitar bloqueos CORS
      });

      if (!response.ok) {
        console.error(
          `Server responded with status (DataMaintenance - handleImportExcel) ${response.status}`
        );
        throw new Error(await response.text());
      }
      const data = await response.json();

      const fileName = file.name; // Obtener el nombre del archivo
      console.log("API Response (DataMaintenance - handleImportExcel):", data);
      const processedRecords = data["message"] || 0;

      if (Object.keys(data).length === 0) {
        setLog((prevLog) => [
          ...prevLog,
          `❌ Execution not completed. Attempted to import data from the file: ${fileName}`,
        ]);
      } else {
        setLog((prevLog) => [
          ...prevLog,
          `✅ Execution completed successfully. Data imported from file: ${fileName}`,
        ]);
      }
      setLog((prevLog) => [
        ...prevLog,
        `📊 Amount of Records saved in the Database Process: ${processedRecords}`,
      ]);

      const endTime = new Date();
      const durationInSeconds = Math.floor((endTime - startTime) / 1000); // 🔹 Convertimos a segundos enteros
      const minutes = Math.floor(durationInSeconds / 60); // 🔹 Extraemos los minutos
      const seconds = durationInSeconds % 60; // 🔹 Extraemos los segundos restantes
      const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`; // 🔹 Formateamos el tiempo

      setLog((prevLog) => [
        ...prevLog,
        `⏳ Total function execution time: ${formattedTime} minutes`,
      ]);

      SetFile(null); // Limpia el estado después de subir
      setDataLoaded(true);

      if (Object.keys(data).length === 0) {
        alert("❌ Error importing Excel file");
        console.error(
          "❌ Error at importing Excel file (DataMaintenance - handleImportExcel)"
        );
      } else {
        alert("✅ Excel file Imported with success.");
        console.log(
          "✅ Excel file imported with success (DataMaintenance - handleImportExcel): " +
            fileName
        );
      }
    } catch (error) {
      console.error(
        "❌ Error at importing Excel file (DataMaintenance - handleImportExcel): ",
        error
      );
      alert("❌ Error at importing Excel file.");
    } finally {
      setIsLoadingImportExcel(false);
    }
  };

  return (
    <div className="data-maintenance-container">
      <header className="maintenance-header">
        <h1>DATA MAINTENANCE</h1>
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
      <div className="filter-container">
        <div className="filter-options">
          {Object.keys(categories).map((categoryKeys) => (
            <button
              key={categoryKeys}
              className="filter-button"
              onClick={() => {
                SelectTable(categoryKeys);
                playSound();
              }}
              disabled={isLoading} // 🔹 Deshabilita los botones si está cargando
            >
              {categoryKeys}
            </button>
          ))}
        </div>
      </div>
      <div className="results-table-container1">
        <table className="results-table1">
          <thead>
            <tr>
              {selectedCategory && Tables[selectedCategory] ? (
                Object.keys(Tables[selectedCategory]).map((header) => (
                  <th key={header}>{header}</th>
                ))
              ) : (
                <th>No Data Found</th>
              )}
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.slice(0, 20).map((row, index) => {
                return (
                  <tr key={index}>
                    {Object.keys(Tables[selectedCategory] || {}).map(
                      (field, i) => (
                        <td key={i}>
                          {" "}
                          {row[field] !== undefined && row[field] !== null
                            ? row[field]
                            : "Not found: N/A"}{" "}
                        </td>
                      )
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={Object.keys(Tables[selectedCategory] || {}).length}
                  className="no-data-placeholder1"
                >
                  <div className="no-data-row1">
                    <div className="no-data-container1 table">
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
      <div className="export-import-container1">
        <button
          className="export-dbquery-button1"
          onClick={() => {
            playSound();
            handleExportToExcel();
          }}
        >
          Export to Excel
        </button>
        <label className="import-excel-button1">
          Import Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={(event) => {
              playSound();
              handleFileChange(event);
            }}
            disabled={isLoadingImportExcel} // 🔹 Deshabilita el botón si está cargando
          />
        </label>
      </div>

      <div className="log-container2">
        <h1>Overview of TikTok Rest API Monitoring</h1>
        {!dataLoaded ? (
          <div className="no-data-container2">
            <h2>No Data Found</h2>
            <p>We couldn't find any data to display.</p>
          </div>
        ) : (
          <div className="no-data-container2">
            {log.map((entry, index) => (
              <p key={index}>{entry}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DataMaintenance;
