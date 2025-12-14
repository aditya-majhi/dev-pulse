export const saveToken = (token: string) => {
  localStorage.setItem("devpulse_token", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("devpulse_token");
};

export const removeToken = () => {
  localStorage.removeItem("devpulse_token");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = () => {
  removeToken();
  window.location.href = "/login";
};