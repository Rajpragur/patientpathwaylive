// src/components/ChatBotEmbedCode.tsx
import React, { useState } from "react";

export function ChatBotEmbedCode() {
  const [quizType, setQuizType] = useState("SNOT22");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("600px");

  const embedUrl = `${window.location.origin}/embed/chatbot?quizType=${quizType}`;

  const embedCode = `<iframe
  src="${embedUrl}"
  width=${width}
  height=${height}
  frameborder="0"
  style="border: none; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);"
></iframe>`;

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1">Quiz Type</label>
        <input
          value={quizType}
          onChange={(e) => setQuizType(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Width</label>
        <input
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Height</label>
        <input
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div>
        <label className="block mb-1">Embed Code</label>
        <textarea
          readOnly
          value={embedCode}
          className="w-full border px-2 py-1 rounded font-mono text-sm"
          rows={5}
        />
      </div>
    </div>
  );
}
