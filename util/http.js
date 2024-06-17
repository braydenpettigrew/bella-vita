import axios from "axios";
import { BACKEND_URL } from "@env";

export async function storePoints(points, auth) {
  let response = await axios.post(
    `${BACKEND_URL}/points.json?auth=${auth}`,
    points
  );
  return response;
}

export async function fetchPoints(auth) {
  const response = await axios.get(`${BACKEND_URL}/points.json?auth=${auth}`);
  return response.data["-Nyv7PD39t1UwAsEZhxE"].points;
}

export async function updatePoints(newPoints, auth) {
  const id = "-Nyv7PD39t1UwAsEZhxE";
  const response = await axios.put(
    `${BACKEND_URL}/points/${id}.json?auth=${auth}`,
    {
      points: newPoints,
    }
  );
}

export async function storeHistory(history, auth) {
  let response = await axios.post(
    `${BACKEND_URL}/history.json?auth=${auth}`,
    history
  );
  return response;
}

export async function fetchHistory(auth) {
  const response = await axios.get(`${BACKEND_URL}/history.json?auth=${auth}`);
  return response.data;
}

export async function deleteHistory(timestamp, auth) {
  try {
    // Fetching the history entries
    const response = await axios.get(
      BACKEND_URL + "/history.json?auth=" + auth
    );
    const historyEntries = response.data;

    // Finding the entry with the matching timestamp
    let entryToDelete = null;
    for (const key in historyEntries) {
      if (historyEntries[key].timestamp === timestamp) {
        entryToDelete = key;
        break;
      }
    }

    // If entry found, delete it
    if (entryToDelete) {
      const deleteResponse = await axios.delete(
        BACKEND_URL + `/history/${entryToDelete}.json?auth=${auth}`
      );
      return deleteResponse;
    } else {
      throw new Error("Entry with specified timestamp not found");
    }
  } catch (error) {
    console.error("Error deleting history:", error);
    throw error;
  }
}

export async function storePushToken(pushToken, auth) {
  const response = await axios.post(
    `${BACKEND_URL}/pushtokens.json?auth=${auth}`,
    pushToken
  );
  return response;
}

// Check if a specific push token exists on the backend.
export async function pushTokenExists(pushToken, auth) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/pushtokens.json?auth=${auth}`
    );

    for (const key in response.data) {
      if (response.data.hasOwnProperty(key)) {
        const currentPushToken = response.data[key].pushToken;
        if (currentPushToken === pushToken) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.log("http1 Error: ", error);
    return error;
  }
}

// Return a list of all push tokens that are stored on the backend.
export async function getAllPushTokens(auth) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/pushtokens.json?auth=${auth}`
    );

    const pushTokens = [];

    for (const key in response.data) {
      if (response.data.hasOwnProperty(key)) {
        const currentPushToken = response.data[key].pushToken;
        pushTokens.push(currentPushToken);
      }
    }

    return pushTokens;
  } catch (error) {
    console.log("http2 Error: ", error);
    return error;
  }
}
