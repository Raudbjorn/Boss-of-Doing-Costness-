# SaaS Photo Platform - Financial Calculator & Business Plan

Comprehensive cost analysis and financial planning tools for a SaaS photo storage platform using Supabase and Vercel.

## 📦 What's Included

### 1. **HTML Calculator** (`saas-pricing-calculator.html`)
A standalone, interactive web calculator that runs directly in your browser—no installation required!

**Features:**
- 💰 Real-time cost calculations for Supabase + Vercel
- 📊 4 tabs: Calculator, Business Analysis, Growth Scenarios, Recommendations
- 📈 12-month financial projections
- 🎯 Break-even analysis
- 💡 Strategic recommendations
- 📱 Responsive design

**To Use:**
Simply open `saas-pricing-calculator.html` in any web browser!

### 2. **Jupyter Notebook** (`business_financial_analysis.ipynb`)
Advanced financial modeling with interactive visualizations and detailed analysis.

**Features:**
- 🔧 Interactive sliders for all parameters
- 📊 Beautiful charts (matplotlib, seaborn, plotly)
- 🎭 Scenario comparison (Conservative, Base, Aggressive)
- 💎 LTV/CAC analysis
- 🔥 Pricing sensitivity analysis
- 📄 Exportable business plan

## 🚀 Quick Start

### Option 1: HTML Calculator (Easiest!)
```bash
# Just open the HTML file in your browser
open saas-pricing-calculator.html
```

### Option 2: Jupyter Notebook

#### Using pip:
```bash
# Install dependencies
pip install -r requirements.txt

# Launch Jupyter
jupyter notebook business_financial_analysis.ipynb
```

#### Using Anaconda (Recommended):
```bash
# Anaconda includes everything pre-installed
# Download from: https://www.anaconda.com/download

# Launch Jupyter
jupyter notebook business_financial_analysis.ipynb
```

#### Using Google Colab (No Installation!):
1. Upload `business_financial_analysis.ipynb` to [Google Colab](https://colab.research.google.com/)
2. Click "Runtime" → "Run all"
3. Done!

## 📋 Pricing Model

### Supabase Pro ($120/month)
- ✅ 100 GB storage included
- ✅ 250 GB bandwidth included
- 💵 $0.021/GB storage overage
- 💵 $0.09/GB bandwidth overage

### Vercel Pro ($20/month per seat)
- ✅ 1 TB (1000 GB) bandwidth included
- 💵 $0.15/GB bandwidth overage

## 🎯 Key Metrics Tracked

- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate
- Gross Margin
- Net Profit Margin
- Unit Economics
- Break-even Analysis

## 📊 Use Cases

### Scenario Planning
Model different growth scenarios to understand:
- How many customers do I need to be profitable?
- What should I charge per customer?
- How does churn impact my business?
- What if I grow 20% per month instead of 10%?

### Cost Optimization
Identify savings opportunities:
- Image compression impact
- CDN caching benefits
- Storage optimization strategies
- Bandwidth reduction techniques

### Investor Presentations
Generate professional financial projections:
- 12-month revenue forecasts
- Cost breakdown and scaling
- Unit economics analysis
- LTV:CAC ratios

## 🛠️ Customization

Both tools are highly configurable. Adjust these parameters:

**Business Inputs:**
- Number of customers
- Locations per customer
- Images per location
- Average image size
- Monthly views per image
- Price per customer
- Monthly churn rate
- Monthly growth rate

**Cost Inputs:**
- Vercel team members
- Frontend bandwidth multiplier
- Employee salaries
- Marketing spend
- Other costs

## 📈 Example Calculations

**100 customers, $49/mo pricing:**
- Storage: ~39 GB
- Bandwidth: ~195 GB/month
- Supabase costs: $120/month (base)
- Vercel costs: $20/month (base)
- **Total costs**: ~$140/month
- **Revenue**: $4,900/month
- **Net profit**: $4,760/month
- **Margin**: 97% 🎉

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to open an issue or submit a pull request!

## 📝 License

MIT License - feel free to use and modify for your business!

## 🙏 Acknowledgments

Built with:
- Supabase pricing from [official docs](https://supabase.com/pricing)
- Vercel pricing from [official docs](https://vercel.com/pricing)
- SaaS best practices from industry benchmarks

---

**Happy Modeling! 📊💰**
