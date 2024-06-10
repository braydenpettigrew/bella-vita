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
  // console.log("Fetch response", response.data);
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
  // console.log("Update response: ", response);
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
  // console.log("Fetch response", response.data);
  return response.data;
}

export async function storePushToken(pushToken, auth) {
  const response = await axios.post(
    `${BACKEND_URL}/pushtokens.json?auth=${auth}`,
    pushToken
  );
  return response;
}
