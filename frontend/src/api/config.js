// Centralized API Base URL configuration
// Dynamically reads VITE_API_BASE_URL environment variable without hardcoded localhost fallbacks
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  SIGNUP: `${API_BASE_URL}/api/signup`,
  GOOGLE_AUTH: `${API_BASE_URL}/api/google-auth`,
  HOME_BILLS: `${API_BASE_URL}/api/home-bills`,
  ADD_BILL: `${API_BASE_URL}/api/add-bill`,
  DELETE_BILL: (id) => `${API_BASE_URL}/api/delete-bill/${id}`,
  EXPENDITURES: `${API_BASE_URL}/api/expenditures`,
  CASH_COLLECTION: `${API_BASE_URL}/api/cash-collection`,
  ADVANCE: `${API_BASE_URL}/api/advance`,
  BALANCE_SHEET: `${API_BASE_URL}/api/balance-sheet`,
  NOT_PAID_BILLS: `${API_BASE_URL}/api/not-paid-bills`,
  PAID_BILLS: `${API_BASE_URL}/api/paid-bills`,
  KISAN_BALANCE: `${API_BASE_URL}/api/kisan-balance`,
  SHOPS: `${API_BASE_URL}/api/shops`,
  LOCAL_SALE: `${API_BASE_URL}/api/local-sale`,
  SOLD_DATA: `${API_BASE_URL}/api/sold-data`,
  BEAT_PAPER: `${API_BASE_URL}/api/beat-paper`
};
