
import React, { useState } from 'react';
import { AppState, TruckInfo, ScannedRecord } from './types.ts';
import InputForm from './components/InputForm.tsx';
import CameraScanner from './components/CameraScanner.tsx';
import ResultsTable from './components/ResultsTable.tsx';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [truckInfo, setTruckInfo] = useState<TruckInfo | null>(null);
  const [scannedRecords, setScannedRecords] = useState<ScannedRecord[]>([]);
  const [sessionScans, setSessionScans] = useState<string[]>([]);

  const handleStartScanning = (info: TruckInfo) => {
    setTruckInfo(info);
    setSessionScans([]);
    setAppState(AppState.SCANNING);
  };

  const handleScan = (tagIds: string[]) => {
    setSessionScans(prev => [...prev, ...tagIds]);
  };

  const handleFinishScanning = () => {
    if (truckInfo && sessionScans.length > 0) {
      const newRecords: ScannedRecord[] = sessionScans.map(tagId => ({
        date: truckInfo.date,
        truckNumber: truckInfo.truckNumber,
        tagId,
      }));
      setScannedRecords(prev => [...prev, ...newRecords]);
    }
    setAppState(AppState.RESULTS);
  };
  
  const handleScanNew = () => {
    setTruckInfo(null);
    setSessionScans([]);
    setAppState(AppState.INPUT);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.SCANNING:
        return (
          <CameraScanner 
            onScan={handleScan}
            onFinish={handleFinishScanning}
            scannedCount={sessionScans.length}
          />
        );
      case AppState.RESULTS:
        return (
          <ResultsTable
            records={scannedRecords}
            onScanNew={handleScanNew}
          />
        );
      case AppState.INPUT:
      default:
        return <InputForm onStartScanning={handleStartScanning} />;
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      {renderContent()}
    </main>
  );
}

export default App;