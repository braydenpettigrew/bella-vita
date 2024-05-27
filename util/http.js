import axios from "axios";

const BACKEND_URL = "https://bellavita-7a30f-default-rtdb.firebaseio.com/";

export async function storePoints(points) {
  let response = await axios.post(BACKEND_URL + "/points.json", points);
  return response;
}

export async function fetchPoints() {
  const response = await axios.get(`${BACKEND_URL}/points.json`);
  // console.log("Fetch response", response.data);
  return response.data["-Nyv7PD39t1UwAsEZhxE"].points;
}

export async function updatePoints(newPoints) {
  const id = "-Nyv7PD39t1UwAsEZhxE";
  const response = await axios.put(`${BACKEND_URL}/points/${id}.json`, {
    points: newPoints,
  });
  // console.log("Update response: ", response);
}

export async function storeHistory(history) {
  let response = await axios.post(BACKEND_URL + "/history.json", history);
  return response;
}

export async function fetchHistory() {
  const response = await axios.get(`${BACKEND_URL}/history.json`);
  console.log("Fetch response", response.data);
  return response.data;
}
