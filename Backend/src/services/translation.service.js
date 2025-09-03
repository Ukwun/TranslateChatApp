// translation.service.js
import { translateTextOpusMT } from "../lib/translate.js";

export async function translateText({ text, source, target }) {
  let translated = text;
  let model = "noop";
  try {
    if (source !== target) {
      translated = await translateTextOpusMT(text, source, target);
      model = "OPUS-MT";
    }
  } catch (err) {
    console.error("Translation service error:", err);
    translated = text;
    model = "noop";
  }
  return { translated, model };
}
