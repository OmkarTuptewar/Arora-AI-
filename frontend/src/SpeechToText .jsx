import React, { useState, useRef } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import SpeechToTextUI from "./SpeechToTextUI";

/* Use env variable for base URL */
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
const API = axios.create({ baseURL: API_BASE });

/* Convert to WebSocket (http → ws, https → wss) */
const WS_BASE = API_BASE.replace(/^http/, "ws");

const SpeechToText = () => {
  const [status, setStatus] = useState("Not Connected");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRec] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);

  const pushMessage = (msg) =>
    setMessages((prev) => [...prev, { id: uuid(), ...msg }]);

  const patchLastAssistant = (patch) =>
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.type === "assistant"
          ? { ...m, ...patch }
          : m
      )
    );

  const handleError = (msg, err = null) => {
    console.error(msg, err || "");
    setStatus("Error");
    setError(msg);
    stopRecording();
  };

  const startRecording = async () => {
    setError(null);
    setStatus("Requesting microphone…");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      const socket = new WebSocket(WS_BASE);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket open");
        setStatus("Connected");

        const safeStart = setTimeout(() => {
          recorder.start(1000);
          setStatus("Listening…");
        }, 1000);

        socket.onmessage = async (evt) => {
          if (!(evt.data instanceof Blob)) return;

          const txt = await evt.data.text();
          if (txt.includes('"type":"Metadata"')) {
            clearTimeout(safeStart);
            recorder.start(1000);
            setStatus("Listening…");
          }

          try {
            const dg = JSON.parse(txt);
            const utter = dg.channel?.alternatives?.[0]?.transcript?.trim();
            if (!utter || !dg.is_final) return;

            pushMessage({ type: "user", text: utter });
            pushMessage({ type: "assistant", text: "…" });

            const llmRes = await API.post("/api/generate-content", {
              transcript: utter,
            });

            const botText = llmRes.data.choices?.[0]?.message?.content?.trim();
            if (!botText) return handleError("Empty assistant response");

            patchLastAssistant({ text: botText });

            try {
              const ttsRes = await API.post(
                "/generate-audio",
                { text: botText },
                { responseType: "blob" }
              );
              if (ttsRes.status === 200) {
                patchLastAssistant({
                  audio: URL.createObjectURL(ttsRes.data),
                });
              }
            } catch (ttsErr) {
              console.warn("TTS failed", ttsErr);
            }
          } catch (err) {
            handleError("Parse error", err);
          }
        };
      };

      socket.onerror = (e) => handleError("WebSocket error", e);
      socket.onclose = () => setStatus("Disconnected");

      recorder.ondataavailable = (e) => {
        if (e.data.size && socket.readyState === WebSocket.OPEN) {
          socket.send(e.data);
        }
      };

      setIsRec(true);
    } catch (micErr) {
      handleError("Mic permission denied or unavailable", micErr);
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    } catch (stopErr) {
      console.warn("Stop failed", stopErr);
    }
    setIsRec(false);
    setStatus("Not Connected");
  };

  return (
    <SpeechToTextUI
      status={status}
      messages={messages}
      isRecording={isRecording}
      startRecording={startRecording}
      stopRecording={stopRecording}
      error={error}
    />
  );
};

export default SpeechToText;
