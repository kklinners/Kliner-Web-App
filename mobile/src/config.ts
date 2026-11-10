import Constants from "expo-constants";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  "http://localhost:3002";

/** Use your machine LAN IP for physical devices, e.g. http://192.168.1.5:3002 */
export const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_URL || "http://localhost:3000";
