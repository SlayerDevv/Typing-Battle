const os = require("os");

export const getWifiIp = () => {
  const interfaces = os.networkInterfaces();
  let wifiIp = "127.0.0.1"; // Default fallback

  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal && name.includes("Wi-Fi")) {
        wifiIp = iface.address;
      }
    }
  }

  return wifiIp;
};
