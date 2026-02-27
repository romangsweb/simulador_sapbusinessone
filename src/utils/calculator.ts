import { sapPricing, type SAPSolution, type Industry } from '../data/pricingRules';

export interface QuoteInput {
    solution: SAPSolution;
    industry: Industry;
    proUsers: number;
    limitedUsers: number;
    legalEntities: number;
}

export interface QuoteResult {
    monthlySoftwareCost: number;
    oneTimeImplementationCost: number;
    totalFirstYearCost: number;
    currency: string;
}

export function calculateQuote(input: QuoteInput): QuoteResult {
    const rules = sapPricing[input.solution];
    let monthlySoftwareCost = 0;

    if (input.solution === 'business-one') {
        monthlySoftwareCost = (input.proUsers * rules.proLicenseCost) + (input.limitedUsers * (rules.limitedLicenseCost || 0));
    } else if (input.solution === 'bydesign') {
        // Base fee covers some users, simplistically adding core users on top
        monthlySoftwareCost = (rules.baseFee || 0) + (Math.max(0, input.proUsers - 5) * rules.proLicenseCost);
    } else if (input.solution === 's4-hana') {
        const effectiveUsers = Math.max(rules.minimumUsers || 0, input.proUsers);
        monthlySoftwareCost = effectiveUsers * rules.proLicenseCost;
    }

    let baseImplementationCost = rules.implementationCosts[input.industry] || rules.implementationCosts['comercializadora'];

    // Custom logic: Additional legal entities typically increase implementation by ~15% per entity
    const extraEntitiesMultiplier = 1 + (Math.max(0, input.legalEntities - 1) * 0.15);
    let oneTimeImplementationCost = baseImplementationCost * extraEntitiesMultiplier;

    // Total First Year (12 months of software + implementation)
    const totalFirstYearCost = (monthlySoftwareCost * 12) + oneTimeImplementationCost;

    return {
        monthlySoftwareCost,
        oneTimeImplementationCost,
        totalFirstYearCost,
        currency: 'USD'
    };
}
