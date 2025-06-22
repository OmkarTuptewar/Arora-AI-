import React, { useEffect, useRef, useState } from 'react';

const AudioWithWaveform = ({ url }) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    if (!url) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioRef.current);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 1.5;
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }

    draw();
    setContext(audioCtx);

    return () => {
      audioCtx.close();
    };
  }, [url]);

  return (
    <div className="mt-2 flex flex-col items-center">
      <canvas ref={canvasRef} width="300" height="50" className="rounded shadow-sm bg-white" />
      <audio ref={audioRef} src={url} controls autoPlay className="mt-1 w-full" />
    </div>
  );
};

export default AudioWithWaveform;
