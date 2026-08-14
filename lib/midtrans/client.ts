import midtransClient from "midtrans-client";

function getServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }

  return serverKey;
}

function getClientKey() {
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;

  if (!clientKey) {
    throw new Error("MIDTRANS_CLIENT_KEY is not configured");
  }

  return clientKey;
}

function getIsProduction() {
  return process.env.MIDTRANS_PRODUCTION === "true";
}

export const snap = new midtransClient.Snap({
  isProduction: getIsProduction(),
  serverKey: getServerKey(),
  clientKey: getClientKey(),
});

export function getMidtransClientKey() {
  return getClientKey();
}