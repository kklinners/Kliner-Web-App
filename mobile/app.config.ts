import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Kliner",
  slug: "kliner-mobile",
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3002",
  },
});
