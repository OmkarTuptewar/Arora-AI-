import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";


const SpeechToTextUI = ({
  status,
  messages,
  isRecording,
  startRecording,
  stopRecording,
  error,
}) => {
  const scrollRef = useRef(null);

  /* auto‑scroll to newest */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* framer variants */
  const bubbleVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    show:   { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black-50 via-black-50 to-black-100 p-6">
      {/* title */}
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-cyan-500 drop-shadow-md">
          Aurora&nbsp;AI
        </span>
      </h1>

      {/* main card */}
      <div className="w-full max-w-3xl h-[80vh] bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden flex flex-col border border-white/40">
        {/* status + error */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md border-b border-white/30">
          <p className="text-sm font-medium text-gray-700">
            Status:&nbsp;{status}
          </p>

          {/* live mic pulse */}
          {isRecording && (
            <div className="relative flex items-center">
              <span className="absolute inset-0 rounded-full bg-red-400 opacity-70 animate-ping" />
              <span className="w-3 h-3 rounded-full bg-red-500 relative" />
            </div>
          )}
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 text-sm border-b border-red-200">
            ⚠️&nbsp;{error}
          </div>
        )}

        {/* messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                layout
                key={m.id}
                variants={bubbleVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex ${
                  m.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-3 rounded-2xl shadow ${
                    m.type === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gradient-to-br from-cyan-100 to-violet-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {/* typing dots or text */}
                  {m.text === "…" ? (
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {m.text}
                    </p>
                  )}

                  {/* audio (assistant) */}
                  {m.audio && (
                    <audio
                      src={m.audio}
                      controls
                       autoPlay
                      className="w-full mt-3 rounded-lg"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="flex justify-center items-center gap-6 py-4 bg-white/60 backdrop-blur-md border-t border-white/40">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white shadow-lg transform transition ${
              isRecording
                ? "bg-teal-400/60 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-500 to-blue-600 hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
            Start&nbsp;Recording
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white shadow-lg transform transition ${
              !isRecording
                ? "bg-red-400/60 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-orange-500 hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            <StopIcon className="w-5 h-5" />
            Stop&nbsp;Recording
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeechToTextUI;
