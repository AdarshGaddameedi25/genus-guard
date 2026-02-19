# GENO-CLARITY 🧬

**AI-Powered Serverless Pharmacogenomic Risk Intelligence Platform**

GENO-CLARITY is a production-ready, clinical-grade Next.js application designed to parse VCF 4.2 genomic files entirely at the edge. It combines deterministic rule engines mapped to CPIC guidelines with Groq's high-speed LLMs to provide zero-latency, personalized pharmacological risk assessments. 

It features an innovative **Pharmacological Digital Twin**, visualizing patient-specific drug metabolism curves using WebAssembly-accelerated math in the browser.

---

## 🚀 Architecture Highlights

- **Frontend:** Next.js 15 (App Router), React, TailwindCSS, Framer Motion, Recharts.
- **Backend:** Completely Serverless Edge Functions (`/api/analyze`).
- **Data Privacy:** Zero File Persistence. VCF files are kept entirely in encrypted memory buffers and destroyed immediately post-analysis.
- **AI Integration:** Groq API (LLaMA3) is utilized *exclusively* for generating plain-language and clinical rationale explanations. It is restricted from making primary deterministic medical decisions.
- **Rules Engine:** Hardcoded, deterministic mapping of CPIC Level A guidelines for 6 core drugs across CYP, SLCO, TPMT, and DPYD pathways.

---

## 🛡️ Safety Design & Validation Strategy

Our system adheres to strict clinical safety criteria:
1. **Deterministic Priority:** The LLM does *not* read the VCF or guess the risk. A strict algorithmic pipeline determines if a variant triggers a "Toxic" or "Adjust Dosage" flag based on known rsID > diplotype > phenotype mapping. The LLM only receives the finalized phenotype to write the explanation.
2. **Genomic Confidence Index (GCI):** Calculates and displays exactly how thoroughly the supplied VCF covers the required pathways.
3. **HIPAA Readiness:** Local memory processing + TLS encryption. No databases.
4. **Validation Strategy:** Includes testing with verified positive/negative synthetic VCF samples for Poor Metabolizers.

---

## 🧬 Available Pathways

| Gene | rsID | Variant Analyzed | Associated Target Drug |
|---|---|---|---|
| **CYP2D6** | rs3892097 | *4 (C>T) | Codeine |
| **CYP2C19** | rs12248560 | *2 (C>T) | Clopidogrel |
| **CYP2C9** | rs1057910 | *3 (A>C) | Warfarin |
| **SLCO1B1** | rs4149056 | *5 (T>C) | Simvastatin |
| **TPMT** | rs1142345 | *3C (A>G) | Azathioprine |
| **DPYD** | rs3918290 | *2A (G>A) | Fluorouracil |

---

## 💻 Installation & Setup

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. **Run locally:**
   ```bash
   npm run dev
   ```

---

## ☁️ Deployment Guide (Vercel)

GENO-CLARITY is optimized for edge deployment on Vercel.

1. Ensure your repository is pushed to GitHub.
2. Log into the Vercel Dashboard and click **Import Project**.
3. Select this repository.
4. In the environment variables section, add `GROQ_API_KEY`.
5. Click **Deploy**. Vercel will auto-detect Next.js and build the Edge-optimized artifacts.

---

## 🔗 API Documentation

### `POST /api/analyze`
**Headers:** `Content-Type: multipart/form-data`
**Body:**
- `vcf`: (File) Valid VCF v4.2 file.
- `drugs`: (Array<string> | Optional) Comma separated list. Auto-defaults to all 6 core target drugs.

**Response:**
Returns strictly formatted JSON compatible with downstream EHR architectures.
```json
{
  "success": true,
  "data": [
    {
       "patient_id": "anon_xyz",
       "drug": "WARFARIN",
       "risk_assessment": { "risk_level": "Toxic", "evidence_strength": "High" },
       "pharmacogenomic_profile": { "phenotype": "Poor Metabolizer" }
       ...
    }
  ]
}
```

---

## 🔮 Future Roadmap
- Integration with FHIR / SMART on FHIR endpoints.
- Expanding the Deterministic rule engine to support Phased VCFs with Haplotype mapping.
- Adding comprehensive CYP3A4 profiles.

*Disclaimer: GENO-CLARITY is a demonstration platform intended for conceptual visualization of modern bioinformatics and digital health software architecture.*
