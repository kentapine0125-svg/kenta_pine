import React, { useState, useEffect } from 'react';
import type { TruckInfo } from '../types.ts';
import { CalendarIcon, TruckIcon, KeyIcon, HelpIcon } from './icons.tsx';

interface InputFormProps {
  onStartScanning: (info: TruckInfo) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onStartScanning }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [truckNumber, setTruckNumber] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('gemini_api_key', newApiKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && truckNumber && apiKey) {
      onStartScanning({ date, truckNumber });
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <TruckIcon className="w-16 h-16 mx-auto text-indigo-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">トラックカートスキャナー</h1>
        <p className="mt-2 text-sm text-gray-600">情報を入力してスキャンを開始してください。</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="api-key" className="sr-only">Gemini API Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="api-key"
                name="api-key"
                type="password"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Gemini APIキー"
                value={apiKey}
                onChange={handleApiKeyChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div 
                  className="relative"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                >
                  <HelpIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                  {showTooltip && (
                    <div className="absolute bottom-full mb-2 -right-4 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-20">
                      APIキーは画像解析に必要です。入力されたキーは、お使いのブラウザに安全に保存され、外部に送信されることはありません。
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="date" className="sr-only">日付</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="date"
                name="date"
                type="date"
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="truck-number" className="sr-only">トラック番号</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TruckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="truck-number"
                name="truck-number"
                type="text"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="トラック番号"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={!date || !truckNumber || !apiKey}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            スキャン開始
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;