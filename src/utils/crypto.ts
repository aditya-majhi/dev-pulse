import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "devpulse-default-key-change-this-in-production";

/**
 * Encrypt sensitive data (like GitHub PAT)
 */
export const encryptData = (data: string): string => {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return "";
    }
};

/**
 * Save encrypted PAT to localStorage
 */
export const savePAT = (pat: string): void => {
    const encrypted = encryptData(pat);
    localStorage.setItem("devpulse_github_pat", encrypted);
};

/**
 * Get decrypted PAT from localStorage
 */
export const getPAT = (): string | null => {
    const encrypted = localStorage.getItem("devpulse_github_pat");
    if (!encrypted) return null;
    return decryptData(encrypted);
};

/**
 * Remove PAT from localStorage
 */
export const removePAT = (): void => {
    localStorage.removeItem("devpulse_github_pat");
};

/**
 * Check if PAT exists in localStorage
 */
export const hasPAT = (): boolean => {
    return !!localStorage.getItem("devpulse_github_pat");
};