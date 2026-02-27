import React, { forwardRef } from 'react';
import { sapPricing, type SAPSolution, type Industry } from '../data/pricingRules';
import { type QuoteResult } from '../utils/calculator';

export interface LeadData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    city: string;
}

export interface ProposalDocumentProps {
    lead: LeadData;
    quote: QuoteResult;
    solution: SAPSolution;
    industry: Industry;
    proUsers: number;
    limitedUsers: number;
    legalEntities: number;
    proposalId: string;
    today: string;
}

export const ProposalDocument = forwardRef<HTMLDivElement, ProposalDocumentProps>(({
    lead, quote, solution, industry, proUsers, limitedUsers, legalEntities, proposalId, today
}, ref) => {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const totalUsers = proUsers + limitedUsers;
    const solutionDisplayNames = {
        'business-one': 'SAP Business One',
        'bydesign': 'SAP ByDesign',
        's4-hana': 'SAP S/4HANA'
    };
    const indName = industry.charAt(0).toUpperCase() + industry.slice(1);

    return (
        <div ref={ref} className="bg-white text-slate-900 p-8 sm:p-12 rounded-lg shadow-sm w-full mx-auto relative overflow-hidden" style={{ minHeight: '800px' }}>
            {/* Subtle watermark or header accent like the PDF */}
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-purple-500 to-indigo-600"></div>

            {/* Header Box Formato PDF */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10 pb-6 border-b border-slate-200 text-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter text-purple-600 mb-3">XAMAI</h1>
                    <p className="text-slate-600 font-medium">Propuesta No. {proposalId} - Versión No. 1</p>
                    <p className="text-slate-500">Fecha de creación: {today}</p>
                    <p className="text-slate-500">Estado: <span className="font-semibold text-green-600">Ready</span></p>
                </div>

                <div className="text-right space-y-1 text-slate-500 text-xs sm:text-sidebar">
                    <p>Miguel Laurent 804, Letrán Valle,</p>
                    <p>Benito Juárez, 03650</p>
                    <p>Ciudad de México, CDMX</p>
                    <p>Tel: (55)12512708</p>
                </div>
            </div>

            {/* Lead Addresses */}
            <div className="mb-10 text-sm">
                <p className="font-semibold text-slate-900 mb-1">Atención:</p>
                <p className="text-lg text-purple-700 font-bold">{lead.firstName} {lead.lastName}</p>
                <p className="text-slate-600 font-medium uppercase tracking-wide">{lead.company}</p>
                <p className="text-slate-500">{lead.city}</p>

                <div className="mt-6 p-4 bg-blue-50 rounded border-l-4 border-blue-600">
                    <p className="font-bold text-slate-800 text-base mb-1">Cotización {solutionDisplayNames[solution]} - {indName}</p>
                    <p className="text-slate-600 font-medium">- {totalUsers} Usuarios ({proUsers} Prof{solution === 'business-one' ? ` y ${limitedUsers} Lim` : ''})</p>
                    {legalEntities > 1 && <p className="text-slate-600 font-medium mt-1">- {legalEntities} Razones Sociales</p>}
                </div>
            </div>

            {/* Presentation Letter */}
            <div className="prose prose-sm text-slate-700 mb-12 max-w-none">
                <p>Hola <strong>{lead.firstName}</strong>,</p>
                <p>Mi nombre es <strong>Cecilia Rodríguez</strong>, SDR Leader de Xamai. Es un gusto de mi parte presentarte este documento técnico-financiero sobre la inversión aproximada para la viabilidad de tu proyecto de Transformación Digital Integral con {solutionDisplayNames[solution]}.</p>
                <p>Quedo a tu total disposición para cualquier duda sobre los módulos requeridos inicialmente o para avanzar al levantamiento consultivo profundo. Puedes contactarme directamente a <a href="mailto:cecilia.rodriguez@xamai.com.mx" className="text-purple-600 font-medium">cecilia.rodriguez@xamai.com.mx</a> o conversar con el equipo de soporte. A continuación, el desglose ejecutivo de la arquitectura en la nube.</p>
            </div>

            {/* Badges / Value Prop Section mimicking the PDF */}
            <div className="flex flex-wrap items-center justify-between bg-slate-50 p-6 rounded-lg border border-slate-100 mb-12 gap-4">
                <div className="text-center w-full sm:w-auto">
                    <p className="text-sm font-bold text-slate-800">Mejor Partner de SAP</p>
                    <p className="text-xs text-purple-600 font-black tracking-widest uppercase mt-1">Más de 25 Años</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-300"></div>
                <div className="text-center w-full sm:w-auto">
                    <p className="text-sm font-bold text-slate-800">ROI Acelerado</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Metodología Ágil</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-300"></div>
                <div className="text-center w-full sm:w-auto">
                    <p className="text-sm font-bold text-slate-800">+500 Compañías</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Nube Implementada</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-300"></div>
                <div className="text-center w-full sm:w-auto">
                    <p className="text-sm font-bold text-slate-800">Soporte Local</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">24/7 en Español</p>
                </div>
            </div>

            {/* Explicit Pricing Tables */}
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-200 pb-2 mb-4">Costo Mensual</h3>
                <table className="w-full text-sm text-left border-collapse border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="p-3 border border-slate-200 font-semibold w-2/3">Concepto</th>
                            <th className="p-3 text-right border border-slate-200 font-semibold">Inversión (USD)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {solution === 'bydesign' && (
                            <tr className="bg-white">
                                <td className="p-3 border border-slate-200 font-medium text-slate-800">{solutionDisplayNames[solution]} - Base Fee (Incluye 5 Usuarios)</td>
                                <td className="p-3 text-right border border-slate-200 font-bold text-purple-700">{formatCurrency(quote.monthlySoftwareCost - (Math.max(0, proUsers - 5) * 120))}</td>
                            </tr>
                        )}
                        <tr className="bg-white">
                            <td className="p-3 border border-slate-200 font-medium text-slate-800">{solutionDisplayNames[solution]} - Licencia Mensual Profesional ({proUsers} {solution === 'bydesign' && proUsers > 5 ? 'usuarios extras' : ''})</td>
                            <td className="p-3 text-right border border-slate-200 font-bold text-purple-700">{formatCurrency(solution === 'bydesign' ? Math.max(0, proUsers - 5) * 120 : (solution === 's4-hana' ? quote.monthlySoftwareCost : proUsers * sapPricing[solution].proLicenseCost))}</td>
                        </tr>
                        {solution === 'business-one' && limitedUsers > 0 && (
                            <tr className="bg-white">
                                <td className="p-3 border border-slate-200 font-medium text-slate-800">{solutionDisplayNames[solution]} - Licencia Mensual Limitada ({limitedUsers})</td>
                                <td className="p-3 text-right border border-slate-200 font-bold text-purple-700">{formatCurrency(limitedUsers * (sapPricing['business-one'].limitedLicenseCost || 0))}</td>
                            </tr>
                        )}
                        <tr className="bg-slate-50 font-bold">
                            <td className="p-3 text-right border border-slate-200 text-slate-600">Total Mensual Software</td>
                            <td className="p-3 text-right border border-slate-200 text-purple-600 text-base">{formatCurrency(quote.monthlySoftwareCost)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mb-12">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-200 pb-2 mb-4">Costo Único</h3>
                <table className="w-full text-sm text-left border-collapse border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="p-3 border border-slate-200 font-semibold w-2/3">Concepto</th>
                            <th className="p-3 text-right border border-slate-200 font-semibold">Inversión (USD)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        <tr className="bg-white">
                            <td className="p-3 border border-slate-200 font-medium text-slate-800">Servicios Profesionales de Implementación - {indName} {legalEntities > 1 ? `(${legalEntities} Sociedades)` : ''}</td>
                            <td className="p-3 text-right border border-slate-200 font-bold text-purple-700">{formatCurrency(quote.oneTimeImplementationCost)}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                            <td className="p-3 text-right border border-slate-200 text-slate-600">Total Puesta en Marcha</td>
                            <td className="p-3 text-right border border-slate-200 text-purple-600 text-base">{formatCurrency(quote.oneTimeImplementationCost)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Total Summary Footer */}
            <div className="bg-purple-600 text-white p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between">
                <div>
                    <p className="font-bold text-lg mb-1">Cotización Aproximada - 1er Año</p>
                    <p className="text-purple-200 text-xs uppercase tracking-wide">Incluye 12 Meses de Suscripción + Implementación</p>
                </div>
                <div className="text-3xl font-black mt-4 sm:mt-0 tracking-tight">
                    {formatCurrency(quote.totalFirstYearCost)}
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
                Documento confidencial generado automáticamente en plataforma Xamai. Los precios son aproximados y requieren validación formal técnica.
            </div>

        </div>
    );
});

ProposalDocument.displayName = 'ProposalDocument';
