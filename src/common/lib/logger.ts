import pino from "pino";

const logger = pino(
  process.env.NODE_ENV === "production"
    ? { level: "info" }
    : { level: "debug", transport: { target: "pino-pretty" } }
);

export default logger;
