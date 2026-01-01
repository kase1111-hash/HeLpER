use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

const API_TIMEOUT_SECS: u64 = 30;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryContext {
    pub weather: Option<String>,
    pub location: Option<String>,
    pub mood: Option<String>,
    pub date: String,
    pub time_of_day: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NatLangChainEntry {
    pub author: String,
    pub content: String,
    pub intent: String,
    pub title: Option<String>,
    pub tags: Option<Vec<String>>,
    pub monetization: String,
    pub price: Option<f64>,
    pub visibility: String,
    pub context: Option<EntryContext>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationResult {
    pub valid: bool,
    pub clarity_score: f64,
    pub intent_detected: String,
    pub suggestions: Option<Vec<String>>,
    pub warnings: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PublishResult {
    pub success: bool,
    pub entry_id: Option<String>,
    pub block_hash: Option<String>,
    pub error: Option<String>,
    pub transaction_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainStats {
    pub total_entries: u64,
    pub total_earnings: f64,
    pub subscribers: u64,
    pub views: u64,
}

#[derive(Debug, Deserialize)]
struct ApiValidationResponse {
    valid: bool,
    clarity_score: Option<f64>,
    intent: Option<String>,
    suggestions: Option<Vec<String>>,
    warnings: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct ApiPublishResponse {
    success: bool,
    entry_id: Option<String>,
    block_hash: Option<String>,
    error: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ApiStatsResponse {
    entries: Option<u64>,
    earnings: Option<f64>,
    subscribers: Option<u64>,
    views: Option<u64>,
}

/// Validate an entry before publishing
pub async fn validate_entry(
    api_url: &str,
    entry: &NatLangChainEntry,
) -> Result<ValidationResult, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(API_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!("{}/entry/validate", api_url.trim_end_matches('/'));

    let response = client
        .post(&url)
        .json(entry)
        .send()
        .await
        .map_err(|e| format!("Validation request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("Validation API error ({}): {}", status, error_text));
    }

    let api_response: ApiValidationResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse validation response: {}", e))?;

    Ok(ValidationResult {
        valid: api_response.valid,
        clarity_score: api_response.clarity_score.unwrap_or(0.0),
        intent_detected: api_response.intent.unwrap_or_else(|| "unknown".to_string()),
        suggestions: api_response.suggestions,
        warnings: api_response.warnings,
    })
}

/// Publish an entry to the blockchain
pub async fn publish_entry(
    api_url: &str,
    entry: &NatLangChainEntry,
) -> Result<PublishResult, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(API_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!("{}/entry", api_url.trim_end_matches('/'));

    let response = client
        .post(&url)
        .json(entry)
        .send()
        .await
        .map_err(|e| format!("Publish request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Ok(PublishResult {
            success: false,
            entry_id: None,
            block_hash: None,
            error: Some(format!("API error ({}): {}", status, error_text)),
            transaction_url: None,
        });
    }

    let api_response: ApiPublishResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse publish response: {}", e))?;

    let transaction_url = api_response.entry_id.as_ref().map(|id| {
        format!("{}/entries/{}", api_url.trim_end_matches('/'), id)
    });

    Ok(PublishResult {
        success: api_response.success,
        entry_id: api_response.entry_id,
        block_hash: api_response.block_hash,
        error: api_response.error,
        transaction_url,
    })
}

/// Get author stats from the chain
pub async fn get_author_stats(
    api_url: &str,
    author_id: &str,
) -> Result<ChainStats, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(API_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!(
        "{}/entries/author/{}/stats",
        api_url.trim_end_matches('/'),
        author_id
    );

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Stats request failed: {}", e))?;

    if !response.status().is_success() {
        // Return empty stats if not found
        return Ok(ChainStats {
            total_entries: 0,
            total_earnings: 0.0,
            subscribers: 0,
            views: 0,
        });
    }

    let api_response: ApiStatsResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse stats response: {}", e))?;

    Ok(ChainStats {
        total_entries: api_response.entries.unwrap_or(0),
        total_earnings: api_response.earnings.unwrap_or(0.0),
        subscribers: api_response.subscribers.unwrap_or(0),
        views: api_response.views.unwrap_or(0),
    })
}

/// Check if the NatLangChain API is available
pub async fn check_connection(api_url: &str) -> Result<bool, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!("{}/stats", api_url.trim_end_matches('/'));

    match client.get(&url).send().await {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}

/// Create an entry with current timestamp
pub fn create_entry(
    author: String,
    content: String,
    intent: String,
    title: Option<String>,
    tags: Option<Vec<String>>,
    monetization: String,
    price: Option<f64>,
    visibility: String,
    context: Option<EntryContext>,
) -> NatLangChainEntry {
    NatLangChainEntry {
        author,
        content,
        intent,
        title,
        tags,
        monetization,
        price,
        visibility,
        context,
        created_at: Utc::now().to_rfc3339(),
    }
}
