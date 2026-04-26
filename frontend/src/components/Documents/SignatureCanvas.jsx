// frontend/src/components/Documents/SignatureCanvas.jsx
import { useRef, useState, useEffect } from "react";

const SignatureCanvas = ({ onSave, onCancel }) => {
  const canvasRef   = useRef(null);
  const isDrawing   = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    ctx.fillStyle   = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#a5b4fc";
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width  / rect.width),
      y: (clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDraw = () => { isDrawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    if (isEmpty) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">✍️ Draw Signature</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <p className="text-slate-400 text-xs mb-3">Draw your signature in the box below</p>

        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full rounded-xl border border-slate-600 cursor-crosshair touch-none"
          style={{ height: "180px" }}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={clear}
            className="flex-1 py-2 border border-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={isEmpty}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvas;