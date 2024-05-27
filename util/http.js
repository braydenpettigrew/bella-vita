import axios from "axios";

const BACKEND_URL = "https://bellavita-7a30f-default-rtdb.firebaseio.com/";

export async function storePoints(points) {
  let response = await axios.post(BACKEND_URL + "/points.json", points);
  return response;
}

export async function fetchPoints() {
  const response = await axios.get(
    `${BACKEND_URL}/points.json?orderBy="id"&equalTo="Austin"`
  );
  return response.data["-Nyuw4GsroK5nEDqj9Z0"].points;
}

export function updateExpense(newPoints) {
  return axios.put(BACKEND_URL + `/points.json`, newPoints);
}
