import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.campusmall.app",
  appName: "Campus Mall",
  webDir: "public",
  server: {
    url: "https://campus-mall.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
