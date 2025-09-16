"use client";
import { use, useRef } from "react";

import { useState } from "react";

export default function Chat({
  params,
}: {
  params: Promise<{ params?: string[] }>;
}) {
  const resolvedParams = use(params);
  const routeParams = resolvedParams.params || [];

  const [input, setInput] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [response, setResponse] = useState("");

  const aiMessageRef = useRef("🤖: ");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


  const handleSend = async () => {
    if(!input.trim()) return

    const userMessage = `🧑: ${input}`
    setChat((prev) => [...prev,"\n"]);
    setChat((prev) => [...prev, userMessage]);
    setInput("");
    setResponse("🤖: Thinking..."); // Start AI reply
    aiMessageRef.current = "🤖: "; 
    const streamUrl = `${baseUrl}/stream/generate?id=${encodeURIComponent(routeParams[0])}&query=${encodeURIComponent(input)}`
    const eventSource = new EventSource(streamUrl);

    
    eventSource.onmessage = (event) =>{
        if(event.data === "[DONE]"){
          eventSource.close;
          setChat((prev) => [...prev,aiMessageRef.current])
          setResponse("");
          return;
        }

        aiMessageRef.current += event.data;
        setResponse(aiMessageRef.current)
    }

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
      aiMessageRef.current += "\n⚠️ Error occurred.\n";
      setChat((prev) => [...prev, aiMessageRef.current]);
      setResponse("");
    };
  
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-white to-sky-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 space-y-2">
        <div className="overflow-y-auto h-[60vh] border p-4 rounded bg-gray-50">
          {chat.map((line, idx) => (
            <p key={idx} className="whitespace-pre-wrap">
              {line}
            </p>
          ))}
          {response && <p className="whitespace-pre-wrap">{response}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 border rounded"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
