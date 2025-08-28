
import React from 'react';
import type { ScannedRecord } from '../types.ts';
import { ExportIcon } from './icons.tsx';

interface ResultsTableProps {
  records: ScannedRecord[];
  onScanNew: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ records, onScanNew }) => {
  const exportToCSV = () => {
    if (records.length === 0) return;
    
    const headers = "日付,トラック番号,荷札番号\n";
    const csvContent = records
      .map(r => `${r.date},${r.truckNumber},"${r.tagId}"`)
      .join("\n");
      
    const blob = new Blob(["\uFEFF" + headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const { date, truckNumber } = records[0];
    link.setAttribute("download", `scans_${truckNumber}_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">スキャン結果</h1>
        <div className="flex gap-2">
            <button
                onClick={exportToCSV}
                disabled={records.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
                <ExportIcon className="w-5 h-5" />
                CSVでエクスポート
            </button>
            <button
                onClick={onScanNew}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
                別のトラックをスキャン
            </button>
        </div>
      </div>
      
      {records.length > 0 && (
          <div className='text-sm text-gray-600 mb-4'>
            <p><span className='font-semibold'>日付:</span> {records[0].date}</p>
            <p><span className='font-semibold'>トラック番号:</span> {records[0].truckNumber}</p>
            <p><span className='font-semibold'>スキャン総数:</span> {records.length}</p>
          </div>
      )}

      <div className="overflow-x-auto max-h-96 border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                荷札番号
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  まだタグはスキャンされていません。
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {record.tagId}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;