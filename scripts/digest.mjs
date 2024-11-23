/** Generate a Hash of a String
 * @param {string} input - string to be hashed
 * @returns {Promise<string>} - the hexadecimal hashed string
 */
export async function generateHash(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
