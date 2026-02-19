import { DrugRiskAssessment } from '@/lib/pgxRulesBase';
import { Activity, ShieldAlert, CheckCircle, Database, Stethoscope, Award, FileWarning } from 'lucide-react';

interface DoctorDashboardProps {
    data: any[];
}

const getBadgeColor = (risk: string) => {
    switch (risk) {
        case 'Safe': return 'bg-success/10 text-success border-success/30';
        case 'Adjust Dosage': return 'bg-warning/10 text-warning border-warning/30';
        case 'Toxic': return 'bg-danger/10 text-danger border-danger/30';
        case 'Ineffective': return 'bg-slate-100 text-slate-500 border-slate-300';
        case 'Unknown': return 'bg-primary/10 text-primary border-primary/30';
        default: return 'bg-slate-100 text-slate-500 border-slate-300';
    }
};

export default function DoctorDashboard({ data }: DoctorDashboardProps) {
    // Aggregate Quality Metrics
    const gciScore = data.length > 0 ? data[0].quality_metrics.gci_score : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-6 text-sm">

            {/* Clinical Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl flex-1 border border-slate-200 border-l-4 border-l-accent shadow-sm flex items-start gap-4">
                    <Stethoscope className="w-8 h-8 text-accent shrink-0 mt-1" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Clinical Pharmacogenomics Summary</h2>
                        <p className="text-slate-500 leading-relaxed mb-4">
                            Diagnostic assessment based on high-throughput VCF v4.2 analysis aligned with CPIC guidelines.
                        </p>
                        <div className="flex gap-4">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                                <Database className="w-3 h-3" /> Variants Assessed: {data.length > 0 ? data[0].quality_metrics.variants_analyzed : 0}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
                                <Award className="w-3 h-3 text-accent" /> GCI: {gciScore}/100
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                            <th className="p-3">Drug</th>
                            <th className="p-3">Target Gene</th>
                            <th className="p-3">Genotype</th>
                            <th className="p-3">Phenotype</th>
                            <th className="p-3">Clinical Risk</th>
                            <th className="p-3 block w-64 min-w-[300px]">Recommendation (CPIC Based)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((result: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-semibold text-slate-900">{result.drug}</td>
                                <td className="p-3 text-primary font-mono">{result.pharmacogenomic_profile.primary_gene}</td>
                                <td className="p-3 text-slate-600 font-mono text-xs">{result.pharmacogenomic_profile.diplotype}</td>
                                <td className="p-3 text-slate-500 text-xs">{result.pharmacogenomic_profile.phenotype}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getBadgeColor(result.risk_assessment.risk_label)}`}>
                                        {result.risk_assessment.risk_label.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-700 text-xs leading-relaxed block overflow-hidden">
                                    {result.clinical_recommendation.action}
                                    {result.clinical_recommendation.alternatives !== 'N/A' && (
                                        <div className="mt-1 text-danger font-semibold">
                                            Alternates: {result.clinical_recommendation.alternatives}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Advanced LLM Explanations for Clinicians */}
            <h3 className="text-lg font-bold text-slate-900 mt-12 mb-4 flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-accent" /> AI Clinical Rationale
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.map((result: any, idx: number) => (
                    <div key={`llm-${idx}`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-primary font-bold mb-2">{result.drug} Pathway Analysis</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {result.llm_generated_explanation.clinician_view}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
