import axios from "../../lib/axios";

// LOGIN
export const loginUser = async (data) => {
  const res = await axios.post("/users/login", data);
  return res.data;
};

// REGISTER (ready ka na agad)
export const registerUser = async (data) => {
  const res = await axios.post("/users/register", data);
  return res.data;
};