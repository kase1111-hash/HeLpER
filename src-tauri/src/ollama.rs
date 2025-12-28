use crate::commands::{ChatMessage, OllamaStatus};
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct OllamaChatRequest {
    model: String,
    messages: Vec<OllamaMessage>,
    stream: bool,
    options: OllamaOptions,
}

#[derive(Debug, Serialize, Deserialize)]
struct OllamaMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    temperature: f32,
    num_predict: u32,
}

#[derive(Debug, Deserialize)]
struct OllamaChatResponse {
    message: OllamaMessage,
}

#[derive(Debug, Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Debug, Deserialize)]
struct OllamaModel {
    name: String,
}

/// Check if Ollama is running and get available models
pub async fn check_status(base_url: &str) -> Result<OllamaStatus, String> {
    let client = Client::new();
    let url = format!("{}/api/tags", base_url);

    match client.get(&url).send().await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<OllamaTagsResponse>().await {
                    Ok(tags) => {
                        let model = tags.models.first().map(|m| m.name.clone());
                        Ok(OllamaStatus {
                            connected: true,
                            model,
                            error: None,
                        })
                    }
                    Err(e) => Ok(OllamaStatus {
                        connected: true,
                        model: None,
                        error: Some(format!("Failed to parse response: {}", e)),
                    }),
                }
            } else {
                Ok(OllamaStatus {
                    connected: false,
                    model: None,
                    error: Some(format!("Server returned status: {}", response.status())),
                })
            }
        }
        Err(e) => Ok(OllamaStatus {
            connected: false,
            model: None,
            error: Some(format!("Connection failed: {}", e)),
        }),
    }
}

/// Send a chat message to Ollama and get a response
pub async fn send_message(
    base_url: &str,
    model: &str,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
) -> Result<ChatMessage, String> {
    let client = Client::new();
    let url = format!("{}/api/chat", base_url);

    let ollama_messages: Vec<OllamaMessage> = messages
        .into_iter()
        .map(|m| OllamaMessage {
            role: m.role,
            content: m.content,
        })
        .collect();

    let request = OllamaChatRequest {
        model: model.to_string(),
        messages: ollama_messages,
        stream: false,
        options: OllamaOptions {
            temperature,
            num_predict: max_tokens,
        },
    };

    let response = client
        .post(&url)
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Ollama returned error: {}", response.status()));
    }

    let chat_response: OllamaChatResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(ChatMessage {
        role: chat_response.message.role,
        content: chat_response.message.content,
        timestamp: Utc::now().to_rfc3339(),
    })
}
