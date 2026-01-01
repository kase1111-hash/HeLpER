use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

const WEATHER_API_TIMEOUT_SECS: u64 = 10;
const WEATHERAPI_BASE_URL: &str = "https://api.weatherapi.com/v1";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WeatherData {
    pub location: String,
    pub temp_celsius: f32,
    pub temp_fahrenheit: f32,
    pub feels_like_celsius: f32,
    pub feels_like_fahrenheit: f32,
    pub condition: String,
    pub condition_text: String,
    pub humidity: f32,
    pub wind_kph: f32,
    pub wind_mph: f32,
    pub wind_direction: String,
    pub pressure: f32,
    pub uv_index: f32,
    pub visibility: f32,
    pub is_day: bool,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JournalContext {
    pub weather: Option<WeatherData>,
    pub day_of_week: String,
    pub time_of_day: String,
    pub moon_phase: Option<String>,
}

// WeatherAPI.com response structures
#[derive(Debug, Deserialize)]
struct WeatherApiResponse {
    location: WeatherApiLocation,
    current: WeatherApiCurrent,
}

#[derive(Debug, Deserialize)]
struct WeatherApiLocation {
    name: String,
    region: String,
    country: String,
}

#[derive(Debug, Deserialize)]
struct WeatherApiCurrent {
    temp_c: f32,
    temp_f: f32,
    is_day: i32,
    condition: WeatherApiCondition,
    wind_mph: f32,
    wind_kph: f32,
    wind_dir: String,
    pressure_mb: f32,
    humidity: f32,
    feelslike_c: f32,
    feelslike_f: f32,
    vis_km: f32,
    uv: f32,
}

#[derive(Debug, Deserialize)]
struct WeatherApiCondition {
    text: String,
    code: i32,
}

#[derive(Debug, Deserialize)]
struct IpApiResponse {
    city: Option<String>,
    country: Option<String>,
    lat: Option<f64>,
    lon: Option<f64>,
    status: String,
}

fn map_condition_code(code: i32) -> String {
    match code {
        1000 => "clear".to_string(),
        1003 => "partly_cloudy".to_string(),
        1006 | 1009 => "cloudy".to_string(),
        1030 | 1135 | 1147 => "fog".to_string(),
        1063 | 1150 | 1153 | 1168 | 1171 => "drizzle".to_string(),
        1066 | 1069 | 1072 | 1114 | 1117 | 1210 | 1213 | 1216 | 1219 | 1222 | 1225 | 1237 | 1255 | 1258 | 1261 | 1264 => "snow".to_string(),
        1087 | 1273 | 1276 | 1279 | 1282 => "thunderstorm".to_string(),
        1180 | 1183 | 1186 | 1189 | 1192 | 1195 | 1198 | 1201 | 1204 | 1207 | 1240 | 1243 | 1246 | 1249 | 1252 => "rain".to_string(),
        _ => "unknown".to_string(),
    }
}

fn get_time_of_day() -> String {
    let hour = Utc::now().hour();
    match hour {
        5..=11 => "morning".to_string(),
        12..=16 => "afternoon".to_string(),
        17..=20 => "evening".to_string(),
        _ => "night".to_string(),
    }
}

fn get_day_of_week() -> String {
    Utc::now().format("%A").to_string()
}

fn get_moon_phase() -> String {
    // Simplified moon phase calculation based on lunar cycle
    let now = Utc::now();
    let days_since_new_moon = ((now.timestamp() as f64 / 86400.0) - 10.8389) % 29.53059;

    match days_since_new_moon {
        d if d < 1.85 => "New Moon".to_string(),
        d if d < 5.53 => "Waxing Crescent".to_string(),
        d if d < 9.22 => "First Quarter".to_string(),
        d if d < 12.91 => "Waxing Gibbous".to_string(),
        d if d < 16.61 => "Full Moon".to_string(),
        d if d < 20.30 => "Waning Gibbous".to_string(),
        d if d < 23.99 => "Last Quarter".to_string(),
        d if d < 27.68 => "Waning Crescent".to_string(),
        _ => "New Moon".to_string(),
    }
}

use chrono::Timelike;

/// Fetch weather data from WeatherAPI.com
pub async fn fetch_weather(api_key: &str, location: &str) -> Result<WeatherData, String> {
    if api_key.is_empty() {
        return Err("Weather API key not configured".to_string());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(WEATHER_API_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!(
        "{}/current.json?key={}&q={}&aqi=no",
        WEATHERAPI_BASE_URL, api_key, location
    );

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch weather: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Weather API error ({}): {}", status, error_text));
    }

    let api_response: WeatherApiResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse weather response: {}", e))?;

    let location_str = format!(
        "{}, {}",
        api_response.location.name, api_response.location.country
    );

    Ok(WeatherData {
        location: location_str,
        temp_celsius: api_response.current.temp_c,
        temp_fahrenheit: api_response.current.temp_f,
        feels_like_celsius: api_response.current.feelslike_c,
        feels_like_fahrenheit: api_response.current.feelslike_f,
        condition: map_condition_code(api_response.current.condition.code),
        condition_text: api_response.current.condition.text,
        humidity: api_response.current.humidity,
        wind_kph: api_response.current.wind_kph,
        wind_mph: api_response.current.wind_mph,
        wind_direction: api_response.current.wind_dir,
        pressure: api_response.current.pressure_mb,
        uv_index: api_response.current.uv,
        visibility: api_response.current.vis_km,
        is_day: api_response.current.is_day == 1,
        timestamp: Utc::now().to_rfc3339(),
    })
}

/// Auto-detect location from IP address
pub async fn detect_location() -> Result<String, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get("http://ip-api.com/json/")
        .send()
        .await
        .map_err(|e| format!("Failed to detect location: {}", e))?;

    if !response.status().is_success() {
        return Err("Failed to detect location from IP".to_string());
    }

    let ip_data: IpApiResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse location response: {}", e))?;

    if ip_data.status != "success" {
        return Err("Location detection failed".to_string());
    }

    match (ip_data.city, ip_data.country) {
        (Some(city), Some(country)) => Ok(format!("{}, {}", city, country)),
        (Some(city), None) => Ok(city),
        _ => Err("Could not determine location".to_string()),
    }
}

/// Get full journal context including weather and time information
pub async fn get_journal_context(api_key: &str, location: &str) -> Result<JournalContext, String> {
    let weather = if !api_key.is_empty() && !location.is_empty() {
        match fetch_weather(api_key, location).await {
            Ok(w) => Some(w),
            Err(e) => {
                eprintln!("Weather fetch error: {}", e);
                None
            }
        }
    } else {
        None
    };

    Ok(JournalContext {
        weather,
        day_of_week: get_day_of_week(),
        time_of_day: get_time_of_day(),
        moon_phase: Some(get_moon_phase()),
    })
}
