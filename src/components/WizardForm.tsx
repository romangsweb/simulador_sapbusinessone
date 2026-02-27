'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { sapPricing, type SAPSolution, type Industry } from '../data/pricingRules';
import { calculateQuote, type QuoteResult } from '../utils/calculator';
import { Building2, Factory, Briefcase, Server, CheckCircle2, ChevronRight, ChevronLeft, Download, Send, User, Mail, Phone, Loader2, MapPin, ShoppingCart, HeartPulse, Truck, Laptop, Coffee, ExternalLink } from 'lucide-react';
import { ProposalDocument } from './ProposalDocument';

export interface LeadData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    city: string; // Added for the proposal address
}

export default function WizardForm() {
    const [step, setStep] = useState(0);
    const [lead, setLead] = useState<LeadData>({ firstName: '', lastName: '', email: '', phone: '', company: '', city: '' });
    const [solution, setSolution] = useState<SAPSolution>('business-one');
    const [industry, setIndustry] = useState<Industry>('comercializadora');
    const [proUsers, setProUsers] = useState<number>(5);
    const [limitedUsers, setLimitedUsers] = useState<number>(0);
    const [legalEntities, setLegalEntities] = useState<number>(1);
    const [quote, setQuote] = useState<QuoteResult | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const quoteRef = useRef<HTMLDivElement>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handleNext = async () => {
        // There are now 5 steps overall (index 0 to 4)
        // Step 0: About You
        // Step 1: Your Company
        // Step 2: Users
        // Step 3: Legal Entities (Submission)
        // Step 4: Result
        if (step === 3) {
            const result = calculateQuote({ solution, industry, proUsers, limitedUsers, legalEntities });
            setQuote(result);

            // Generate link right away for the email payload
            const payload = { lead, quote: result, solution, industry, proUsers, limitedUsers, legalEntities, proposalId, today };
            const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
            const b64Safe = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            const quoteUrl = `${window.location.origin}/cotiza-sap-business-one/propuesta/${b64Safe}`;

            setIsSubmitting(true);
            try {
                // Background Sync to HubSpot CRM
                fetch('/cotiza-sap-business-one/api/hubspot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...lead,
                        quoteDetails: { solution, industry, proUsers, limitedUsers, legalEntities, totalFirstYear: result.totalFirstYearCost, quoteUrl }
                    })
                }).catch(e => console.error("HubSpot sync failed:", e));

                // Foreground Dispatch to Prospect via Resend
                const emailResponse = await fetch('/cotiza-sap-business-one/api/send-proposal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lead,
                        quoteDetails: { solution, industry, quoteUrl }
                    })
                });

                if (!emailResponse.ok) console.error("Send-proposal returned error", await emailResponse.text());

            } catch (error) {
                console.error("Failed to send lead", error);
            } finally {
                setIsSubmitting(false);
                setStep(4);
            }
        } else {
            setStep(s => s + 1);
        }
    };

    const downloadPDF = async () => {
        if (!quoteRef.current) return;

        // Switch to light mode temporally for the PDF if needed, but our A4 format is hardcoded to white bg
        const canvas = await html2canvas(quoteRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');

        // A4 aspect ratio 210 x 297mm
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Propuesta_SAP_${lead.company || 'Xamai'}.pdf`);
    };

    const generateProposalNumber = () => {
        return "MP" + Math.random().toString(36).substring(2, 8).toUpperCase();
    };
    // Static for current session
    const [proposalId] = useState(generateProposalNumber());
    const today = new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

    // We no longer generate the link here as we only show the success screen


    const renderStep = () => {
        const container: Variants = {
            hidden: { opacity: 0, x: 20 },
            show: {
                opacity: 1,
                x: 0,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 }
            },
            exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
        };

        const itemAnim: Variants = {
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
        };

        switch (step) {
            case 0:
                return (
                    <motion.div variants={container} initial="hidden" animate="show" exit="exit" className="space-y-6">
                        <motion.div variants={itemAnim} className="mb-8">
                            <h2 className="text-3xl font-black mb-3 text-white tracking-tight">Comencemos el diagnóstico</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Un ERP es como el sistema nervioso central de tu negocio. Para poder diseñar la estimación más exacta posible, necesitamos conocer la entidad y las personas a las que esta tecnología va a potenciar.
                            </p>
                        </motion.div>

                        <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-sm text-slate-300 font-medium flex items-center gap-2"><User className="w-4 h-4" /> Nombre</label>
                                <input required type="text" value={lead.firstName} onChange={e => setLead({ ...lead, firstName: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Ej. Ana" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-slate-300 font-medium flex items-center gap-2">Apellidos</label>
                                <input required type="text" value={lead.lastName} onChange={e => setLead({ ...lead, lastName: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Ej. García" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-slate-300 font-medium flex items-center gap-2"><Mail className="w-4 h-4" /> Correo Laboral</label>
                                <input required type="email" value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="ana@empresa.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-slate-300 font-medium flex items-center gap-2"><Phone className="w-4 h-4" /> Teléfono</label>
                                <input type="tel" value={lead.phone} onChange={e => setLead({ ...lead, phone: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="+52 55..." />
                            </div>
                        </motion.div>
                    </motion.div>
                );

            case 1:
                return (
                    <motion.div variants={container} initial="hidden" animate="show" exit="exit" className="space-y-6">
                        <motion.div variants={itemAnim} className="mb-8">
                            <h2 className="text-3xl font-black mb-3 text-white tracking-tight">Tu Organización y su Entorno</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                La industria en la que operas dicta el 90% de la configuración de procesos en SAP. Una constructora requiere un control de presupuestos totalmente distinto al esquema de control de maquilas de una manufacturera.
                            </p>
                        </motion.div>

                        <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                            <div className="space-y-1">
                                <label className="text-sm text-slate-300 font-medium flex items-center gap-2"><Building2 className="w-4 h-4" /> Razón Social / Empresa</label>
                                <input required type="text" value={lead.company} onChange={e => setLead({ ...lead, company: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Grupo Empresarial S.A." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-slate-300 font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> Sede Principal (Ciudad, Estado)</label>
                                <input required type="text" value={lead.city} onChange={e => setLead({ ...lead, city: e.target.value })} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="Ciudad de México, CDMX" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemAnim}>
                            <label className="text-sm text-slate-300 font-medium block mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                                ¿Cuál es el giro principal que determina tus ingresos?
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'comercializadora', label: 'Comercializadora', icon: <Building2 className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'manufactura', label: 'Manufactura', icon: <Factory className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'servicios', label: 'Servicios', icon: <Briefcase className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'proyectos', label: 'Construcción', icon: <Server className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'retail', label: 'Retail / Tiendas', icon: <ShoppingCart className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'logistica', label: 'Logística / Transp.', icon: <Truck className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'salud', label: 'Salud / Farma', icon: <HeartPulse className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'tecnologia', label: 'Tecnología / IT', icon: <Laptop className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'alimentos', label: 'Alimentos y Bebidas', icon: <Coffee className="w-6 h-6 mx-auto mb-2" /> },
                                    { id: 'otra', label: 'Otra / General', icon: <Briefcase className="w-6 h-6 mx-auto mb-2" /> }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setIndustry(opt.id as Industry)}
                                        className={`p-4 rounded-xl border text-center transition-all ${industry === opt.id ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {opt.icon}
                                        <span className="font-medium text-white block text-sm">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div variants={container} initial="hidden" animate="show" exit="exit" className="space-y-6">
                        <motion.div variants={itemAnim} className="mb-8">
                            <h2 className="text-3xl font-black mb-3 text-white tracking-tight">El Equipo y las Licencias</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                El licenciamiento de software empresarial se cobra tradicionalmente por número de "Licencias Nombradas". Esto significa que cada persona que entre al sistema con su usuario impactará directamente tu tarifa mensual de suscripción a la nube.
                            </p>
                        </motion.div>

                        <motion.div variants={itemAnim} className="space-y-8 bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                            <div>
                                <label className="block font-medium text-white mb-1">Usuarios Profesionales (Full Users)</label>
                                <p className="text-xs text-slate-500 mb-4">Gerentes, directores y personal operativo clave con acceso completo.</p>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="1" max="200" value={proUsers} onChange={e => setProUsers(parseInt(e.target.value))} className="flex-1 accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                    <span className="w-16 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 bg-slate-800 p-2 rounded-lg border border-slate-700">{proUsers}</span>
                                </div>
                            </div>

                            <motion.div variants={itemAnim} className="pt-6 border-t border-slate-700/50">
                                <label className="block text-lg font-bold text-white mb-2">Usuarios Limitados (Limited Users)</label>
                                <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                                    Perfiles comerciales o de bodega corporativa que sólo requieren registrar movimientos de inventario o dar de alta prospectos de ventas. Esta licencia tiene un costo significativamente menor.
                                </p>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="0" max="200" value={limitedUsers} onChange={e => setLimitedUsers(parseInt(e.target.value))} className="flex-1 accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                    <span className="w-16 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 bg-slate-800 p-2 rounded-lg border border-slate-700">{limitedUsers}</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div variants={container} initial="hidden" animate="show" exit="exit" className="space-y-6">
                        <motion.div variants={itemAnim} className="mb-8">
                            <h2 className="text-3xl font-black mb-3 text-white tracking-tight">Estructura Multi-Sociedades</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                SAP puede manejar fácilmente grupos de corporativos. Cuando se tiene más de una razón social (entidad legal) es vital configurar esquemas de contabilidad en paralelo y motores de consolidación inter-compañía para que los reportes fiscales crucen perfectamente.
                            </p>
                        </motion.div>

                        <motion.div variants={itemAnim} className="space-y-8 bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                            <div>
                                <label className="block font-medium text-white mb-1">Número de Razones Sociales</label>
                                <p className="text-xs text-slate-500 mb-4">¿Cuántas identidades legales distintas operarán dentro del sistema?</p>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="1" max="10" value={legalEntities} onChange={e => setLegalEntities(parseInt(e.target.value))} className="flex-1 accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                    <span className="w-16 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 bg-slate-800 p-2 rounded-lg border border-slate-700">{legalEntities}</span>
                                </div>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {isSubmitting && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col items-center justify-center pt-8 pb-4 space-y-4 overflow-hidden">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin relative z-10" />
                                    </div>
                                    <p className="text-slate-300 font-medium text-lg">Procesando reglas de negocio e integrando con el Core de SAP...</p>
                                    <p className="text-slate-500 text-sm">Validando la estructura corporativa de {lead.company} y generando la propuesta formal.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );

            case 4:
                if (!quote) return null;

                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="py-12 px-6 sm:px-12 text-center">
                        <div className="relative inline-flex items-center justify-center mb-8">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                            <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
                        </div>

                        <h2 className="text-4xl font-black mb-4 text-white tracking-tight">¡Propuesta Generada Correctamente!</h2>

                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mb-8 max-w-lg mx-auto">
                            <p className="text-slate-300 text-lg mb-2">
                                Hemos preparado el documento financiero <strong>#{proposalId}</strong>.
                            </p>
                            <p className="text-slate-400">
                                En unos minutos recibirás un correo de nuestra SDR Leader, <strong>Cecilia Rodríguez (cecilia.rodriguez@xamai.com.mx)</strong>, con el enlace seguro para consultar tu cotización. Se ha enviado a:
                            </p>
                            <p className="font-bold text-purple-400 text-xl mt-4 break-words">
                                {lead.email}
                            </p>
                        </div>

                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Por favor revisa tu bandeja de entrada (y tu carpeta de spam, por si acaso). Si tienes dudas, puedes responder directamente a ese correo.
                        </p>
                    </motion.div>
                );
        }
    };

    const isNextDisabled = () => {
        if (step === 0) return !lead.firstName || !lead.lastName || !lead.email;
        if (step === 1) return !lead.company || !lead.city;
        if (isSubmitting) return true;
        return false;
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {step < 4 && (
                <div className="mb-8">
                    <div className="flex justify-between mb-2 text-sm font-medium text-slate-400 uppercase tracking-wider">
                        <span>Paso {step + 1} de 4</span>
                        <span>{Math.round(((step + 1) / 4) * 100)}% Completado</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
                    </div>
                </div>
            )}

            <div className="glass-panel border-t border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                    {renderStep()}
                </AnimatePresence>

                {step < 4 && (
                    <div className="flex justify-between mt-10 pt-6 border-t border-slate-800/80">
                        <button
                            onClick={() => setStep(s => Math.max(0, s - 1))}
                            disabled={step === 0 || isSubmitting}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${step === 0 || isSubmitting ? 'text-slate-600 cursor-not-allowed hidden' : 'text-slate-300 hover:bg-slate-800'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" /> Volver
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled()}
                            className={`ml-auto flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all active:scale-95 ${isNextDisabled() ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_4px_15px_rgba(147,51,234,0.3)]'
                                }`}
                        >
                            {step === 3 ? (isSubmitting ? 'Generando...' : 'Crear Propuesta Oficial') : 'Continuar'} {!isSubmitting && <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
