const ACCESS_TOKEN_KEY = "nexus_access_token";

export const saveToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};