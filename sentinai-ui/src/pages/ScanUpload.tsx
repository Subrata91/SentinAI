import React, { useState, useEffect, useRef } from "react";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";

export const ScanUpload: React.FC = () => {
  const [textInput, setTextInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Ref to hold polling interval ID for cleanup on component unmount
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Cleanup polling timer if user leaves the tab/page
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const pollScanStatus = (scanId: string, startTime: number) => {
    const maxRetries = 30;
    let attempts = 0;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/scan/${scanId}`);
        if (!res.ok) return;

        const data = await res.json();

        // Stop polling once Python worker updates status in MongoDB Atlas
        if (data.status !== "PROCESSING" || attempts >= maxRetries) {
          stopPolling();
          const endTime = performance.now();

          setScanResult({
            status: data.status,
            confidence: data.confidence || "N/A",
            threatType: data.threatType,
            latency: `${Math.round(endTime - startTime)}ms`,
          });
          setIsScanning(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        stopPolling();
        setIsScanning(false);
      }
    }, 1000);
  };

  const handleRealScan = async () => {
    if (!textInput.trim()) return;

    stopPolling();
    setIsScanning(true);
    setScanResult(null);

    const startTime = performance.now();

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "TEXT",
          payload: textInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache hit or instant completion
      if (data.cached || data.status !== "PROCESSING") {
        const endTime = performance.now();
        setScanResult({
          status: data.status,
          confidence: data.confidence,
          threatType: data.threatType,
          latency: `${Math.round(endTime - startTime)}ms`,
        });
        setIsScanning(false);
      } else {
        // Start polling using server-generated scanId
        pollScanStatus(data.scanId, startTime);
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to submit scan request to SentinAI API Gateway.");
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-base font-semibold text-slate-200">
          Test Security Inspection Gateway
        </h3>
        <p className="text-xs text-slate-400">
          Submitting content here routes payloads through the Spring Boot API,
          publishes to Kafka, and triggers real-time Python model inference.
        </p>

        {/* File Dropzone UI */}
        {/* <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 transition-colors rounded-xl p-8 text-center bg-slate-950/40 cursor-pointer">
          <UploadCloud className="mx-auto text-slate-500 mb-3" size={36} />
          <p className="text-sm text-slate-300 font-medium">
            Drag and drop images or documents here
          </p>
          <p className="text-xs text-slate-500 mt-1">
            PNG, JPG, PDF up to 10MB
          </p>
        </div> */}

        {/* Text Input Inspector */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Paste Text / Code Payload
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={4}
            placeholder="Paste text, prompt, or sensitive code snippets to analyze..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <button
          onClick={handleRealScan}
          disabled={isScanning || !textInput.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Streaming through Kafka & AI Workers...</span>
            </>
          ) : (
            <>
              <FileText size={16} />
              <span>Dispatch Payload to SentinAI Engine</span>
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {scanResult && (
        <div
          className={`p-5 rounded-xl border ${
            scanResult.status === "FLAGGED"
              ? "bg-rose-950/20 border-rose-500/30"
              : "bg-emerald-950/20 border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={18}
                className={
                  scanResult.status === "FLAGGED"
                    ? "text-rose-400"
                    : "text-emerald-400"
                }
              />
              <span className="font-semibold text-sm">
                Inspection Completed
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Processing Time: {scanResult.latency}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500">Verdict:</span>
              <p
                className={`font-bold mt-0.5 ${
                  scanResult.status === "FLAGGED"
                    ? "text-rose-400"
                    : "text-emerald-400"
                }`}
              >
                {scanResult.status}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Model Confidence:</span>
              <p className="font-mono text-slate-200 mt-0.5">
                {scanResult.confidence}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};