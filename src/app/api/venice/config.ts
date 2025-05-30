export const USE_USER_PAST_CASTS = true;
export const USERS_CASTS_CHRONOLOGICALLY = true;

export const MAX_TRENDING_CASTS = 3;
export const DEBUG_PROMPTS = true;

export const VENICE_API_KEY = process.env.VENICE_API_KEY;
export const VENICE_MODEL = "llama-3.2-3b";
// var VENICE_MODEL = "deepseek-r1-671b";

export const MODEL_TEMPERATURE_DETERMINISTIC = 0.2;
export const MODEL_TEMPERATURE_CREATIVE = 0.6;
export const MODEL_TEMPERATURE_ALUCINATE = 0.9;

export const TODAY_TIME_DATE = new Date().toLocaleString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
