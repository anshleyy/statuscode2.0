const VITE_APP_FLOOD_API_BASE = "http://localhost:8000/api";

class FloodRiskAPI {
    async fetchFloodRiskData(lat, lon) {
        const params = {
            lat: lat.toFixed(6),
            lon: lon.toFixed(6)
        };
        
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        let url = `${VITE_APP_FLOOD_API_BASE}/get_flood_risk`;
        url += '?' + (new URLSearchParams(params)).toString();
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching flood risk data:', error);
            // Return mock data for development/testing
            return this.getMockFloodData(lat, lon);
        }
    }
    
    async fetchHistoricalData(region, days = 7) {
        const params = {
            region,
            days
        };
        
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        let url = `${VITE_APP_FLOOD_API_BASE}/get_historical_data`;
        url += '?' + (new URLSearchParams(params)).toString();
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching historical data:', error);
            return this.getMockHistoricalData(region, days);
        }
    }
    
    async fetchRiskZones(lat, lon, radius = 50) {
        const params = {
            lat: lat.toFixed(6),
            lon: lon.toFixed(6),
            radius
        };
        
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        let url = `${VITE_APP_FLOOD_API_BASE}/get_risk_zones`;
        url += '?' + (new URLSearchParams(params)).toString();
        
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching risk zones:', error);
            return this.getMockRiskZones(lat, lon, radius);
        }
    }
    
    // Mock data for development/testing
    getMockFloodData(lat, lon) {
        const risks = ['Low', 'Moderate', 'High', 'Critical'];
        const randomRisk = risks[Math.floor(Math.random() * risks.length)];
        
        return {
            location: "Sample Location",
            flood_risk: randomRisk,
            water_level: (Math.random() * 5 + 0.5).toFixed(1),
            rainfall_mm: (Math.random() * 50 + 5).toFixed(1),
            soil_moisture: (Math.random() * 0.8 + 0.2).toFixed(2),
            temp: Math.floor(Math.random() * 20 + 15),
            humidity: Math.floor(Math.random() * 40 + 40),
            timestamp: new Date().toISOString(),
            coordinates: { lat, lon }
        };
    }
    
    getMockHistoricalData(region, days) {
        const data = [];
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            data.push({
                timestamp: date.toISOString(),
                water_level: (Math.random() * 5 + 0.5).toFixed(1),
                rainfall_mm: (Math.random() * 50 + 5).toFixed(1),
                soil_moisture: (Math.random() * 0.8 + 0.2).toFixed(2),
                risk: ['Low', 'Moderate', 'High', 'Critical'][Math.floor(Math.random() * 4)]
            });
        }
        
        return data;
    }
    
    getMockRiskZones(lat, lon, radius) {
        const zones = [];
        const numZones = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < numZones; i++) {
            const offsetLat = (Math.random() - 0.5) * 0.1;
            const offsetLon = (Math.random() - 0.5) * 0.1;
            const risks = ['Low', 'Moderate', 'High'];
            const risk = risks[Math.floor(Math.random() * risks.length)];
            
            zones.push({
                lat: lat + offsetLat,
                lon: lon + offsetLon,
                risk,
                radius: Math.random() * 5 + 1
            });
        }
        
        return { zones };
    }
}

export default new FloodRiskAPI();
