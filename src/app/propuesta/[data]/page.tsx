'use client';

import { useEffect, useState, useRef, use } from 'react';
import { ProposalDocument, type ProposalDocumentProps } from '../../../components/ProposalDocument';
import { Loader2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ProposalPage(props: { params: Promise<{ data: string }> }) {
    const params = use(props.params);
    const { data } = params;

    const [documentProps, setDocumentProps] = useState<ProposalDocumentProps | null>(null);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const quoteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            // Reverse URL-safe Base64
            let b64 = data.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) {
                b64 += '=';
            }

            // Un-escape and Decode Base64 payload
            const decodedStr = decodeURIComponent(escape(atob(b64)));
            const decodedProps = JSON.parse(decodedStr);
            setDocumentProps(decodedProps);

            // Trigger silent tracking ping to /api/hubspot (or a future tracking endpoint)
            fetch('/cotiza-sap-business-one/api/hubspot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: decodedProps.lead?.email,
                    isTrackingEvent: true, // Specific flag so backend knows it's an update, not a new lead
                    event: "Proposal Viewed",
                    proposalId: decodedProps.proposalId,
                    company: decodedProps.lead?.company
                })
            }).catch((err) => console.log('Tracking error (ignored):', err));

            // Trigger Slack alert
            fetch('/cotiza-sap-business-one/api/slack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead: decodedProps.lead,
                    quoteDetails: {
                        solution: decodedProps.solution,
                        industry: decodedProps.industry,
                        proUsers: decodedProps.proUsers,
                        limitedUsers: decodedProps.limitedUsers
                    },
                    proposalId: decodedProps.proposalId
                })
            }).catch((err) => console.log('Slack alert error (ignored):', err));

        } catch (e: any) {
            console.error("Invalid proposal data format", e);
            setErrorMsg(e.message || String(e));
            setError(true);
        }
    }, [data]); // Changed dependency from params.data to data

    const downloadPDF = async () => {
        if (!quoteRef.current || !documentProps) return; // Changed props to documentProps

        try {
            // allowTaint is required if we have external images like Canva logos
            const canvas = await html2canvas(quoteRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Propuesta_SAP_${documentProps.lead.company || 'Xamai'}.pdf`);
        } catch (error) {
            console.error("Error generando el PDF:", error);
            alert("Hubo un problema al generar el PDF. Revisa la consola.");
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-white mb-2">Enlace Inválido</h1>
                <p className="text-slate-400 text-center max-w-md mb-4">La propuesta no se pudo cargar. Por favor verifica que el enlace sea correcto.</p>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-400 font-mono text-xs w-full max-w-md break-all">
                    Data: {data.substring(0, 50)}...<br /><br /> {/* Changed params.data to data */}
                    Error: {errorMsg}
                </div>
            </div>
        );
    }

    if (!documentProps) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin relative z-10" />
                </div>
                <p className="text-slate-400">Desencriptando propuesta segura...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex flex-col items-center justify-start overflow-y-auto">
            {/* Action Bar */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-6">
                <div className="text-white">
                    <h2 className="font-bold text-lg">Propuesta para {documentProps.lead.company}</h2>
                    <p className="text-xs text-slate-400">ID: {documentProps.proposalId}</p>
                </div>
                <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium border border-slate-700">
                    <Download className="w-4 h-4" /> Bajar PDF
                </button>
            </div>

            {/* Document wrapper simulating a desk/shadow */}
            <div className="w-full max-w-4xl relative">
                <div className="absolute inset-0 bg-black/40 blur-2xl transform translate-y-4 rounded-[40px]"></div>
                <div className="relative z-10 bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <ProposalDocument ref={quoteRef} {...documentProps} />
                </div>
            </div>
        </div>
    );
}
