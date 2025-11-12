// Constants
const SUPABASE_PRO_BASE = 120;
const STORAGE_INCLUDED = 100;
const STORAGE_COST_PER_GB = 0.021;
const EGRESS_INCLUDED = 250;
const EGRESS_COST_PER_GB = 0.09;

const VERCEL_PRO_PER_SEAT = 20;
const VERCEL_BANDWIDTH_INCLUDED = 1000; // 1TB = 1000GB
const VERCEL_BANDWIDTH_COST = 0.15;

// Get all input elements
const inputs = {
    customers: document.getElementById('customers'),
    locationsPerCustomer: document.getElementById('locationsPerCustomer'),
    imagesPerLocation: document.getElementById('imagesPerLocation'),
    avgImageSize: document.getElementById('avgImageSize'),
    monthlyViewsPerImage: document.getElementById('monthlyViewsPerImage'),
    pricePerCustomer: document.getElementById('pricePerCustomer'),
    setupFee: document.getElementById('setupFee'),
    monthlyChurn: document.getElementById('monthlyChurn'),
    monthlyGrowth: document.getElementById('monthlyGrowth'),
    useVercel: document.getElementById('useVercel'),
    vercelTeamMembers: document.getElementById('vercelTeamMembers'),
    vercelBandwidthMultiplier: document.getElementById('vercelBandwidthMultiplier'),
    employeeSalaries: document.getElementById('employeeSalaries'),
    marketingSpend: document.getElementById('marketingSpend'),
    otherMonthlyCosts: document.getElementById('otherMonthlyCosts')
};

// Helper function to safely set HTML content (prevents XSS)
function safeSetContent(elementId, htmlContent) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Clear existing content
    element.textContent = '';

    // Parse HTML string and create DOM elements
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Move children to target element
    while (temp.firstChild) {
        element.appendChild(temp.firstChild);
    }
}

// Add event listeners
Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
});

function switchTab(event, tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    // Recalculate to update all tabs
    calculate();
}

function getInputs() {
    return {
        customers: parseFloat(inputs.customers.value) || 0,
        locationsPerCustomer: parseFloat(inputs.locationsPerCustomer.value) || 0,
        imagesPerLocation: parseFloat(inputs.imagesPerLocation.value) || 0,
        avgImageSize: parseFloat(inputs.avgImageSize.value) || 0,
        monthlyViewsPerImage: parseFloat(inputs.monthlyViewsPerImage.value) || 0,
        pricePerCustomer: parseFloat(inputs.pricePerCustomer.value) || 0,
        setupFee: parseFloat(inputs.setupFee.value) || 0,
        monthlyChurn: parseFloat(inputs.monthlyChurn.value) || 0,
        monthlyGrowth: parseFloat(inputs.monthlyGrowth.value) || 0,
        useVercel: inputs.useVercel.checked,
        vercelTeamMembers: parseFloat(inputs.vercelTeamMembers.value) || 1,
        vercelBandwidthMultiplier: parseFloat(inputs.vercelBandwidthMultiplier.value) || 0,
        employeeSalaries: parseFloat(inputs.employeeSalaries.value) || 0,
        marketingSpend: parseFloat(inputs.marketingSpend.value) || 0,
        otherMonthlyCosts: parseFloat(inputs.otherMonthlyCosts.value) || 0
    };
}

function calculateAllMetrics(currentInputs) {
    const {
        customers, locationsPerCustomer, imagesPerLocation, avgImageSize, monthlyViewsPerImage,
        pricePerCustomer, setupFee, monthlyChurn, monthlyGrowth, useVercel, vercelTeamMembers,
        vercelBandwidthMultiplier, employeeSalaries, marketingSpend, otherMonthlyCosts
    } = currentInputs;

    // Calculate storage and bandwidth
    const totalLocations = customers * locationsPerCustomer;
    const totalImages = totalLocations * imagesPerLocation;
    const totalStorageGB = (totalImages * avgImageSize) / 1024;
    const totalImageBandwidthGB = (totalImages * monthlyViewsPerImage * avgImageSize) / 1024;
    const frontendBandwidthGB = totalImageBandwidthGB * vercelBandwidthMultiplier;

    // Supabase costs
    const storageOverageGB = Math.max(0, totalStorageGB - STORAGE_INCLUDED);
    const storageCost = storageOverageGB * STORAGE_COST_PER_GB;
    const egressOverageGB = Math.max(0, totalImageBandwidthGB - EGRESS_INCLUDED);
    const egressCost = egressOverageGB * EGRESS_COST_PER_GB;
    const supabaseTotalCost = SUPABASE_PRO_BASE + storageCost + egressCost;

    // Vercel costs
    const vercelBaseCost = useVercel ? (vercelTeamMembers * VERCEL_PRO_PER_SEAT) : 0;
    const vercelBandwidthOverageGB = useVercel ? Math.max(0, frontendBandwidthGB - VERCEL_BANDWIDTH_INCLUDED) : 0;
    const vercelBandwidthCost = vercelBandwidthOverageGB * VERCEL_BANDWIDTH_COST;
    const vercelTotalCost = vercelBaseCost + vercelBandwidthCost;

    // Total costs
    const otherTotalCosts = employeeSalaries + marketingSpend + otherMonthlyCosts;
    const totalCosts = supabaseTotalCost + vercelTotalCost + otherTotalCosts;
    const fixedCosts = SUPABASE_PRO_BASE + vercelBaseCost + employeeSalaries + otherMonthlyCosts;
    const variableCosts = storageCost + egressCost + vercelBandwidthCost + marketingSpend;

    // Revenue calculations
    const monthlyRevenue = customers * pricePerCustomer;
    const netProfit = monthlyRevenue - totalCosts;
    const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue * 100) : 0;

    // Unit economics
    const costPerCustomer = customers > 0 ? totalCosts / customers : 0;
    const profitPerCustomer = customers > 0 ? netProfit / customers : 0;
    const unitEconomicsRatio = costPerCustomer > 0 ? pricePerCustomer / costPerCustomer : 0;

    // Customer lifetime calculations
    const avgCustomerLifetimeMonths = monthlyChurn > 0 ? 1 / (monthlyChurn / 100) : Infinity;
    const ltv = pricePerCustomer * avgCustomerLifetimeMonths;
    const newCustomers = customers * (monthlyGrowth / 100);
    const cac = newCustomers > 0 ? marketingSpend / newCustomers : (marketingSpend > 0 ? Infinity : 0);
    const ltvCacRatio = cac > 0 && isFinite(cac) ? ltv / cac : NaN;
    const cacPayback = profitPerCustomer > 0 && cac > 0 && isFinite(cac) ? cac / profitPerCustomer : NaN;

    // Infrastructure costs
    const infrastructureCosts = supabaseTotalCost + vercelTotalCost;
    const grossMargin = monthlyRevenue > 0 ? ((monthlyRevenue - infrastructureCosts) / monthlyRevenue * 100) : 0;

    // Break-even analysis
    const breakEvenCustomers = pricePerCustomer > 0 ? Math.ceil(totalCosts / pricePerCustomer) : 0;
    const breakEvenMRR = totalCosts;
    const monthsToBreakEven = monthlyGrowth > 0 && customers < breakEvenCustomers ?
        Math.log(breakEvenCustomers / customers) / Math.log(1 + monthlyGrowth / 100) : 0;

    return {
        ...currentInputs,
        totalLocations, totalImages, totalStorageGB, totalImageBandwidthGB, frontendBandwidthGB,
        storageOverageGB, storageCost, egressOverageGB, egressCost, supabaseTotalCost,
        vercelBaseCost, vercelBandwidthOverageGB, vercelBandwidthCost, vercelTotalCost,
        otherTotalCosts, totalCosts, fixedCosts, variableCosts,
        monthlyRevenue, netProfit, profitMargin,
        costPerCustomer, profitPerCustomer, unitEconomicsRatio,
        avgCustomerLifetimeMonths, ltv, newCustomers, cac, ltvCacRatio, cacPayback,
        infrastructureCosts, grossMargin,
        breakEvenCustomers, breakEvenMRR, monthsToBreakEven
    };
}

function calculate() {
    const currentInputs = getInputs();
    const metrics = calculateAllMetrics(currentInputs);

    updateCalculatorTab(metrics);
    updateAnalysisTab(metrics);
    calculateScenarios(metrics);
    updateRecommendations(metrics);
}

function updateCalculatorTab(metrics) {
    const {
        customers, locationsPerCustomer, imagesPerLocation, avgImageSize, monthlyViewsPerImage,
        pricePerCustomer, useVercel, vercelTeamMembers, vercelBandwidthMultiplier,
        employeeSalaries, marketingSpend, otherMonthlyCosts,
        totalImages, totalStorageGB, totalImageBandwidthGB, frontendBandwidthGB,
        storageOverageGB, storageCost, egressOverageGB, egressCost, supabaseTotalCost,
        vercelBaseCost, vercelBandwidthOverageGB, vercelBandwidthCost, vercelTotalCost,
        otherTotalCosts, totalCosts,
        monthlyRevenue, netProfit, profitMargin,
        costPerCustomer, profitPerCustomer, unitEconomicsRatio
    } = metrics;

    // Storage & Bandwidth
    document.getElementById('totalStorage').textContent = totalStorageGB.toFixed(2) + ' GB';
    document.getElementById('totalImages').textContent = totalImages.toLocaleString() + ' images total';
    document.getElementById('totalEgress').textContent = totalImageBandwidthGB.toFixed(2) + ' GB';
    document.getElementById('egressInfo').textContent = (totalImages * monthlyViewsPerImage).toLocaleString() + ' views/month';
    document.getElementById('vercelBandwidth').textContent = frontendBandwidthGB.toFixed(2) + ' GB';

    // Supabase costs
    document.getElementById('baseCost').textContent = SUPABASE_PRO_BASE.toFixed(2);
    document.getElementById('storageOverage').textContent = storageOverageGB.toFixed(2);
    document.getElementById('storageCost').textContent = storageCost.toFixed(2);
    document.getElementById('egressOverage').textContent = egressOverageGB.toFixed(2);
    document.getElementById('egressCost').textContent = egressCost.toFixed(2);
    document.getElementById('supabaseTotalCost').textContent = supabaseTotalCost.toFixed(2);

    // Vercel costs
    document.getElementById('vercelSeats').textContent = vercelTeamMembers;
    document.getElementById('vercelBaseCost').textContent = vercelBaseCost.toFixed(2);
    document.getElementById('vercelBandwidthOverage').textContent = vercelBandwidthOverageGB.toFixed(2);
    document.getElementById('vercelBandwidthCost').textContent = vercelBandwidthCost.toFixed(2);
    document.getElementById('vercelTotalCost').textContent = vercelTotalCost.toFixed(2);

    // Other costs
    document.getElementById('salariesDisplay').textContent = employeeSalaries.toFixed(2);
    document.getElementById('marketingDisplay').textContent = marketingSpend.toFixed(2);
    document.getElementById('otherCosts').textContent = otherMonthlyCosts.toFixed(2);
    document.getElementById('otherTotalCost').textContent = otherTotalCosts.toFixed(2);
    document.getElementById('totalCosts').textContent = totalCosts.toFixed(2);

    // Revenue
    document.getElementById('monthlyRevenue').textContent = monthlyRevenue.toFixed(0);
    document.getElementById('customerCount').textContent = customers;
    document.getElementById('priceDisplay').textContent = pricePerCustomer.toFixed(0);

    const netProfitElement = document.getElementById('netProfit');
    netProfitElement.textContent = '$' + netProfit.toFixed(0);
    netProfitElement.style.color = netProfit >= 0 ? '#28a745' : '#dc3545';

    document.getElementById('profitMargin').textContent = profitMargin.toFixed(1) + '%';
    document.getElementById('profitMargin').style.color = profitMargin >= 20 ? '#28a745' : profitMargin >= 0 ? '#ffc107' : '#dc3545';

    // Unit economics
    document.getElementById('revenuePerCustomer').textContent = pricePerCustomer.toFixed(2);
    document.getElementById('costPerCustomer').textContent = costPerCustomer.toFixed(2);
    document.getElementById('profitPerCustomer').textContent = profitPerCustomer.toFixed(2);
    document.getElementById('profitPerCustomerValue').style.color = profitPerCustomer >= 0 ? '#28a745' : '#dc3545';
    document.getElementById('unitEconomics').textContent = unitEconomicsRatio.toFixed(2) + 'x';

    // Margin indicator
    const marginIndicator = document.getElementById('marginIndicator');
    if (profitMargin >= 50) {
        marginIndicator.className = 'margin-indicator margin-good';
        marginIndicator.textContent = '🎯 Excellent margin! Very healthy SaaS business.';
    } else if (profitMargin >= 20) {
        marginIndicator.className = 'margin-indicator margin-ok';
        marginIndicator.textContent = '✓ Good margin. Room for optimization and growth.';
    } else if (profitMargin >= 0) {
        marginIndicator.className = 'margin-indicator margin-ok';
        marginIndicator.textContent = '⚠ Low margin. Consider cost optimization or pricing increase.';
    } else {
        marginIndicator.className = 'margin-indicator margin-bad';
        marginIndicator.textContent = '⚠ Operating at a loss! Critical: increase pricing or reduce costs.';
    }
}

function updateAnalysisTab(metrics) {
    const {
        customers, locationsPerCustomer, imagesPerLocation, avgImageSize, monthlyViewsPerImage,
        pricePerCustomer, monthlyChurn, monthlyGrowth, useVercel, vercelTeamMembers,
        vercelBandwidthMultiplier, employeeSalaries, marketingSpend, otherMonthlyCosts,
        totalStorageGB, totalImageBandwidthGB, frontendBandwidthGB,
        storageCost, egressCost, vercelBandwidthCost, supabaseTotalCost, vercelTotalCost,
        totalCosts, fixedCosts, variableCosts,
        monthlyRevenue, netProfit, grossMargin,
        ltv, cacPayback, ltvCacRatio,
        breakEvenCustomers, breakEvenMRR, monthsToBreakEven
    } = metrics;

    // 12-month projection
    let projectedCustomers = customers;
    let totalRevenue = 0;
    let totalProjectedCost = 0;
    let newCustomersTotal = 0;
    let churnedCustomersTotal = 0;

    for (let month = 1; month <= 12; month++) {
        const newCustomers = projectedCustomers * (monthlyGrowth / 100);
        const churnedCustomers = projectedCustomers * (monthlyChurn / 100);
        projectedCustomers = projectedCustomers + newCustomers - churnedCustomers;

        newCustomersTotal += newCustomers;
        churnedCustomersTotal += churnedCustomers;

        const monthRevenue = projectedCustomers * pricePerCustomer;
        const monthStorageGB = (projectedCustomers * locationsPerCustomer * imagesPerLocation * avgImageSize) / 1024;
        const monthBandwidthGB = (projectedCustomers * locationsPerCustomer * imagesPerLocation * monthlyViewsPerImage * avgImageSize) / 1024;

        const monthStorageCost = Math.max(0, monthStorageGB - STORAGE_INCLUDED) * STORAGE_COST_PER_GB;
        const monthBandwidthCost = Math.max(0, monthBandwidthGB - EGRESS_INCLUDED) * EGRESS_COST_PER_GB;
        const monthVercelBandwidthCost = useVercel ? Math.max(0, monthBandwidthGB * vercelBandwidthMultiplier - VERCEL_BANDWIDTH_INCLUDED) * VERCEL_BANDWIDTH_COST : 0;

        const monthCost = SUPABASE_PRO_BASE + monthStorageCost + monthBandwidthCost +
                        (useVercel ? vercelTeamMembers * VERCEL_PRO_PER_SEAT : 0) + monthVercelBandwidthCost +
                        employeeSalaries + marketingSpend + otherMonthlyCosts;

        totalRevenue += monthRevenue;
        totalProjectedCost += monthCost;
    }

    // Update KPIs
    document.getElementById('arr').textContent = (monthlyRevenue * 12).toFixed(0);
    document.getElementById('ltv').textContent = ltv.toFixed(0);
    document.getElementById('cacPayback').textContent = !isNaN(cacPayback) ? cacPayback.toFixed(1) + ' mo' : 'N/A';
    document.getElementById('ltvCacRatio').textContent = !isNaN(ltvCacRatio) ? ltvCacRatio.toFixed(1) + ':1' : 'N/A';
    document.getElementById('grossMargin').textContent = grossMargin.toFixed(1) + '%';
    document.getElementById('burnRate').textContent = netProfit < 0 ? '$' + Math.abs(netProfit).toFixed(0) : '$0';

    // 12-month projection
    document.getElementById('projStartCustomers').textContent = customers.toFixed(0);
    document.getElementById('projEndCustomers').textContent = projectedCustomers.toFixed(0);
    document.getElementById('projNewCustomers').textContent = newCustomersTotal.toFixed(0);
    document.getElementById('projChurnedCustomers').textContent = churnedCustomersTotal.toFixed(0);
    document.getElementById('projRevenue').textContent = totalRevenue.toFixed(0);
    document.getElementById('projCosts').textContent = totalProjectedCost.toFixed(0);
    const projProfit = totalRevenue - totalProjectedCost;
    const projProfitElement = document.getElementById('projProfit');
    projProfitElement.textContent = '$' + projProfit.toFixed(0);
    projProfitElement.style.color = projProfit >= 0 ? '#28a745' : '#dc3545';

    // Cost structure
    document.getElementById('fixedCosts').textContent = fixedCosts.toFixed(0);
    document.getElementById('variableCosts').textContent = variableCosts.toFixed(0);
    document.getElementById('variableCostRatio').textContent = totalCosts > 0 ? (variableCosts / totalCosts * 100).toFixed(1) + '%' : '0%';

    // Infrastructure efficiency
    const avgCostPerGBStorage = totalStorageGB > STORAGE_INCLUDED ?
        (SUPABASE_PRO_BASE * (totalStorageGB / (totalStorageGB + totalImageBandwidthGB)) + storageCost) / totalStorageGB :
        SUPABASE_PRO_BASE / STORAGE_INCLUDED;
    const avgCostPerGBBandwidth = totalImageBandwidthGB > 0 ?
        (egressCost + vercelBandwidthCost) / (totalImageBandwidthGB + frontendBandwidthGB) : 0;

    document.getElementById('costPerGBStorage').textContent = avgCostPerGBStorage.toFixed(3);
    document.getElementById('costPerGBBandwidth').textContent = avgCostPerGBBandwidth.toFixed(3);
    document.getElementById('storageUtilization').textContent = (Math.min(totalStorageGB / STORAGE_INCLUDED * 100, 100)).toFixed(1) + '%';
    document.getElementById('bandwidthUtilization').textContent = (Math.min(totalImageBandwidthGB / EGRESS_INCLUDED * 100, 100)).toFixed(1) + '%';

    // Break-even
    const breakEvenStatus = customers >= breakEvenCustomers ? 'Profitable ✓' : 'Below break-even';
    document.getElementById('breakEvenStatus').textContent = breakEvenStatus;
    document.getElementById('breakEvenStatus').style.color = customers >= breakEvenCustomers ? '#28a745' : '#dc3545';
    document.getElementById('breakEvenCustomers').textContent = breakEvenCustomers;
    document.getElementById('breakEvenMRR').textContent = breakEvenMRR.toFixed(0);
    document.getElementById('monthsToBreakEven').textContent =
        customers >= breakEvenCustomers ? 'Already profitable' :
        monthsToBreakEven > 0 && monthsToBreakEven < 999 ? monthsToBreakEven.toFixed(1) : 'N/A';

    // Scaling alert
    const scalingAlert = document.getElementById('scalingAlert');
    if (totalStorageGB > STORAGE_INCLUDED * 0.8) {
        scalingAlert.className = 'alert-box alert-warning';
        scalingAlert.textContent = 'Storage Alert: Approaching or exceeding included storage quota. Usage-based costs increasing.';
    } else if (totalImageBandwidthGB > EGRESS_INCLUDED * 0.8) {
        scalingAlert.className = 'alert-box alert-warning';
        scalingAlert.textContent = 'Bandwidth Alert: Approaching or exceeding included bandwidth quota. Usage-based costs increasing.';
    } else if (grossMargin < 50) {
        scalingAlert.className = 'alert-box alert-info';
        scalingAlert.textContent = 'Low gross margin detected. Consider pricing optimization for better unit economics.';
    } else {
        scalingAlert.className = 'alert-box alert-info';
        scalingAlert.textContent = 'Infrastructure costs are within normal ranges. Continue monitoring as you scale.';
    }
}

function calculateScenarios(metrics) {
    const {
        customers, locationsPerCustomer, imagesPerLocation, avgImageSize, monthlyViewsPerImage,
        pricePerCustomer, monthlyChurn, monthlyGrowth, useVercel, vercelTeamMembers,
        vercelBandwidthMultiplier, employeeSalaries, marketingSpend, otherMonthlyCosts
    } = metrics;

    // Growth scenarios (5%, 10%, 20% monthly growth)
    const scenarios = [
        { growth: monthlyGrowth * 0.5, name: '1' },
        { growth: monthlyGrowth, name: '2' },
        { growth: monthlyGrowth * 2, name: '3' }
    ];

    scenarios.forEach(scenario => {
        let projCustomers = customers;
        for (let month = 1; month <= 12; month++) {
            projCustomers = projCustomers * (1 + scenario.growth / 100) * (1 - monthlyChurn / 100);
        }

        const revenue = projCustomers * pricePerCustomer;
        const storageGB = (projCustomers * locationsPerCustomer * imagesPerLocation * avgImageSize) / 1024;
        const bandwidthGB = (projCustomers * locationsPerCustomer * imagesPerLocation * monthlyViewsPerImage * avgImageSize) / 1024;

        const storageCost = Math.max(0, storageGB - STORAGE_INCLUDED) * STORAGE_COST_PER_GB;
        const bandwidthCost = Math.max(0, bandwidthGB - EGRESS_INCLUDED) * EGRESS_COST_PER_GB;
        const vercelBWCost = useVercel ? Math.max(0, bandwidthGB * vercelBandwidthMultiplier - VERCEL_BANDWIDTH_INCLUDED) * VERCEL_BANDWIDTH_COST : 0;

        const costs = SUPABASE_PRO_BASE + storageCost + bandwidthCost +
                    (useVercel ? vercelTeamMembers * VERCEL_PRO_PER_SEAT : 0) + vercelBWCost +
                    employeeSalaries + marketingSpend + otherMonthlyCosts;

        const profit = revenue - costs;
        const margin = revenue > 0 ? (profit / revenue * 100) : 0;

        document.getElementById(`scenario${scenario.name}Customers`).textContent = Math.round(projCustomers);
        document.getElementById(`scenario${scenario.name}Revenue`).textContent = revenue.toFixed(0);
        document.getElementById(`scenario${scenario.name}Costs`).textContent = costs.toFixed(0);
        document.getElementById(`scenario${scenario.name}Profit`).textContent = '$' + profit.toFixed(0);
        document.getElementById(`scenario${scenario.name}Profit`).style.color = profit >= 0 ? '#28a745' : '#dc3545';
        document.getElementById(`scenario${scenario.name}Margin`).textContent = margin.toFixed(1) + '%';
    });

    // Pricing scenarios
    const pricingScenarios = [
        { price: 29, name: '1' },
        { price: pricePerCustomer, name: '2' },
        { price: 99, name: '3' }
    ];

    pricingScenarios.forEach(scenario => {
        const revenue = customers * scenario.price;
        const totalImages = customers * locationsPerCustomer * imagesPerLocation;
        const storageGB = (totalImages * avgImageSize) / 1024;
        const bandwidthGB = (totalImages * monthlyViewsPerImage * avgImageSize) / 1024;

        const storageCost = Math.max(0, storageGB - STORAGE_INCLUDED) * STORAGE_COST_PER_GB;
        const bandwidthCost = Math.max(0, bandwidthGB - EGRESS_INCLUDED) * EGRESS_COST_PER_GB;
        const vercelBWCost = useVercel ? Math.max(0, bandwidthGB * vercelBandwidthMultiplier - VERCEL_BANDWIDTH_INCLUDED) * VERCEL_BANDWIDTH_COST : 0;

        const costs = SUPABASE_PRO_BASE + storageCost + bandwidthCost +
                    (useVercel ? vercelTeamMembers * VERCEL_PRO_PER_SEAT : 0) + vercelBWCost +
                    employeeSalaries + marketingSpend + otherMonthlyCosts;

        const profit = revenue - costs;
        const margin = revenue > 0 ? (profit / revenue * 100) : 0;
        const breakEven = scenario.price > 0 ? Math.ceil(costs / scenario.price) : 0;

        document.getElementById(`pricing${scenario.name}Revenue`).textContent = revenue.toFixed(0);
        document.getElementById(`pricing${scenario.name}Profit`).textContent = '$' + profit.toFixed(0);
        document.getElementById(`pricing${scenario.name}Profit`).style.color = profit >= 0 ? '#28a745' : '#dc3545';
        document.getElementById(`pricing${scenario.name}Margin`).textContent = margin.toFixed(1) + '%';
        document.getElementById(`pricing${scenario.name}BreakEven`).textContent = breakEven;
    });
}

function updateRecommendations(metrics) {
    const {
        customers, pricePerCustomer, monthlyChurn, monthlyRevenue,
        totalStorageGB, totalImageBandwidthGB,
        storageCost, bandwidthCost,
        vercelTeamMembers, vercelBandwidthMultiplier,
        totalCosts, netProfit, profitMargin, grossMargin
    } = metrics;
    
    const vercelBWCost = metrics.vercelBandwidthCost;

    // Health metrics
    let healthHTML = '<div class="kpi-grid">';

    const healthMetrics = [
        {
            label: 'Profitability',
            status: profitMargin >= 20 ? 'Healthy' : profitMargin >= 0 ? 'Fair' : 'Poor',
            color: profitMargin >= 20 ? '#28a745' : profitMargin >= 0 ? '#ffc107' : '#dc3545'
        },
        {
            label: 'Gross Margin',
            status: grossMargin >= 70 ? 'Excellent' : grossMargin >= 50 ? 'Good' : 'Needs Improvement',
            color: grossMargin >= 70 ? '#28a745' : grossMargin >= 50 ? '#ffc107' : '#dc3545'
        },
        {
            label: 'Churn Rate',
            status: monthlyChurn <= 3 ? 'Excellent' : monthlyChurn <= 7 ? 'Good' : 'High',
            color: monthlyChurn <= 3 ? '#28a745' : monthlyChurn <= 7 ? '#ffc107' : '#dc3545'
        },
        {
            label: 'Unit Economics',
            status: customers > 0 && pricePerCustomer > (totalCosts / customers) * 1.5 ? 'Strong' : customers > 0 && pricePerCustomer > (totalCosts / customers) ? 'Fair' : 'Weak',
            color: customers > 0 && pricePerCustomer > (totalCosts / customers) * 1.5 ? '#28a745' : customers > 0 && pricePerCustomer > (totalCosts / customers) ? '#ffc107' : '#dc3545'
        }
    ];

    healthMetrics.forEach(metric => {
        healthHTML += `
            <div class="kpi-card">
                <div class="kpi-label">${metric.label}</div>
                <div class="kpi-value" style="color: ${metric.color}; font-size: 24px;">${metric.status}</div>
            </div>
        `;
    });
    healthHTML += '</div>';
    safeSetContent('healthMetrics', healthHTML);

    // Recommendations
    let recsHTML = '';

    if (profitMargin < 0) {
        recsHTML += `
            <div class="alert-box alert-danger">
                <strong>Critical: Operating at a Loss</strong><br>
                Your business is currently unprofitable. Consider:<br>
                • Increasing pricing by ${Math.ceil((totalCosts / (customers * pricePerCustomer) - 1) * 100 + 10)}% to reach profitability<br>
                • Reducing costs by $${Math.abs(netProfit).toFixed(0)}/month<br>
                • Acquiring ${Math.ceil(totalCosts / pricePerCustomer - customers)} more customers at current pricing
            </div>
        `;
    } else if (profitMargin < 20) {
        recsHTML += `
            <div class="alert-box alert-warning">
                <strong>Low Profit Margin</strong><br>
                Your margin of ${profitMargin.toFixed(1)}% is below healthy SaaS benchmarks (20-30%). Consider:<br>
                • Optimizing infrastructure costs<br>
                • Implementing value-based pricing tiers<br>
                • Reducing image sizes or implementing compression
            </div>
        `;
    }

    if (grossMargin < 70) {
        recsHTML += `
            <div class="alert-box alert-warning">
                <strong>Infrastructure Costs High</strong><br>
                Gross margin of ${grossMargin.toFixed(1)}% suggests infrastructure costs are eating into profits. Consider:<br>
                • Implementing image compression and lazy loading<br>
                • Using CDN caching more effectively<br>
                • Optimizing storage with archival tiers for old images
            </div>
        `;
    }

    if (monthlyChurn > 7) {
        recsHTML += `
            <div class="alert-box alert-danger">
                <strong>High Churn Rate</strong><br>
                ${monthlyChurn.toFixed(1)}% monthly churn is concerning. Focus on:<br>
                • Customer success and onboarding improvements<br>
                • Product features that increase stickiness<br>
                • Understanding why customers are leaving
            </div>
        `;
    }

    if (totalStorageGB > STORAGE_INCLUDED) {
        recsHTML += `
            <div class="alert-box alert-info">
                <strong>Storage Optimization Opportunity</strong><br>
                You're paying for ${(totalStorageGB - STORAGE_INCLUDED).toFixed(0)} GB of storage overage ($${storageCost.toFixed(0)}/mo). Consider:<br>
                • Implementing image compression (WebP format, ~30% smaller)<br>
                • Offering multiple image size options<br>
                • Archiving rarely-accessed images
            </div>
        `;
    }

    if (totalImageBandwidthGB > EGRESS_INCLUDED) {
        recsHTML += `
            <div class="alert-box alert-info">
                <strong>Bandwidth Optimization Opportunity</strong><br>
                You're paying for ${(totalImageBandwidthGB - EGRESS_INCLUDED).toFixed(0)} GB of bandwidth overage ($${bandwidthCost.toFixed(0)}/mo). Consider:<br>
                • Implementing aggressive CDN caching<br>
                • Using responsive images (serve smaller sizes on mobile)<br>
                • Lazy loading images below the fold
            </div>
        `;
    }

    if (recsHTML === '') {
        recsHTML = `
            <div class="alert-box alert-info">
                <strong>Business is Healthy!</strong><br>
                Your key metrics are in good shape. Focus on:<br>
                • Sustainable growth and customer acquisition<br>
                • Continuously improving product value<br>
                • Monitoring unit economics as you scale
            </div>
        `;
    }

    safeSetContent('recommendations-content', recsHTML);

    // Optimization opportunities
    let optHTML = '<div class="cost-breakdown">';

    if (totalStorageGB > 50) {
        const savings = storageCost * 0.3;
        optHTML += `
            <div class="breakdown-row">
                <span>Image Compression (WebP, 30% reduction)</span>
                <span style="color: #28a745;">Save ~$${savings.toFixed(0)}/mo</span>
            </div>
        `;
    }

    if (totalImageBandwidthGB > 100) {
        const savings = bandwidthCost * 0.4;
        optHTML += `
            <div class="breakdown-row">
                <span>CDN Caching + Lazy Loading (40% reduction)</span>
                <span style="color: #28a745;">Save ~$${savings.toFixed(0)}/mo</span>
            </div>
        `;
    }

    if (pricePerCustomer < 50) {
        const additionalRevenue = customers * 10;
        optHTML += `
            <div class="breakdown-row">
                <span>Price Increase to $${pricePerCustomer + 10}/mo (+$10)</span>
                <span style="color: #28a745;">+$${additionalRevenue.toFixed(0)}/mo revenue</span>
            </div>
        `;
    }

    optHTML += '</div>';
    safeSetContent('optimization-content', optHTML);

    // Risk assessment
    let riskHTML = '';

    const risks = [];
    if (profitMargin < 0) risks.push({ level: 'High', text: 'Operating at a loss with no clear path to profitability' });
    if (monthlyChurn > 10) risks.push({ level: 'High', text: 'Very high churn rate threatens business sustainability' });
    if (grossMargin < 40) risks.push({ level: 'High', text: 'Poor unit economics make scaling difficult' });
    if (monthlyChurn > 5 && monthlyChurn <= 10) risks.push({ level: 'Medium', text: 'Elevated churn rate needs attention' });
    if (totalImageBandwidthGB > EGRESS_INCLUDED * 2) risks.push({ level: 'Medium', text: 'High bandwidth costs may impact profitability at scale' });
    if (profitMargin > 0 && profitMargin < 15) risks.push({ level: 'Medium', text: 'Low margins provide little buffer for unexpected costs' });

    if (risks.length === 0) {
        riskHTML = '<div class="alert-box alert-info">No major risks identified. Continue monitoring key metrics.</div>';
    } else {
        risks.forEach(risk => {
            const alertClass = risk.level === 'High' ? 'alert-danger' : 'alert-warning';
            riskHTML += `<div class="alert-box ${alertClass}"><strong>${risk.level} Risk:</strong> ${risk.text}</div>`;
        });
    }

    safeSetContent('risk-content', riskHTML);
}

// Initial calculation
calculate();
