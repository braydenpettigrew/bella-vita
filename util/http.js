import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL;

export async function storePoints(points, auth) {
  try {
    console.log(
      "Sending request to:",
      `${BACKEND_URL}/points.json?auth=${auth}`
    );
    console.log("Request payload:", points);

    let response = await axios.post(
      `${BACKEND_URL}/points.json?auth=${auth}`,
      points,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", response.data);
    return response;
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else {
      console.error("Error message:", error.message);
    }

    // Handle specific error cases
    if (error.response && error.response.status === 400) {
      // Potentially log additional debugging info here
      console.error("Bad Request: The points node might not exist.");
    }

    throw error;
  }
}

export async function fetchPoints(auth) {
  const response = await axios.get(`${BACKEND_URL}/points.json?auth=${auth}`);
  return response.data["-O06npecrQIwjXXIthGN"].points;
}

export async function updatePoints(newPoints, auth) {
  const id = "-O06npecrQIwjXXIthGN";
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
