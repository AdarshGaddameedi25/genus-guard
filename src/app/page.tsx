'use client';

import { useState } from 'react';
import { Download, Copy, Moon, Sun, ArrowLeft } from 'lucide-react';
import ConsentModal from '@/components/SecurityModals';
import UploadModal from '@/components/UploadModal';
import PatientDashboard from '@/components/PatientDashboard';
import DoctorDashboard from '@/components/DoctorDashboard';
import DigitalTwin from '@/components/DigitalTwin';
import GCIBadge from '@/components/GCIBadge';

export default function Home() {
  const [hasConsented, setHasConsented] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [viewMode, setViewMode] = useState<'patient' | 'clinical' | 'json'>('patient');

  const handleAnalyze = async (file: File, drugs: string) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('vcf', file);
      formData.append('drugs', drugs);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (json.results) {
        setResults(json.results);
      } else {
        alert(json.error || 'Failed to analyze VCF');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Check offline fallback mode or console.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify({ results }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GENO_CLARITY_REPORT_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    if (!results) return;
    navigator.clipboard.writeText(JSON.stringify({ results }, null, 2));
    alert('JSON Report copied to clipboard');
  };

  const resetAnalysis = () => {
    setResults(null);
  };

  if (!hasConsented) {
    return <ConsentModal onAccept={() => setHasConsented(true)} />;
  }

  return (
    <main className="min-h-screen relative p-4 md:p-8 pb-24 bg-slate-50 text-slate-900">

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-12 relative z-10 glass-panel px-6 py-4 rounded-full border border-slate-200 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <span className="font-bold text-white tracking-widest text-lg">G</span>
          </div>
          <h1 className="text-xl font-black tracking-widest text-slate-900">GENO-CLARITY</h1>
        </div>

        {results && (
          <div className="flex items-center gap-4">
            <GCIBadge score={results[0]?.quality_metrics?.gci_score || 0} />

            <div className="bg-slate-100 p-1 rounded-full flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode('patient')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'patient' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Patient View
              </button>
              <button
                onClick={() => setViewMode('clinical')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'clinical' ? 'bg-white text-accent shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Clinical View
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'json' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                JSON Schema
              </button>
            </div>

            <button onClick={resetAnalysis} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto relative z-10 animate-in slide-in-from-bottom-4 duration-500">
        {!results ? (
          <div className="mt-20">
            <UploadModal onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        ) : (
          <div className="space-y-12">

            {viewMode === 'patient' && <PatientDashboard data={results} />}
            {viewMode === 'clinical' && <DoctorDashboard data={results} />}
            {viewMode === 'json' && (
              <div className="glass-panel p-6 rounded-2xl bg-white shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Raw API Output (Schema Validated)</h3>
                <pre className="bg-slate-50 rounded-xl p-4 overflow-x-auto border border-slate-200 text-xs text-slate-800 font-mono">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}

            <DigitalTwin data={results} />

            {/* Export Actions */}
            <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-200">
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Download JSON Report
              </button>
              <button
                onClick={handleCopyClipboard}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium transition-colors shadow-sm"
              >
                <Copy className="w-4 h-4" /> Copy to Clipboard
              </button>
            </div>

          </div>
        )}
      </div>

    </main>
  );
}
