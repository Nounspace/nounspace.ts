export function parseBase64Json(base64Json: string): Record<string, any> {
  const clean: string = base64Json.substring(29);
  const json = Buffer.from(clean, "base64").toString();
  return JSON.parse(json);
}
