'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, ShieldAlert, FileText, Database, FileCode2, AlertTriangle, Pill } from 'lucide-react';

interface UploadModalProps {
    onAnalyze: (file: File, drugs: string) => void;
    isAnalyzing: boolean;
}

const TARGET_DRUGS = [
    'CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL',
    'AMIODARONE', 'CITALOPRAM', 'OMEPRAZOLE', 'PHENYTOIN'
];

export default function UploadModal({ onAnalyze, isAnalyzing }: UploadModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>(TARGET_DRUGS);
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleDrug = (drug: string) => {
        setSelectedDrugs(prev =>
            prev.includes(drug) ? Math.max(1, prev.length - 1) === prev.length ? prev : prev.filter(d => d !== drug) : [...prev, drug]
        );
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        setError(null);
        if (!file.name.toLowerCase().endsWith('.vcf')) {
            setError('Invalid file type. Please upload a .vcf file.');
            return;
        }
        // Limit to 50MB
        if (file.size > 50 * 1024 * 1024) {
            setError('File is too large (>50MB). For edge processing, please upload a smaller VCF.');
            return;
        }
        setSelectedFile(file);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden transition-all">

            {/* Background Glow removed for clinical look */}

            <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4 shadow-sm border border-primary/20">
                    <Database className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">Clinical VCF Analysis</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                    Upload a raw uncompressed <span className="text-primary font-mono font-bold">.vcf</span> file to process pharmacogenomic phenotypes locally.
                    <br /><span className="text-xs mt-2 block opacity-70 border-t border-slate-200 pt-2 text-slate-400">HIPAA Compliant • Runs entirely edge-side • No data retained</span>
                </p>
            </div>

            <div
                className={`relative z-10 border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragActive
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : selectedFile ? 'border-success bg-success/5' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('vcf-upload')?.click()}
            >
                <input
                    id="vcf-upload"
                    type="file"
                    className="hidden"
                    accept=".vcf"
                    onChange={handleChange}
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <FileCode2 className="w-16 h-16 text-success mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedFile.name}</h3>
                        <p className="text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for parsing</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <UploadCloud className={`w-16 h-16 mb-4 transition-colors ${dragActive ? 'text-primary' : 'text-slate-400'}`} />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Drag & Drop VCF File</h3>
                        <p className="text-slate-500">or click to browse local files</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-3 relative z-10">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {selectedFile && !error && (
                <div className="mt-8 relative z-10 space-y-6">
                    <div>
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-3">Target Drugs to Analyze</h3>
                        <div className="flex flex-wrap gap-2">
                            {TARGET_DRUGS.map(drug => (
                                <button
                                    key={drug}
                                    onClick={() => toggleDrug(drug)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedDrugs.includes(drug) ? 'bg-primary/20 text-primary border-primary/50' : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-700'}`}
                                >
                                    {drug}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={!selectedFile || isAnalyzing || selectedDrugs.length === 0}
                        onClick={() => selectedDrugs.length > 0 && onAnalyze(selectedFile, selectedDrugs.join(','))}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${!selectedFile || isAnalyzing || selectedDrugs.length === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-primary hover:bg-primary/90 text-white shadow-md border border-primary/20'
                            }`}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing Pharmacogenomics...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <FileText className="w-5 h-5" />
                                Analyze Genomic Profile
                            </span>
                        )}
                    </button>

                    {isAnalyzing && (
                        <div className="mt-4 text-center text-xs text-gray-500 animate-pulse">
                            Parsing variants → Evaluating pathways → Consulting AI
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
