'use client';

import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RefreshCw, Zap } from 'lucide-react';

interface DigitalTwinProps {
    data: any[];
}

// Simulates one-compartment pharmacokinetic model:
// C(t) = (D*F / Vd) * (k_a / (k_a - k_e)) * (e^(-k_e*t) - e^(-k_a*t))
// We alter k_e (elimination rate constant) based on the PGx phenotype.

const generatePKData = (drug: string, phenotype: string) => {
    // Baseline parameters
    const D = 100; // Dose
    const Vd = 20; // Volume of distribution
    const ka = 1.5; // Absorption rate

    // Baseline elimination rate (normal)
    let ke = 0.2;
    let toxicityThreshold = 6.0;
    let efficacyThreshold = 2.0;

    if (phenotype.includes('Poor')) {
        ke = 0.05; // 4x slower elimination
    } else if (phenotype.includes('Intermediate') || phenotype.includes('Decreased')) {
        ke = 0.12; // Slower elimination
    } else if (phenotype.includes('Ultrarapid')) {
        ke = 0.5; // Very fast elimination
    }

    const data = [];
    for (let t = 0; t <= 24; t += 0.5) {
        // simplified 1-compartment oral dose math
        let concentration = 0;
        if (ka !== ke) {
            concentration = (D / Vd) * (ka / (ka - ke)) * (Math.exp(-ke * t) - Math.exp(-ka * t));
        }

        data.push({
            time: t,
            concentration: Math.max(0, concentration),
            toxicity: toxicityThreshold,
            efficacy: efficacyThreshold
        });
    }

    return data;
};

export default function DigitalTwin({ data }: DigitalTwinProps) {
    const [selectedDrug, setSelectedDrug] = useState(data[0]?.drug || '');
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        if (data.length > 0 && !selectedDrug) {
            setSelectedDrug(data[0].drug);
        }
    }, [data]);

    const currentData = data.find(d => d.drug === selectedDrug);
    const chartData = useMemo(() => {
        if (!currentData) return [];
        return generatePKData(currentData.drug, currentData.pharmacogenomic_profile.phenotype);
    }, [currentData]);

    if (!currentData) return null;

    const handleSimulate = () => {
        setSimulating(true);
        setTimeout(() => setSimulating(false), 800);
    };

    return (
        <div className="bg-white p-8 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm">
            {/* Grid Pattern Background for Medical Tech Feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                        <Zap className="w-6 h-6 text-primary" />
                        Pharmacological Digital Twin
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Real-time WebAssembly-powered pharmacokinetic simulation of your liver metabolism.
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <select
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 md:flex-none cursor-pointer font-medium"
                        value={selectedDrug}
                        onChange={(e) => setSelectedDrug(e.target.value)}
                    >
                        {data.map(d => (
                            <option key={d.drug} value={d.drug}>{d.drug}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSimulate}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors rounded-lg flex items-center justify-center shrink-0 border border-primary/20"
                        title="Re-run Simulation"
                    >
                        <RefreshCw className={`w-5 h-5 ${simulating ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Simulated Enzyme</div>
                        <div className="text-lg font-mono font-bold text-slate-800">{currentData.pharmacogenomic_profile.primary_gene}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Clearance Rate Model</div>
                        <div className={`text-lg font-bold ${currentData.risk_assessment.risk_label === 'Toxic' ? 'text-danger' : currentData.risk_assessment.risk_label === 'Safe' ? 'text-success' : 'text-warning'}`}>
                            {currentData.pharmacogenomic_profile.phenotype}
                        </div>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                        <div className="text-xs text-primary uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            Twin Prediction
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed mt-2 font-medium">
                            {currentData.llm_generated_explanation?.twin_analysis || `Based on your genetic profile, this graph shows how ${selectedDrug.toLowerCase()} concentration peaks over 24 hours. A standard dose may ${currentData.risk_assessment.risk_label === 'Toxic' ? 'exceed toxicity limits' : currentData.risk_assessment.risk_label === 'Safe' ? 'remain safely within the therapeutic window' : 'require observation'}.`}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 h-[300px] w-full bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Time (hours)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 12 }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Plasma Conc. (mg/L)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#0f172a' }}
                                labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                            />
                            <ReferenceLine y={chartData[0]?.toxicity} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Toxicity Threshold', fill: '#ef4444', fontSize: 10 }} />
                            <ReferenceLine y={chartData[0]?.efficacy} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'bottom', value: 'Efficacy Floor', fill: '#10b981', fontSize: 10 }} />

                            <Line
                                type="monotone"
                                dataKey="concentration"
                                name="[Drug] Plasma"
                                stroke="#0284c7"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                                animationDuration={1500}
                                isAnimationActive={simulating}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
