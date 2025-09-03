import franc from "franc";
import langs from "langs";

export function detectISO1(text = "") {
  if (!text || text.trim().length < 5) return "en";
  const code3 = franc(text, { minLength: 10 }); // returns ISO 639-3 or "und"
  if (code3 === "und") return "en";
  const match = langs.where("3", code3);
  return match && match["1"] ? match["1"] : "en";
}
