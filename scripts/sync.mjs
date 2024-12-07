const url = "https://extension-saver-sh01-24.deno.dev/";

/**
 * Fetches data from the API.
 * @param {string} key - The key to fetch data for.
 * @returns {Promise<null|Object>} The fetched data or null if an error occurs.
 */
export async function get(key) {
  try {
    const response = await fetch(`${url}/${key}`);
    if (response.ok) {
      const data = await response.json();
      return data.value;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

/**
 * Sets data in the API.
 * @param {string} key - The key to set data for.
 * @param {string} value - The JSON string value to set.
 * @returns {Promise<boolean>} True if the data was set successfully, false otherwise.
 */
export async function set(key, value) {
  try {
    const response = await fetch(`${url}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: key, value: value }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error setting data:", error);
    return false;
  }
}
