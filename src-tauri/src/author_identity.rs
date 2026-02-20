use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use ed25519_dalek::{Signer, SigningKey, VerifyingKey};
use rand::rngs::OsRng;

const KEYRING_KEY_PRIVATE: &str = "author_private_key";
const KEYRING_KEY_PUBLIC: &str = "author_public_key";

/// Get or create an Ed25519 keypair stored in the OS keychain.
/// Returns (public_key_base64, private_key_base64).
pub fn get_or_create_keypair(service: &str) -> Result<(String, String), String> {
    let priv_entry = keyring::Entry::new(service, KEYRING_KEY_PRIVATE)
        .map_err(|e| format!("Keyring entry error: {}", e))?;
    let pub_entry = keyring::Entry::new(service, KEYRING_KEY_PUBLIC)
        .map_err(|e| format!("Keyring entry error: {}", e))?;

    match priv_entry.get_password() {
        Ok(priv_b64) => {
            let pub_b64 = pub_entry.get_password()
                .map_err(|e| format!("Failed to get public key: {}", e))?;
            Ok((pub_b64, priv_b64))
        }
        Err(keyring::Error::NoEntry) => {
            // Generate new keypair
            let signing_key = SigningKey::generate(&mut OsRng);
            let verifying_key: VerifyingKey = signing_key.verifying_key();

            let priv_b64 = BASE64.encode(signing_key.to_bytes());
            let pub_b64 = BASE64.encode(verifying_key.to_bytes());

            priv_entry.set_password(&priv_b64)
                .map_err(|e| format!("Failed to store private key: {}", e))?;
            pub_entry.set_password(&pub_b64)
                .map_err(|e| format!("Failed to store public key: {}", e))?;

            Ok((pub_b64, priv_b64))
        }
        Err(e) => Err(format!("Failed to retrieve keypair: {}", e)),
    }
}

/// Sign content with the author's private key (base64-encoded).
/// Returns base64-encoded signature.
pub fn sign_content(content: &str, private_key_b64: &str) -> Result<String, String> {
    let key_bytes = BASE64.decode(private_key_b64)
        .map_err(|e| format!("Invalid private key encoding: {}", e))?;

    let key_array: [u8; 32] = key_bytes.try_into()
        .map_err(|_| "Invalid private key length".to_string())?;

    let signing_key = SigningKey::from_bytes(&key_array);
    let signature = signing_key.sign(content.as_bytes());

    Ok(BASE64.encode(signature.to_bytes()))
}
