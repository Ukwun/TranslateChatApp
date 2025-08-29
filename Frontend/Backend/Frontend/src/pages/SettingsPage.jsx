import React, { useEffect } from "react";
import { useThemeStore } from "../store/useThemeStore";

const THEME_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Red", value: "#EF4444" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
];

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "Pretty good, just working on a project.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  // Apply theme as a CSS variable whenever it changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--theme-color", theme);
    }
  }, [theme]);

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Theme</h1>
        <p className="text-gray-500">
          Choose your preferred theme color for your conversations.
        </p>
      </div>

      {/* Color Picker */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mt-4">
        {THEME_COLORS.map((t) => (
          <button
            key={t.value}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors border-2 ${
              theme === t.value ? "border-black" : "border-transparent"
            }`}
            onClick={() => setTheme(t.value)}
          >
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: t.value }}
            ></div>
            <span className="text-xs font-medium">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Preview Area */}
      <h3 className="text-lg font-semibold my-4">Preview</h3>
      <div className="rounded-xl border overflow-hidden shadow-lg">
        <div className="p-4 bg-gray-100">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: theme }}
                >
                  J
                </div>
                <div>
                  <h3 className="font-medium text-sm">John Doe</h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-white">
                {PREVIEW_MESSAGES.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isSent ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 shadow-sm text-sm`}
                      style={{
                        backgroundColor: message.isSent ? theme : "#E5E7EB",
                        color: message.isSent ? "white" : "black",
                      }}
                    >
                      <p>{message.content}</p>
                      <p className="text-[10px] mt-1.5 opacity-70 text-right">
                        2:30 PM
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t flex gap-3">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Type a message..."
                  value="This is a preview"
                  readOnly
                />
                <button
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: theme }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
