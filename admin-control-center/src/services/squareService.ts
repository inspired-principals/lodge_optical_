import { SquareClient, SquareEnvironment } from "square";

const environment = process.env.SQUARE_ENVIRONMENT === 'production' 
  ? SquareEnvironment.Production 
  : SquareEnvironment.Sandbox;

const token = process.env.SQUARE_ACCESS_TOKEN;
if (!token) {
  console.error("SQUARE_ACCESS_TOKEN is missing.");
}

const client = new SquareClient({
  environment: environment,
  token: token || "",
});

export const squareAppId = import.meta.env.VITE_SQUARE_APP_ID;
export const squareLocationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

if (!squareAppId || !squareLocationId) {
  console.warn("VITE_SQUARE_APP_ID or VITE_SQUARE_LOCATION_ID is missing.");
}

export default client;
