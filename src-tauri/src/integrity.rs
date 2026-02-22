use hmac::{Hmac, Mac};
use sha2::Sha256;
use rand::RngCore;

type HmacSha256 = Hmac<Sha256>;

const KEYRING_SERVICE: &str = "com.helper.integrity";
const KEYRING_KEY: &str = "settings_hmac_key";

/// Get or create a device-local HMAC key stored in the OS keychain.
pub fn get_or_create_hmac_key() -> Result<Vec<u8>, String> {
    let entry = keyring::Entry::new(KEYRING_SERVICE, KEYRING_KEY)
        .map_err(|e| format!("Keyring entry error: {}", e))?;

    match entry.get_password() {
        Ok(key_hex) => {
            hex::decode(&key_hex).map_err(|e| format!("Failed to decode HMAC key: {}", e))
        }
        Err(keyring::Error::NoEntry) => {
            // Generate a new 256-bit random key
            let mut key = vec![0u8; 32];
            rand::thread_rng().fill_bytes(&mut key);
            let key_hex = hex::encode(&key);
            entry.set_password(&key_hex)
                .map_err(|e| format!("Failed to store HMAC key: {}", e))?;
            Ok(key)
        }
        Err(e) => Err(format!("Failed to retrieve HMAC key: {}", e)),
    }
}

/// Compute HMAC-SHA256 of data using the given key.
pub fn compute_hmac(data: &[u8], key: &[u8]) -> String {
    let mut mac = HmacSha256::new_from_slice(key)
        .expect("HMAC can take key of any size");
    mac.update(data);
    hex::encode(mac.finalize().into_bytes())
}

/// Verify HMAC-SHA256 of data against an expected hex-encoded HMAC.
/// Uses the `hmac` crate's constant-time `verify_slice` to prevent timing attacks.
pub fn verify_hmac(data: &[u8], key: &[u8], expected_hex: &str) -> bool {
    let expected_bytes = match hex::decode(expected_hex) {
        Ok(bytes) => bytes,
        Err(_) => return false,
    };
    let mut mac = HmacSha256::new_from_slice(key)
        .expect("HMAC can take key of any size");
    mac.update(data);
    mac.verify_slice(&expected_bytes).is_ok()
}
