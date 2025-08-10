# Flood Detection Dashboard Integration

This document describes the integration of flood detection dashboard features into the existing 3D weather globe application.

## Overview

The flood detection dashboard has been integrated into the existing Vue.js 3D weather globe application, providing real-time flood risk assessment alongside weather information.

## Features Implemented

### 1. Flood Risk API Integration
- **File**: `src/map/FloodRiskAPI.js`
- **Purpose**: Handles communication with the backend flood risk prediction system
- **Endpoints**:
  - `GET /api/get_flood_risk?lat=<lat>&lon=<lon>` - Get current flood risk data
  - `GET /api/get_historical_data?region=<region>&days=<days>` - Get historical data
  - `GET /api/get_risk_zones?lat=<lat>&lon=<lon>&radius=<radius>` - Get nearby risk zones

### 2. Flood Risk Display Component
- **File**: `src/components/FloodRiskCard.vue`
- **Features**:
  - Real-time sensor readings display
  - Color-coded risk level indicators
  - Water level, rainfall, soil moisture, temperature, and humidity data
  - Nearby risk zones information
  - Action buttons for historical data and map view

### 3. Historical Data Visualization
- **File**: `src/components/HistoricalDataChart.vue`
- **Features**:
  - Interactive time period selection (24h, 7d, 30d)
  - Water level trend visualization
  - Summary statistics (avg water level, max rainfall, risk changes, current trend)
  - Risk timeline display
  - Canvas-based chart rendering

### 4. Backend API Server
- **File**: `backend/app.py`
- **Purpose**: Mock backend server providing flood risk data
- **Features**:
  - Realistic mock data generation based on coordinates
  - Geographic variation in flood risk factors
  - Historical data generation with trends
  - Risk zone generation around specified locations

## Integration Points

### Main Application (`App.vue`)
- **Flood Risk Data Fetching**: Integrated into `onVRMarkerFocus()` function
- **State Management**: Added flood risk data, risk zones, and historical data to reactive state
- **UI Toggle**: Added buttons to switch between weather and flood risk views
- **Location Updates**: Flood risk information is displayed in the location list

### 3D Globe Integration
- **Risk Indicators**: Flood risk levels are shown in the location list with color coding
- **Toggle Buttons**: Users can switch between weather and flood risk views
- **Future Enhancement**: Risk zones can be visualized on the 3D globe (TODO)

## Data Flow

1. **User selects a location** on the 3D globe
2. **Weather data** is fetched from OpenWeather API
3. **Flood risk data** is fetched from the backend API
4. **Risk zones** are fetched for the surrounding area
5. **UI updates** to show both weather and flood risk information
6. **User can toggle** between weather and flood risk views
7. **Historical data** can be accessed for trend analysis

## Risk Classification

The system uses a 4-level risk classification:

- **🟢 Low**: Minimal flood risk
- **🟡 Moderate**: Some flood risk, monitor conditions
- **🟠 High**: Significant flood risk, take precautions
- **🔴 Critical**: Severe flood risk, immediate action required

## Sensor Data Displayed

- **Water Level**: Current water level in meters
- **Rainfall**: Recent rainfall in millimeters
- **Soil Moisture**: Soil moisture percentage
- **Temperature**: Current temperature in Celsius
- **Humidity**: Current humidity percentage

## Setup Instructions

### Frontend Setup
1. The flood detection components are already integrated into the Vue.js application
2. No additional setup required for the frontend

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd weather-3d-globe/backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   python app.py
   ```

4. The server will run on `http://localhost:8000`

### Development Mode
1. Start the backend server (see above)
2. Start the frontend development server:
   ```bash
   cd weather-3d-globe
   npm run dev
   ```

3. The application will be available at `http://localhost:5173`

## API Endpoints

### Get Flood Risk Data
```
GET /api/get_flood_risk?lat=22.5726&lon=88.3639
```

**Response:**
```json
{
  "location": "Location at 22.573, 88.364",
  "flood_risk": "Moderate",
  "water_level": 2.3,
  "rainfall_mm": 12.5,
  "soil_moisture": 0.68,
  "temp": 29.0,
  "humidity": 85.0,
  "timestamp": "2024-01-15T10:30:00.000000",
  "coordinates": {"lat": 22.5726, "lon": 88.3639}
}
```

### Get Historical Data
```
GET /api/get_historical_data?region=Kolkata&days=7
```

**Response:**
```json
[
  {
    "timestamp": "2024-01-08T10:30:00.000000",
    "water_level": 1.8,
    "rainfall_mm": 8.2,
    "soil_moisture": 0.45,
    "risk": "Low"
  },
  // ... more data points
]
```

### Get Risk Zones
```
GET /api/get_risk_zones?lat=22.5726&lon=88.3639&radius=50
```

**Response:**
```json
{
  "zones": [
    {
      "lat": 22.580123,
      "lon": 88.370456,
      "risk": "High",
      "radius": 3.2
    },
    // ... more zones
  ]
}
```

## Future Enhancements

### 1. Real-time Data Streaming
- Implement WebSocket connections for live sensor data updates
- Real-time risk level changes
- Live alerts and notifications

### 2. 3D Risk Zone Visualization
- Display risk zones as colored overlays on the 3D globe
- Animated risk indicators
- Interactive risk zone selection

### 3. Advanced Analytics
- Machine learning model integration
- Predictive flood risk forecasting
- Trend analysis and pattern recognition

### 4. Alert System
- Push notifications for high-risk conditions
- Email/SMS alerts for critical situations
- Customizable alert thresholds

### 5. Data Integration
- Real sensor data integration
- Weather radar data
- Satellite imagery integration

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure the backend server is running on port 8000
   - Check CORS settings if accessing from different domains
   - Verify the API base URL in `FloodRiskAPI.js`

2. **Mock Data Display**
   - The system uses mock data when the backend is unavailable
   - Check browser console for API error messages
   - Verify network connectivity

3. **Component Not Displaying**
   - Check Vue.js component imports
   - Verify component registration
   - Check browser console for JavaScript errors

### Debug Mode
- Enable browser developer tools to see API requests
- Check the Network tab for failed requests
- Review Console tab for error messages

## Contributing

To extend the flood detection dashboard:

1. **Add new sensor types** in `FloodRiskAPI.js`
2. **Create new visualization components** in `src/components/`
3. **Extend the backend API** in `backend/app.py`
4. **Update the UI** in `App.vue` and related components

## License

This flood detection dashboard integration is part of the SmartFloodGuard project and follows the same licensing terms as the main application.
