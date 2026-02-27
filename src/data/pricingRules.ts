export type SAPSolution = 'business-one' | 'bydesign' | 's4-hana';
export type Industry = 'comercializadora' | 'manufactura' | 'servicios' | 'proyectos' | 'retail' | 'salud' | 'logistica' | 'tecnologia' | 'alimentos' | 'otra';

export interface PricingRule {
    minimumUsers?: number;
    baseFee?: number;
    proLicenseCost: number; // For B1 (Professional) or ByD (Core/Adv mapping) or S/4HANA (FUE)
    limitedLicenseCost?: number; // For B1 (Limited)
    implementationCosts: Record<Industry, number>;
}

export const sapPricing: Record<SAPSolution, PricingRule> = {
    'business-one': {
        proLicenseCost: 139,
        limitedLicenseCost: 94,
        implementationCosts: {
            'comercializadora': 20000,
            'manufactura': 30000,
            'servicios': 18000,
            'proyectos': 25000,
            'retail': 22000,
            'logistica': 26000,
            'salud': 35000,
            'tecnologia': 20000,
            'alimentos': 32000,
            'otra': 25000
        }
    },
    'bydesign': {
        baseFee: 1818, // Includes 5 licenses (2 Adv - 3 Core)
        proLicenseCost: 120, // Core license
        implementationCosts: {
            'comercializadora': 35000,
            'manufactura': 40000,
            'servicios': 50000,
            'proyectos': 37000,
            'retail': 40000,
            'logistica': 45000,
            'salud': 55000,
            'tecnologia': 38000,
            'alimentos': 48000,
            'otra': 40000
        }
    },
    's4-hana': {
        minimumUsers: 40,
        proLicenseCost: 3144, // FUE Users
        implementationCosts: {
            'comercializadora': 430000,
            'manufactura': 650000,
            'servicios': 430000,
            'proyectos': 430000, // Fallback if not specified
            'retail': 500000,
            'logistica': 520000,
            'salud': 600000,
            'tecnologia': 450000,
            'alimentos': 580000,
            'otra': 500000
        }
    }
};
