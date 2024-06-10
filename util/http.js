import axios from "axios";

const BACKEND_URL = "https://bellavita-7a30f-default-rtdb.firebaseio.com/";

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

export async function storePushToken(pushToken, auth) {
  const response = await axios.post(
    `${BACKEND_URL}/pushtokens.json?auth=${auth}`,
    pushToken
  );
  return response;
}

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
    console.log("Error: ", error);
    return error;
  }
}
