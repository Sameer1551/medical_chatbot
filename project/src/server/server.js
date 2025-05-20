import express from 'express';
import cors from 'cors';
import { ayurvedicData } from './mockData.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Authentication endpoints
app.post('/api/auth/signup', (req, res) => {
  const pythonProcess = spawn('python', [
    path.join(__dirname, 'auth_handler.py'),
    'signup',
    JSON.stringify(req.body)
  ]);

  let result = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data.toString()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    if (code === 0) {
      try {
        const response = JSON.parse(result);
        res.json(response);
      } catch (error) {
        console.error('Error parsing Python response:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to process signup'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  });
});

app.post('/api/auth/login', (req, res) => {
const pythonProcess = spawn('python', [
    path.join(__dirname, 'auth_handler.py'),
    'login',
    JSON.stringify(req.body)
  ]);

  let result = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const response = JSON.parse(result);
        res.json(response);
      } catch (error) {
        console.error('Error parsing Python response:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to process login'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to authenticate'
      });
    }
  });
});

// Medicine information endpoint
app.post('/api/medicine-info', async (req, res) => {
  const { medicineName } = req.body;
  
  if (!medicineName) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a medicine name'
    });
  }

  try {
    const url = `https://api.fda.gov/drug/label.json?search=${medicineName}`;
    const response = await axios.get(url, { timeout: 10000 });

    const data = response.data;
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const description = result.description || ["No description available."];
      const purpose = result.purpose || ["No purpose available."];
      const dosage = result.dosage_and_administration || ["No dosage information available."];
      const precautions = result.warnings || ["No precautions available."];

      function getFirstOrDefault(value) {
        if (Array.isArray(value) && value.length > 0) {
          return value[0];
        } else if (typeof value === 'string') {
          return value;
        } else {
          return "Information not available.";
        }
      }

      res.json({
        success: true,
        data: {
          medicine_name: medicineName,
          description: getFirstOrDefault(description),
          purpose: getFirstOrDefault(purpose),
          dosage_and_administration: getFirstOrDefault(dosage),
          precautions: getFirstOrDefault(precautions)
        }
      });
    } else {
      res.json({
        success: false,
        message: `No information found for medicine: ${medicineName}`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching medicine details: ${error.message}`
    });
  }
});

// Ayurvedic tips endpoint
app.post('/api/ayurvedic-tips', (req, res) => {
  const { condition } = req.body;
  
  if (!condition) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a condition'
    });
  }

  const normalizedCondition = condition.toLowerCase().trim();
  const data = ayurvedicData[normalizedCondition];

  if (data) {
    res.json({
      success: true,
      data: {
        tips: data.tips,
        precautions: data.precautions
      }
    });
  } else {
    const availableConditions = Object.keys(ayurvedicData).join(', ');
    res.json({
      success: false,
      message: `No tips found for "${condition}". Available conditions: ${availableConditions}`
    });
  }
});

// Medicine reminder endpoint
app.post('/api/reminders', (req, res) => {
  const { medicine, times, days, numberOfDays } = req.body;
  
  if (!medicine || !times || !days) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'reminder_handler.py'),
      JSON.stringify({
        medicine,
        times,
        days,
        numberOfDays
      })
    ]);

    let result = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(result);
          res.json({ success: true, ...response });
        } catch (error) {
          console.error('Error parsing Python response:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Failed to process reminder' 
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to save reminder' 
        });
      }
    });
  } catch (error) {
    console.error('Error spawning Python process:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Hospital finder endpoint
app.post('/api/nearby-hospitals', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  try {
    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:25000,${latitude},${longitude});
        way["amenity"="hospital"](around:25000,${latitude},${longitude});
        relation["amenity"="hospital"](around:25000,${latitude},${longitude});
      );
      out center;
    `;

    const response = await axios.post(overpassUrl, `data=${encodeURIComponent(query)}`);
    const elements = response.data.elements || [];

    const hospitals = elements.map(element => {
      const name = element.tags?.name || 'Unnamed Hospital';
      const center = element.center || { lat: element.lat, lon: element.lon };
      const hospitalLat = center.lat;
      const hospitalLon = center.lon;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospitalLat},${hospitalLon}`;
      return { name, maps_url: mapsUrl };
    });

    if (hospitals.length === 0) {
      return res.json({
        success: true,
        response: "No hospitals found within 25km of your location."
      });
    }

    const hospitalList = hospitals.map((h, i) => 
      `${i + 1}. ${h.name}\n   🗺️ <a href="${h.maps_url}" target="_blank" rel="noopener noreferrer">Get Directions</a>`
    ).join('\n\n');

    res.json({
      success: true,
      response: `Found ${hospitals.length} hospitals within 25km of your location:\n\n${hospitalList}`
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({
      success: false,
      response: 'Error fetching nearby hospitals. Please try again.'
    });
  }
});

// Specialist finder endpoint
app.post('/api/specialists', (req, res) => {
  const { specialistType } = req.body;

  if (!specialistType) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a specialist type'
    });
  }

  const specialistsFilePath = path.join(__dirname, 'data', 'specialists.json');

  fs.readFile(specialistsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading specialists.json:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to read specialists data'
      });
    }

    try {
      const specialistsData = JSON.parse(data);
      const specialists = specialistsData.specialists[specialistType.toLowerCase()];

      if (specialists && specialists.length > 0) {
        res.json({
          success: true,
          data: specialists
        });
      } else {
        res.json({
          success: false,
          message: `No specialists found for type: ${specialistType}`
        });
      }
    } catch (parseError) {
      console.error('Error parsing specialists.json:', parseError);
      res.status(500).json({
        success: false,
        message: 'Failed to parse specialists data'
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
