use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json;
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
pub struct StoryMetadata {
    pub series_id: Option<String>,
    pub series_title: String,
    pub chapter_number: u32,
    pub total_chapters: Option<u32>,
    pub genre: String,
    pub is_ongoing: bool,
    pub synopsis: Option<String>,
    pub previous_chapter_id: Option<String>,
    pub next_chapter_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArticleMetadata {
    pub headline: String,
    pub byline: Option<String>,
    pub category: String,
    pub subcategory: Option<String>,
    pub dateline: Option<String>,
    pub sources: Option<Vec<String>>,
    pub is_breaking: Option<bool>,
    pub is_opinion: Option<bool>,
    pub is_analysis: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NatLangChainEntry {
    pub author: String,
    pub content: String,
    pub intent: String,
    pub title: Option<String>,
    pub tags: Option<Vec<String>>,
    pub content_type: String,
    pub monetization: String,
    pub price: Option<f64>,
    pub visibility: String,
    pub context: Option<EntryContext>,
    pub story_metadata: Option<StoryMetadata>,
    pub article_metadata: Option<ArticleMetadata>,
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

// Request struct for NatLangChain API (minimal required fields)
#[derive(Debug, Serialize)]
struct ApiEntryRequest {
    content: String,
    author: String,
    intent: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    metadata: Option<serde_json::Value>,
}

// NatLangChain validation response structures
#[derive(Debug, Deserialize)]
struct ApiSymbolicValidation {
    valid: bool,
    issues: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct ApiLlmValidationInner {
    paraphrase: Option<String>,
    intent_match: Option<bool>,
    ambiguities: Option<Vec<String>>,
    decision: Option<String>,
    reasoning: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ApiLlmValidation {
    status: Option<String>,
    validation: Option<ApiLlmValidationInner>,
}

#[derive(Debug, Deserialize)]
struct ApiValidationResponse {
    symbolic_validation: Option<ApiSymbolicValidation>,
    llm_validation: Option<ApiLlmValidation>,
    overall_decision: Option<String>,
}

// NatLangChain publish response structures
#[derive(Debug, Deserialize)]
struct ApiEntryInfo {
    status: Option<String>,
    message: Option<String>,
    content: Option<String>,
    author: Option<String>,
    intent: Option<String>,
    timestamp: Option<String>,
    validation_status: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ApiPublishResponse {
    status: Option<String>,
    entry: Option<ApiEntryInfo>,
    block_hash: Option<String>,
    error: Option<String>,
}

// NatLangChain author entries response
#[derive(Debug, Deserialize)]
struct ApiAuthorEntriesResponse {
    author: Option<String>,
    count: Option<u64>,
}

// NatLangChain global stats response
#[derive(Debug, Deserialize)]
struct ApiGlobalStatsResponse {
    total_entries: Option<u64>,
    validated_entries: Option<u64>,
    unique_authors: Option<u64>,
}

/// Build metadata JSON from entry for NatLangChain API
fn build_metadata(entry: &NatLangChainEntry) -> Option<serde_json::Value> {
    let mut metadata = serde_json::Map::new();

    if let Some(title) = &entry.title {
        metadata.insert("title".to_string(), serde_json::json!(title));
    }
    if let Some(tags) = &entry.tags {
        metadata.insert("tags".to_string(), serde_json::json!(tags));
    }
    metadata.insert("content_type".to_string(), serde_json::json!(&entry.content_type));
    metadata.insert("monetization".to_string(), serde_json::json!(&entry.monetization));
    if let Some(price) = entry.price {
        metadata.insert("price".to_string(), serde_json::json!(price));
    }
    metadata.insert("visibility".to_string(), serde_json::json!(&entry.visibility));
    if let Some(context) = &entry.context {
        metadata.insert("context".to_string(), serde_json::to_value(context).unwrap_or_default());
    }
    if let Some(story) = &entry.story_metadata {
        metadata.insert("story_metadata".to_string(), serde_json::to_value(story).unwrap_or_default());
    }
    if let Some(article) = &entry.article_metadata {
        metadata.insert("article_metadata".to_string(), serde_json::to_value(article).unwrap_or_default());
    }
    metadata.insert("created_at".to_string(), serde_json::json!(&entry.created_at));

    Some(serde_json::Value::Object(metadata))
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

    // Build request with only fields NatLangChain expects
    let request = ApiEntryRequest {
        content: entry.content.clone(),
        author: entry.author.clone(),
        intent: entry.intent.clone(),
        metadata: build_metadata(entry),
    };

    let response = client
        .post(&url)
        .json(&request)
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

    // Parse NatLangChain response format
    let valid = api_response.overall_decision
        .as_ref()
        .map(|d| d == "VALID")
        .unwrap_or(false);

    // Extract intent from LLM validation paraphrase
    let intent_detected = api_response.llm_validation
        .as_ref()
        .and_then(|v| v.validation.as_ref())
        .and_then(|v| v.paraphrase.clone())
        .unwrap_or_else(|| entry.intent.clone());

    // Collect issues as warnings
    let mut warnings: Vec<String> = Vec::new();
    if let Some(sym) = &api_response.symbolic_validation {
        if let Some(issues) = &sym.issues {
            warnings.extend(issues.clone());
        }
    }

    // Collect ambiguities as suggestions
    let suggestions = api_response.llm_validation
        .as_ref()
        .and_then(|v| v.validation.as_ref())
        .and_then(|v| v.ambiguities.clone());

    // Calculate clarity score from validation results
    let clarity_score = if valid { 1.0 } else if warnings.is_empty() { 0.7 } else { 0.4 };

    Ok(ValidationResult {
        valid,
        clarity_score,
        intent_detected,
        suggestions,
        warnings: if warnings.is_empty() { None } else { Some(warnings) },
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

    // Build request with only fields NatLangChain expects
    let request = ApiEntryRequest {
        content: entry.content.clone(),
        author: entry.author.clone(),
        intent: entry.intent.clone(),
        metadata: build_metadata(entry),
    };

    let response = client
        .post(&url)
        .json(&request)
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

    // NatLangChain returns status: "success" or "failure"
    let success = api_response.status
        .as_ref()
        .map(|s| s == "success")
        .unwrap_or(false);

    // Extract entry timestamp as a pseudo-ID if available
    let entry_id = api_response.entry
        .as_ref()
        .and_then(|e| e.timestamp.clone());

    let transaction_url = entry_id.as_ref().map(|_| {
        format!("{}/entries/author/{}", api_url.trim_end_matches('/'), entry.author)
    });

    Ok(PublishResult {
        success,
        entry_id,
        block_hash: api_response.block_hash,
        error: api_response.error,
        transaction_url,
    })
}

/// Get author stats from the chain
/// Note: NatLangChain doesn't track earnings/subscribers/views - these are HeLpER-specific
/// The API only provides entry count for the author
pub async fn get_author_stats(
    api_url: &str,
    author_id: &str,
) -> Result<ChainStats, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(API_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // Use the correct NatLangChain endpoint
    let url = format!(
        "{}/entries/author/{}",
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

    let api_response: ApiAuthorEntriesResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse author entries response: {}", e))?;

    // NatLangChain only provides entry count - other fields are placeholders
    Ok(ChainStats {
        total_entries: api_response.count.unwrap_or(0),
        total_earnings: 0.0, // Not tracked by NatLangChain
        subscribers: 0,      // Not tracked by NatLangChain
        views: 0,            // Not tracked by NatLangChain
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
    content_type: String,
    monetization: String,
    price: Option<f64>,
    visibility: String,
    context: Option<EntryContext>,
    story_metadata: Option<StoryMetadata>,
    article_metadata: Option<ArticleMetadata>,
) -> NatLangChainEntry {
    NatLangChainEntry {
        author,
        content,
        intent,
        title,
        tags,
        content_type,
        monetization,
        price,
        visibility,
        context,
        story_metadata,
        article_metadata,
        created_at: Utc::now().to_rfc3339(),
    }
}
