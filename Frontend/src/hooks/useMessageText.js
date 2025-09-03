// React hook for toggling between original and translated message text
import { useState } from "react";

export function useMessageText(msg, viewerLang = "en") {
  const [showOriginal, setShowOriginal] = useState(false);
  const showText = () => {
    if (!showOriginal && msg.tgtLang && msg.tgtLang === viewerLang && msg.textTranslated) {
      return msg.textTranslated;
    }
    return msg.textOriginal || msg.text;
  };
  return {
    text: showText(),
    showOriginal,
    setShowOriginal,
  };
}
