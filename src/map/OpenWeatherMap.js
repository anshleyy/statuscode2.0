const VITE_APP_OPEN_WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const VITE_APP_OPEN_WEATHER_APPID = "80701c3a9ae3788aaa174f5f51aa8c9c";

class OpenWeatherMap {
    async fetchForecastWeatherData(lat, lon, units) {
        const params = {
            lat,
            lon,
            units,
            appid: VITE_APP_OPEN_WEATHER_APPID
        };
        const options = {
            method: 'GET'
        };
        let url = VITE_APP_OPEN_WEATHER_API;

        url += '?' + ( new URLSearchParams( params ) ).toString();

        const response = await fetch(url, options);
        return response.json();
    }
}

export default new OpenWeatherMap();