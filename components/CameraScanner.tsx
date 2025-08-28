import React, { useState, useRef, useEffect, useCallback } from 'react';
import { extractTextFromImage } from '../services/geminiService';
import Spinner from './Spinner';
import { CameraIcon } from './icons';

interface CameraScannerProps {
  onScan: (tagIds: string[]) => void;
  onFinish: () => void;
  scannedCount: number;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onFinish, scannedCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("このブラウザはカメラ機能をサポートしていません。");
      return;
    }
    
    try {
      // Prioritize rear camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Failed to get environment camera, trying any camera:", err);
      // Fallback to any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (fallbackErr) {
        console.error("Error accessing camera:", fallbackErr);
        setError("カメラにアクセスできませんでした。ブラウザの権限設定を確認してください。");
      }
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    setLastScan(null);

    try {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            throw new Error("カメラが初期化中です。もう一度お試しください。");
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error("キャンバスコンテキストを取得できませんでした。");
        }
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Image = dataUrl.split(',')[1];
        
        if (!base64Image) {
            throw new Error("画像データの生成に失敗しました。");
        }

        const tagIdText = await extractTextFromImage(base64Image);
        const tagIds = tagIdText.split(',').map(id => id.trim()).filter(Boolean);

        if (tagIds.length > 0) {
            onScan(tagIds);
            setLastScan(tagIds.join(', '));
        } else {
            throw new Error("荷札から有効な番号を抽出できませんでした。");
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'スキャンに失敗しました。もう一度お試しください。';
        console.error("Capture failed:", e);
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-lg mb-4">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
             {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
                    <Spinner className="w-12 h-12" />
                    <p className="text-white mt-2">スキャン中...</p>
                </div>
            )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />

        <div className="text-center mb-4 p-4 bg-white rounded-lg shadow-md w-full">
            <p className="text-lg font-semibold text-gray-800">スキャンされたカート: <span className="text-indigo-600">{scannedCount}</span></p>
            {lastScan && <p className="text-sm text-gray-600 mt-1">最後のスキャン: <span className="font-mono bg-gray-200 px-1 rounded">{lastScan}</span></p>}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex items-center justify-center gap-4 w-full">
            <button
                onClick={handleCapture}
                disabled={isLoading}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-transform duration-200 ease-in-out hover:scale-105"
                aria-label="Scan tag"
            >
                {isLoading ? <Spinner className="w-8 h-8 text-indigo-600" /> : <CameraIcon className="w-10 h-10 text-indigo-600" />}
            </button>
            <button
                onClick={onFinish}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
                完了
            </button>
        </div>
    </div>
  );
};

export default CameraScanner;