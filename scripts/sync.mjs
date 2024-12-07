class ModificationStorage {
  /**
   * Fetches data from the store.
   * @param {string} key - The key to fetch data for.
   * @returns {Promise<null|string>} The fetched data or null if an error occurs.
   */
  async get(key) {
    return null;
  }

  /**
   * Sets data in the store.
   * @param {string} key - The key to set data for.
   * @param {string} value - The JSON string value to set.
   * @returns {Promise<boolean>} True if the data was set successfully, false otherwise.
   */
  async set(key, value) {
    return false;
  }
}

export class OnlineModificationStorage extends ModificationStorage {
  static url = "https://extension-saver-sh01-24.deno.dev/";

  /** @param {string} key - url hash*/
  static async get(key) {
    console.log(key);
    debugger;
    try {
      const fetch_url = `${OnlineModificationStorage.url}${key}`;
      console.log(fetch_url);
      const response = await fetch(fetch_url);
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

  /** @param {string} key - url hash
   * @param {string} value - json modifications*/
  static async set(key, value) {
    try {
      const response = await fetch(`${OnlineModificationStorage.url}`, {
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
}

export class OfflineModificationStorage extends ModificationStorage {
  /**
   * @param {string} key - url hash */
  static async get(key) {
    try {
      const storedModification = await chrome.storage.local.get([key]);
      if (storedModification[key]) {
        console.log("Found modification!");
        return storedModification[key];
      } else {
        console.log("Modification not found :/");
        return null;
      }
    } catch {
      console.error(
        "Error while retrieving modification from Extension Storage",
      );
      return null;
    }
  }
  /** @param {string} key - url hash
   * @param {string} value - json modifications*/
  static async set(key, value) {
    try {
      await chrome.storage.local.set({
        [key]: value,
      });
    } catch (e) {
      console.error(e);
      alert("Could not save");
      return false;
    }
    alert("Saved successfully");
    return true;
  }
}
