const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const AdmZip = require("adm-zip");
const axios = require("axios");

app.use(cors());

const PORT = 3000;
const ZIP_URL = "https://raw.githubusercontent.com/open-devsecops/topic-2-lab-reference-app-azure/refs/heads/main/data_share/data.zip";
const ZIP_PATH = path.join(__dirname, "repo.zip");
const EXTRACT_PATH = __dirname;

async function downloadAndExtract() {
    console.log("Downloading ZIP file...");

    const response = await axios({
        method: "GET",
        url: ZIP_URL,
        responseType: "arraybuffer"
    });

    fs.writeFileSync(ZIP_PATH, response.data);
    console.log("ZIP file downloaded.");

    console.log("Extracting ZIP file...");
    const zip = new AdmZip(ZIP_PATH);
    zip.extractAllTo(EXTRACT_PATH, true);
    console.log("Extraction completed.");

    // Cleanup ZIP file
    fs.unlinkSync(ZIP_PATH);
    console.log("ZIP file deleted.");
}

downloadAndExtract()
    .then(() => {
        console.log("Starting server...");
        app.listen(PORT, () => {
            console.log(`========= Server running on port ${PORT} =========`);
        });

        app.get("/", (req, res) => {
            res.send("Hello, the repository is extracted!");
        });
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });


app.get("/taxi_zones", (req, res) => {
    const filePath = path.join(__dirname, "data", "taxi_zones.geojson");

    // Read the file and send JSON response
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Failed to load data" });
        } else {
            try {
                const jsonData = JSON.parse(data); // Parse the geojson content
                res.json(jsonData);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                res.status(500).json({ error: "Invalid JSON format" });
            }
        }
    });
});



app.get("/data_from_local/:year", (req, res) => {
    const year = req.params.year;
    const filePath = path.join(__dirname, "data", `${year}.geojson`);

    // Read the file and send JSON response
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            res.status(500).json({ error: "Failed to load data" });
        } else {
            try {
                const jsonData = JSON.parse(data); // Parse the JSON content
                res.json(jsonData);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                res.status(500).json({ error: "Invalid JSON format" });
            }
        }
    });
});
