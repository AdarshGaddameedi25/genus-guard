'use client';

import { DrugRiskAssessment } from '@/lib/pgxRulesBase';
import { Activity, ShieldAlert, CheckCircle, Brain, Target, Shield, HeartPulse, Droplets } from 'lucide-react';

interface PatientDashboardProps {
    data: any[]; // API results array
}

const getRiskInfo = (risk: string) => {
    switch (risk) {
        case 'Safe': return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: CheckCircle, emoji: '🟢', metaphor: 'Smooth Highway' };
        case 'Adjust Dosage': return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: Activity, emoji: '🟡', metaphor: 'Speed Bumps Ahead' };
        case 'Toxic': return { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', icon: ShieldAlert, emoji: '🔴', metaphor: 'Roadblock (Bridge Out)' };
        case 'Ineffective': return { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300', icon: Target, emoji: '⚪', metaphor: 'Empty Gas Tank' };
        case 'Unknown': return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', icon: Activity, emoji: '🔵', metaphor: 'Under Construction (Need More Data)' };
        default: return { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300', icon: Activity, emoji: '❓', metaphor: 'Unmapped Road' };
    }
};

export default function PatientDashboard({ data }: PatientDashboardProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="bg-white p-6 rounded-2xl mb-8 border-l-4 border-l-primary shadow-sm flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Brain className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Personalized PGx Report</h2>
                    <p className="text-slate-500 mt-1">
                        This guide translates your DNA into simple advice for medications. We acts like a traffic system for your body.
                    </p>
                </div>
            </div>

            {data.map((result: any, idx: number) => {
                const risk = result.risk_assessment.risk_label;
                const info = getRiskInfo(risk);
                const Icon = info.icon;

                return (
                    <div key={idx} className={`bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md ${info.border}`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${info.bg} ${info.color}`}>
                                    <span className="text-3xl">{info.emoji}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-wide flex items-center gap-2 text-slate-900">
                                        {result.drug}
                                    </h3>
                                    <div className={`text-sm font-medium mt-1 flex items-center gap-1.5 ${info.color}`}>
                                        <Icon className="w-4 h-4" /> {risk.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div className="md:text-right px-4 pl-0 md:pr-0">
                                <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">Body&apos;s Filter Metaphor</span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                                    {info.metaphor}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Patient LLM Explanation */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-900">
                                    <HeartPulse className="w-24 h-24" />
                                </div>
                                <h4 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" /> What this means for me
                                </h4>
                                <p className="text-slate-700 leading-relaxed text-sm relative z-10">
                                    {result.llm_generated_explanation.summary}
                                </p>
                            </div>

                            {/* Quick Summary Metrics */}
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1"><Droplets className="w-5 h-5 text-slate-400" /></div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-semibold">Associated Gene Activity</span>
                                        <p className="text-slate-800 font-medium mt-0.5">{result.pharmacogenomic_profile.phenotype}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1"><Target className="w-5 h-5 text-slate-400" /></div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-semibold">Action Required</span>
                                        <p className="text-slate-800 font-medium mt-0.5">{result.clinical_recommendation.action}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}
