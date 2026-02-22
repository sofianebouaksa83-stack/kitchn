import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bouaksa.kitchn",
  appName: "KITCH'N",
  webDir: "dist",
  server: {
  androidScheme: "https",
},
plugins: {
  CapacitorHttp: { enabled: true },
},

};

export default config;
