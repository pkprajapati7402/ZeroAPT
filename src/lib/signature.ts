import * as nacl from "tweetnacl";

export interface IntentPayload {
  action: string;
  params: any;
  user: string;
  nonce: string;
  expiry: number;
}

export interface SignedIntent {
  payload: IntentPayload;
  signature: string;
  publicKey: string;
}

// Verify Ed25519 signature
export const verifySignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = hexToBytes(signature);
    const publicKeyBytes = hexToBytes(publicKey);

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
};

// Convert hex string to Uint8Array
const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  
  return bytes;
};

// Validate payload structure and expiry
export const validatePayload = (payload: IntentPayload): boolean => {
  // Check required fields
  if (!payload.action || !payload.user || !payload.nonce || !payload.expiry) {
    return false;
  }

  // Check expiry (5 minutes from creation)
  const now = Math.floor(Date.now() / 1000);
  if (payload.expiry < now) {
    return false;
  }

  // Validate action types
  const validActions = ['mint_badge', 'cast_vote', 'transfer_token'];
  if (!validActions.includes(payload.action)) {
    return false;
  }

  return true;
};

// Create payload for signing (client-side)
export const createIntentPayload = (
  action: string,
  params: any,
  userAddress: string,
  nonce: string
): IntentPayload => {
  const expiry = Math.floor(Date.now() / 1000) + (5 * 60); // 5 minutes from now
  
  return {
    action,
    params,
    user: userAddress,
    nonce,
    expiry,
  };
};

// Serialize payload for signing
export const serializePayload = (payload: IntentPayload): string => {
  return JSON.stringify(payload, Object.keys(payload).sort());
};

// Generate random nonce
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};