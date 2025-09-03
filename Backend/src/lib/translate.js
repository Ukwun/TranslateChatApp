import fetch from 'node-fetch';
import axios from "axios";

export async function translateText(text, targetLang, apiKey) {
  const prompt = `Translate ONLY the following text to ${targetLang}. Do NOT explain, just reply with the translation. Text: ${text}`;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a translation assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    });
    const data = await res.json();
    console.log('OpenAI translation response:', JSON.stringify(data, null, 2));
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content.trim();
    }
    if (data.error) {
      console.error('OpenAI API error:', data.error);
    }
  } catch (err) {
    console.error('OpenAI translation failed:', err);
  }
  // Fallback: Use Google Translate API if available (requires GOOGLE_API_KEY env)
  if (process.env.GOOGLE_API_KEY) {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang })
      });
      const data = await res.json();
      console.log('Google Translate response:', JSON.stringify(data, null, 2));
      if (data.data && data.data.translations && data.data.translations[0] && data.data.translations[0].translatedText) {
        return data.data.translations[0].translatedText;
      }
      if (data.error) {
        console.error('Google Translate API error:', data.error);
      }
    } catch (err) {
      console.error('Google Translate fallback failed:', err);
    }
  }
  throw new Error('Translation failed');
}

export async function translateTextOpusMT(srcText, srcLang, tgtLang) {
  try {
    const res = await axios.post(
      process.env.TRANSLATOR_URL || "http://localhost:8000/translate",
      {
        src_text: srcText,
        src_lang: srcLang,
        tgt_lang: tgtLang,
      }
    );
    return res.data.translated_text;
  } catch (err) {
    console.error("Translation error (OPUS-MT):", err?.message || err);
    return srcText;
  }
}
