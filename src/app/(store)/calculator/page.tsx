'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Briefcase,
  History,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCcw,
  Info,
  ChevronRight,
  ArrowRight,
  Globe,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { TaxCalculationResult } from '@/modules/tax-engine/types/calculation-result';
import { CalculationRecord } from '@/modules/tax-engine/core/history-store';
import { TaxRuleSetDefinition } from '@/modules/tax-engine/rules/tax-rule.version';

type ActiveModule = 'US_1099' | 'US_W2' | 'VN_SALARY';
type ViewTab = 'calculator' | 'history' | 'rules';

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('calculator');
  const [activeModule, setActiveModule] = useState<ActiveModule>('US_1099');
  const [taxYear, setTaxYear] = useState<number>(2026);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<TaxCalculationResult | null>(null);

  // History & Rules State
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRuleSetDefinition[]>([]);
  const [selectedRuleCountry, setSelectedRuleCountry] = useState<string>('ALL');

  // US 1099 Form State
  const [us1099Gross, setUs1099Gross] = useState<string>('120000');
  const [us1099Expenses, setUs1099Expenses] = useState<string>('20000');
  const [us1099FilingStatus, setUs1099FilingStatus] = useState<string>('SINGLE');
  const [us1099State, setUs1099State] = useState<string>('TX');
  const [us1099OtherW2, setUs1099OtherW2] = useState<string>('0');
  const [us1099EstimatedPayments, setUs1099EstimatedPayments] = useState<string>('0');
  const [us1099Itemized, setUs1099Itemized] = useState<boolean>(false);
  const [us1099ItemizedAmount, setUs1099ItemizedAmount] = useState<string>('0');

  // US W-2 Form State
  const [usW2Salary, setUsW2Salary] = useState<string>('100000');
  const [usW2Frequency, setUsW2Frequency] = useState<string>('MONTHLY');
  const [usW2FilingStatus, setUsW2FilingStatus] = useState<string>('SINGLE');
  const [usW2State, setUsW2State] = useState<string>('TX');
  const [usW2PreTax, setUsW2PreTax] = useState<string>('5000');
  const [usW2PostTax, setUsW2PostTax] = useState<string>('0');

  // Vietnam Gross-to-Net Form State
  const [vnMonthlyGross, setVnMonthlyGross] = useState<string>('35000000');
  const [vnDependents, setVnDependents] = useState<number>(0);
  const [vnResidency, setVnResidency] = useState<'RESIDENT' | 'NON_RESIDENT'>('RESIDENT');
  const [vnParticipatesBhxh, setVnParticipatesBhxh] = useState<boolean>(true);
  const [vnParticipatesBhyt, setVnParticipatesBhyt] = useState<boolean>(true);
  const [vnParticipatesBhtn, setVnParticipatesBhtn] = useState<boolean>(true);

  // Load history and rules on mount
  useEffect(() => {
    fetchHistory();
    fetchRules();
    // Run initial calculation for default state
    handleCalculate();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/calculations');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch {
      // Ignore background fetch error
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/tax-rules');
      const data = await res.json();
      if (data.success) {
        setTaxRules(data.data);
      }
    } catch {
      // Ignore background fetch error
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/calculations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Calculation history removed');
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      toast.error('Failed to delete calculation');
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    setApiError(null);

    let payload: Record<string, unknown> = {};

    if (activeModule === 'US_1099') {
      payload = {
        country: 'US',
        incomeType: '1099',
        taxYear,
        grossBusinessIncome: us1099Gross || '0',
        businessExpenses: us1099Expenses || '0',
        filingStatus: us1099FilingStatus,
        state: us1099State,
        otherW2Income: us1099OtherW2 || '0',
        estimatedTaxPayments: us1099EstimatedPayments || '0',
        hasItemizedDeductions: us1099Itemized,
        itemizedDeductionAmount: us1099ItemizedAmount || '0',
      };
    } else if (activeModule === 'US_W2') {
      payload = {
        country: 'US',
        incomeType: 'W2',
        taxYear,
        annualGrossSalary: usW2Salary || '0',
        payFrequency: usW2Frequency,
        filingStatus: usW2FilingStatus,
        state: usW2State,
        preTaxDeductions: usW2PreTax || '0',
        postTaxDeductions: usW2PostTax || '0',
      };
    } else {
      payload = {
        country: 'VN',
        incomeType: 'SALARY',
        taxYear,
        monthlyGrossSalary: vnMonthlyGross || '0',
        taxResidencyStatus: vnResidency,
        numberOfDependents: Number(vnDependents) || 0,
        participatesBhxh: vnParticipatesBhxh,
        participatesBhyt: vnParticipatesBhyt,
        participatesBhtn: vnParticipatesBhtn,
      };
    }

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.error || 'Calculation failed');
        toast.error(data.error || 'Calculation failed');
      } else {
        setResult(data.data);
        fetchHistory();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyDisplay = (amount: string | number | null | undefined, currency: string) => {
    if (amount === null || amount === undefined) return '—';
    const num = Number(amount);
    if (isNaN(num)) return String(amount);

    if (currency === 'VND') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(num);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#111111]">
      {/* Top Banner / Header */}
      <div className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F4F0] border border-[#E5E5E5] text-xs font-semibold text-[#666666] mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                <span>Deterministic Financial Precision Engine • Version 2026.1</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[#111111]">
                Multi-Country Salary & Tax Calculator
              </h1>
              <p className="mt-2 text-sm text-[#666666] max-w-2xl leading-relaxed">
                Compute US 1099 Freelance, US W-2 Salary, and Vietnam Gross-to-Net payroll taxes
                using official IRS & General Department of Taxation progressive schedules.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 bg-[#F5F4F0] rounded-lg border border-[#E5E5E5] text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-white text-[#111111] shadow-xs font-semibold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-[#111111] shadow-xs font-semibold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({history.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                  activeTab === 'rules'
                    ? 'bg-white text-[#111111] shadow-xs font-semibold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tax Rules & Brackets</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            {/* Country & Calculator Type Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveModule('US_1099');
                  setResult(null);
                }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  activeModule === 'US_1099'
                    ? 'border-[#111111] bg-white shadow-xs ring-1 ring-[#111111]'
                    : 'border-[#E5E5E5] bg-white/60 hover:bg-white text-[#666666]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">
                    United States
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5F4F0] font-mono">USD ($)</span>
                </div>
                <p className="font-semibold text-sm text-[#111111] mt-1">1099 Freelance / Contractor</p>
                <p className="text-xs text-[#777777] mt-0.5">
                  Schedule C, SE Tax (15.3%), QBI 20% & Deductions
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModule('US_W2');
                  setResult(null);
                }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  activeModule === 'US_W2'
                    ? 'border-[#111111] bg-white shadow-xs ring-1 ring-[#111111]'
                    : 'border-[#E5E5E5] bg-white/60 hover:bg-white text-[#666666]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">
                    United States
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5F4F0] font-mono">USD ($)</span>
                </div>
                <p className="font-semibold text-sm text-[#111111] mt-1">W-2 Employee Salary</p>
                <p className="text-xs text-[#777777] mt-0.5">
                  FICA (7.65%), Federal Withholding & Employer Share
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModule('VN_SALARY');
                  setResult(null);
                }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  activeModule === 'VN_SALARY'
                    ? 'border-[#111111] bg-white shadow-xs ring-1 ring-[#111111]'
                    : 'border-[#E5E5E5] bg-white/60 hover:bg-white text-[#666666]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">
                    Vietnam
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5F4F0] font-mono">VND (₫)</span>
                </div>
                <p className="font-semibold text-sm text-[#111111] mt-1">Gross-to-Net Salary</p>
                <p className="text-xs text-[#777777] mt-0.5">
                  BHXH (8%), BHYT (1.5%), BHTN (1%) & 2026 Progressive PIT
                </p>
              </button>
            </div>

            {/* Main Interactive Grid: Form on Left, Live Results on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-xl border border-[#E5E5E5] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
                  <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#666666]" />
                    <span>Calculation Parameters</span>
                  </h2>

                  {/* Tax Year Selector */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#666666]">Tax Year:</span>
                    <select
                      value={taxYear}
                      onChange={(e) => setTaxYear(Number(e.target.value))}
                      className="px-2.5 py-1 border border-[#D5D5D5] rounded-md font-semibold bg-white text-xs focus:ring-1 focus:ring-[#111111] outline-hidden"
                    >
                      <option value={2026}>2026 (Active)</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                    </select>
                  </div>
                </div>

                {/* US 1099 FORM FIELDS */}
                {activeModule === 'US_1099' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-[#444444] mb-1">
                        Gross Business Income ($ USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#999999]">$</span>
                        <input
                          type="number"
                          value={us1099Gross}
                          onChange={(e) => setUs1099Gross(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-[#D5D5D5] rounded-md text-sm outline-hidden focus:border-[#111111]"
                          placeholder="120000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-[#444444] mb-1">
                        Deductible Business Expenses ($ USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#999999]">$</span>
                        <input
                          type="number"
                          value={us1099Expenses}
                          onChange={(e) => setUs1099Expenses(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-[#D5D5D5] rounded-md text-sm outline-hidden focus:border-[#111111]"
                          placeholder="20000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#444444] mb-1">Filing Status</label>
                        <select
                          value={us1099FilingStatus}
                          onChange={(e) => setUs1099FilingStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md bg-white outline-hidden focus:border-[#111111]"
                        >
                          <option value="SINGLE">Single</option>
                          <option value="MARRIED_FILING_JOINTLY">Married Filing Jointly</option>
                          <option value="MARRIED_FILING_SEPARATELY">Married Filing Separately</option>
                          <option value="HEAD_OF_HOUSEHOLD">Head of Household</option>
                          <option value="QUALIFYING_SURVIVING_SPOUSE">Qualifying Surviving Spouse</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-[#444444] mb-1">State</label>
                        <select
                          value={us1099State}
                          onChange={(e) => setUs1099State(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md bg-white outline-hidden focus:border-[#111111]"
                        >
                          <option value="TX">Texas (TX - 0%)</option>
                          <option value="FL">Florida (FL - 0%)</option>
                          <option value="WA">Washington (WA - 0%)</option>
                          <option value="CA">California (CA - Progressive)</option>
                          <option value="NY">New York (NY - Progressive)</option>
                          <option value="IL">Illinois (IL - 4.95%)</option>
                          <option value="PA">Pennsylvania (PA - 3.07%)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block font-medium text-[#444444] mb-1">
                          Other W-2 Income (Optional)
                        </label>
                        <input
                          type="number"
                          value={us1099OtherW2}
                          onChange={(e) => setUs1099OtherW2(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md outline-hidden focus:border-[#111111]"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#444444] mb-1">
                          Estimated Tax Paid (Optional)
                        </label>
                        <input
                          type="number"
                          value={us1099EstimatedPayments}
                          onChange={(e) => setUs1099EstimatedPayments(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md outline-hidden focus:border-[#111111]"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0F0F0]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={us1099Itemized}
                          onChange={(e) => setUs1099Itemized(e.target.checked)}
                          className="rounded text-[#111111] focus:ring-0"
                        />
                        <span className="font-medium text-[#333333]">Use Itemized Deductions</span>
                      </label>
                      {us1099Itemized && (
                        <input
                          type="number"
                          value={us1099ItemizedAmount}
                          onChange={(e) => setUs1099ItemizedAmount(e.target.value)}
                          className="w-full mt-2 px-3 py-2 border border-[#D5D5D5] rounded-md outline-hidden focus:border-[#111111]"
                          placeholder="Itemized amount ($)"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* US W-2 FORM FIELDS */}
                {activeModule === 'US_W2' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-[#444444] mb-1">
                        Annual Gross Salary ($ USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#999999]">$</span>
                        <input
                          type="number"
                          value={usW2Salary}
                          onChange={(e) => setUsW2Salary(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-[#D5D5D5] rounded-md text-sm outline-hidden focus:border-[#111111]"
                          placeholder="100000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#444444] mb-1">Pay Frequency</label>
                        <select
                          value={usW2Frequency}
                          onChange={(e) => setUsW2Frequency(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md bg-white outline-hidden focus:border-[#111111]"
                        >
                          <option value="ANNUALLY">Annually (1x)</option>
                          <option value="MONTHLY">Monthly (12x)</option>
                          <option value="SEMIMONTHLY">Semi-Monthly (24x)</option>
                          <option value="BIWEEKLY">Bi-Weekly (26x)</option>
                          <option value="WEEKLY">Weekly (52x)</option>
                          <option value="HOURLY">Hourly (2080 hrs)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-[#444444] mb-1">Filing Status</label>
                        <select
                          value={usW2FilingStatus}
                          onChange={(e) => setUsW2FilingStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md bg-white outline-hidden focus:border-[#111111]"
                        >
                          <option value="SINGLE">Single</option>
                          <option value="MARRIED_FILING_JOINTLY">Married Filing Jointly</option>
                          <option value="MARRIED_FILING_SEPARATELY">Married Filing Separately</option>
                          <option value="HEAD_OF_HOUSEHOLD">Head of Household</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-[#444444] mb-1">State</label>
                      <select
                        value={usW2State}
                        onChange={(e) => setUsW2State(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md bg-white outline-hidden focus:border-[#111111]"
                      >
                        <option value="TX">Texas (TX - 0%)</option>
                        <option value="FL">Florida (FL - 0%)</option>
                        <option value="WA">Washington (WA - 0%)</option>
                        <option value="CA">California (CA - Progressive)</option>
                        <option value="NY">New York (NY - Progressive)</option>
                        <option value="IL">Illinois (IL - 4.95%)</option>
                        <option value="PA">Pennsylvania (PA - 3.07%)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block font-medium text-[#444444] mb-1">
                          Pre-Tax Deductions (401k/HSA)
                        </label>
                        <input
                          type="number"
                          value={usW2PreTax}
                          onChange={(e) => setUsW2PreTax(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md outline-hidden focus:border-[#111111]"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#444444] mb-1">
                          Post-Tax Deductions (Roth/Other)
                        </label>
                        <input
                          type="number"
                          value={usW2PostTax}
                          onChange={(e) => setUsW2PostTax(e.target.value)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md outline-hidden focus:border-[#111111]"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* VIETNAM SALARY FORM FIELDS */}
                {activeModule === 'VN_SALARY' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-[#444444] mb-1">
                        Monthly Gross Salary (₫ VND) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#999999]">₫</span>
                        <input
                          type="number"
                          value={vnMonthlyGross}
                          onChange={(e) => setVnMonthlyGross(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-[#D5D5D5] rounded-md text-sm outline-hidden focus:border-[#111111]"
                          placeholder="35000000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#444444] mb-1">Tax Residency</label>
                        <select
                          value={vnResidency}
                          onChange={(e) => setVnResidency(e.target.value as any)}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md bg-white outline-hidden focus:border-[#111111]"
                        >
                          <option value="RESIDENT">Resident (5 Brackets)</option>
                          <option value="NON_RESIDENT">Non-Resident (Flat 20%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-[#444444] mb-1">
                          Number of Dependents
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={vnDependents}
                          onChange={(e) => setVnDependents(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md outline-hidden focus:border-[#111111]"
                        />
                      </div>
                    </div>

                    {/* Insurance participation toggles */}
                    <div className="p-3 bg-[#F9F9F8] rounded-md border border-[#EEEEEE] space-y-2">
                      <p className="font-semibold text-[#333333]">Insurance Participation</p>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vnParticipatesBhxh}
                            onChange={(e) => setVnParticipatesBhxh(e.target.checked)}
                          />
                          <span>BHXH (8%)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vnParticipatesBhyt}
                            onChange={(e) => setVnParticipatesBhyt(e.target.checked)}
                          />
                          <span>BHYT (1.5%)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vnParticipatesBhtn}
                            onChange={(e) => setVnParticipatesBhtn(e.target.checked)}
                          />
                          <span>BHTN (1%)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calculate Trigger Button */}
                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#111111] hover:bg-black text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Calculating...</span>
                  ) : (
                    <>
                      <span>Compute Tax Breakdown</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {apiError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </div>
                )}
              </div>

              {/* Live Results Column */}
              <div className="lg:col-span-7 space-y-6">
                {result ? (
                  <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#E5E5E5] shadow-xs space-y-6">
                    {/* Header with Status and Version */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EEEEEE]">
                      <div>
                        <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                          Tax Computation Report
                        </span>
                        <h3 className="text-xl font-medium text-[#111111]">
                          {result.country === 'US' ? 'United States' : 'Vietnam'} • Tax Year{' '}
                          {result.taxYear}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                          Rule: {result.ruleVersion}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            result.calculationStatus === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {result.calculationStatus}
                        </span>
                      </div>
                    </div>

                    {/* High-level KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#F5F4F0] rounded-lg border border-[#EBEAE5]">
                        <p className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                          Net Take-Home Pay
                        </p>
                        <p className="text-2xl font-light text-[#111111] mt-1">
                          {formatCurrencyDisplay(result.estimatedTakeHome, result.currency)}
                        </p>
                        <p className="text-[10px] text-[#888888] mt-0.5">
                          {result.incomeType === 'SALARY' ? 'Monthly Take-Home' : 'Annual Net Profit After Tax'}
                        </p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-[#E5E5E5]">
                        <p className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                          Total Taxes & FICA
                        </p>
                        <p className="text-2xl font-light text-red-700 mt-1">
                          {formatCurrencyDisplay(result.totalTax, result.currency)}
                        </p>
                        <p className="text-[10px] text-[#888888] mt-0.5">Total Government Deductions</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-[#E5E5E5]">
                        <p className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                          Effective Tax Rate
                        </p>
                        <p className="text-2xl font-light text-[#111111] mt-1">
                          {result.effectiveTaxRate}
                        </p>
                        <p className="text-[10px] text-[#888888] mt-0.5">Total Tax / Gross Income</p>
                      </div>
                    </div>

                    {/* Itemized Table Breakdown */}
                    <div>
                      <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-3">
                        Detailed Itemized Breakdown
                      </h4>

                      <div className="divide-y divide-[#EEEEEE] border border-[#EEEEEE] rounded-lg overflow-hidden text-xs">
                        <div className="flex justify-between py-2.5 px-3 bg-[#FAFAFA] font-semibold text-[#444444]">
                          <span>Component</span>
                          <span>Amount ({result.currency})</span>
                        </div>

                        <div className="flex justify-between py-2 px-3">
                          <span className="text-[#666666]">Gross Total Income</span>
                          <span className="font-medium text-[#111111]">
                            {formatCurrencyDisplay(result.grossIncome, result.currency)}
                          </span>
                        </div>

                        {result.country === 'US' && result.incomeType === '1099' && (
                          <div className="flex justify-between py-2 px-3">
                            <span className="text-[#666666]">Deductible Business Expenses</span>
                            <span className="font-medium text-red-600">
                              - {formatCurrencyDisplay(result.businessExpenses, result.currency)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between py-2 px-3 bg-[#FBFBFA]">
                          <span className="font-semibold text-[#333333]">Taxable Income Base</span>
                          <span className="font-semibold text-[#111111]">
                            {formatCurrencyDisplay(result.taxableIncome, result.currency)}
                          </span>
                        </div>

                        {result.federalTax && (
                          <div className="flex justify-between py-2 px-3">
                            <span className="text-[#666666]">Federal Income Tax</span>
                            <span className="font-medium text-[#111111]">
                              {formatCurrencyDisplay(result.federalTax, result.currency)}
                            </span>
                          </div>
                        )}

                        {result.personalIncomeTax && (
                          <div className="flex justify-between py-2 px-3">
                            <span className="text-[#666666]">Personal Income Tax (PIT)</span>
                            <span className="font-medium text-[#111111]">
                              {formatCurrencyDisplay(result.personalIncomeTax, result.currency)}
                            </span>
                          </div>
                        )}

                        {result.socialSecurityTax && (
                          <div className="flex justify-between py-2 px-3">
                            <span className="text-[#666666]">Social Security Contribution</span>
                            <span className="font-medium text-[#111111]">
                              {formatCurrencyDisplay(result.socialSecurityTax, result.currency)}
                            </span>
                          </div>
                        )}

                        {result.medicareTax && (
                          <div className="flex justify-between py-2 px-3">
                            <span className="text-[#666666]">Medicare (incl. Additional Medicare)</span>
                            <span className="font-medium text-[#111111]">
                              {formatCurrencyDisplay(result.medicareTax, result.currency)}
                            </span>
                          </div>
                        )}

                        {result.insuranceContributions && (
                          <div className="flex justify-between py-2 px-3">
                            <span className="text-[#666666]">
                              Employee Mandatory Insurance (BHXH + BHYT + BHTN)
                            </span>
                            <span className="font-medium text-[#111111]">
                              {formatCurrencyDisplay(result.insuranceContributions, result.currency)}
                            </span>
                          </div>
                        )}

                        {result.stateTax && (
                          <div className="flex justify-between py-2 px-3">
                            <span className="text-[#666666]">State Income Tax</span>
                            <span className="font-medium text-[#111111]">
                              {formatCurrencyDisplay(result.stateTax, result.currency)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between py-2.5 px-3 bg-[#F5F4F0] font-semibold text-[#111111]">
                          <span>Net Estimated Take-Home</span>
                          <span>{formatCurrencyDisplay(result.estimatedTakeHome, result.currency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Employer Share Notice */}
                    {result.country === 'VN' && (result.breakdown as any)?.employerInsurance && (
                      <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-md text-xs text-[#224466] space-y-1">
                        <p className="font-semibold flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" />
                          <span>Employer Contributions (Not Deducted From Your Take-Home):</span>
                        </p>
                        <p>
                          Total Employer Insurance: ₫
                          {Number(
                            (result.breakdown as any).employerInsurance.total
                          ).toLocaleString('en-US')}{' '}
                          • Total Employer Cost: ₫
                          {Number((result.breakdown as any).totalEmployerCost).toLocaleString('en-US')}
                        </p>
                      </div>
                    )}

                    {result.country === 'US' &&
                      result.incomeType === 'W2' &&
                      (result.breakdown as any)?.totalEmployerContributions && (
                        <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-md text-xs text-[#224466] space-y-1">
                          <p className="font-semibold flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            <span>Employer FICA Contributions (Reported Separately):</span>
                          </p>
                          <p>
                            Employer FICA Match: $
                            {(result.breakdown as any).totalEmployerContributions} (Social Security:{' '}
                            ${(result.breakdown as any).employerSocialSecurity}, Medicare: $
                            {(result.breakdown as any).employerMedicare})
                          </p>
                        </div>
                      )}

                    {/* Legal Disclaimer */}
                    <p className="text-[11px] text-[#888888] leading-relaxed pt-3 border-t border-[#EEEEEE] italic">
                      {result.disclaimer}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-xl border border-[#E5E5E5] text-center space-y-3">
                    <Calculator className="w-10 h-10 text-[#CCCCCC] mx-auto" />
                    <p className="text-sm font-medium text-[#444444]">
                      Awaiting Calculation Parameters
                    </p>
                    <p className="text-xs text-[#888888] max-w-sm mx-auto">
                      Adjust your income and deductions on the left and click "Compute Tax Breakdown"
                      to generate an itemized calculation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calculation History View */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E5E5] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEEEEE]">
              <div>
                <h2 className="text-lg font-medium text-[#111111]">Calculation History</h2>
                <p className="text-xs text-[#666666]">
                  Past tax calculations saved in your session ledger.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchHistory}
                className="px-3 py-1.5 border border-[#D5D5D5] rounded-md text-xs font-semibold hover:border-[#111111] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-[#888888] text-xs">
                No calculations recorded in history yet. Execute a calculation to see it saved here.
              </div>
            ) : (
              <div className="divide-y divide-[#EEEEEE] border border-[#EEEEEE] rounded-lg overflow-hidden text-xs">
                <div className="grid grid-cols-12 gap-2 p-3 bg-[#FAFAFA] font-semibold text-[#444444]">
                  <span className="col-span-3">Timestamp / Country</span>
                  <span className="col-span-2">Type</span>
                  <span className="col-span-2">Gross Income</span>
                  <span className="col-span-2">Total Tax</span>
                  <span className="col-span-2">Net Take-Home</span>
                  <span className="col-span-1 text-right">Action</span>
                </div>

                {history.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-[#FAFAFA]">
                    <div className="col-span-3">
                      <p className="font-medium text-[#111111]">
                        {item.country === 'US' ? 'United States' : 'Vietnam'} ({item.taxYear})
                      </p>
                      <p className="text-[10px] text-[#888888]">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="col-span-2 font-mono text-[11px]">{item.incomeType}</div>

                    <div className="col-span-2 font-medium">
                      {formatCurrencyDisplay(item.grossIncome, item.currency)}
                    </div>

                    <div className="col-span-2 text-red-600 font-medium">
                      {formatCurrencyDisplay(item.totalTax, item.currency)}
                    </div>

                    <div className="col-span-2 font-semibold text-[#111111]">
                      {formatCurrencyDisplay(item.netIncome, item.currency)}
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-1 hover:text-red-600 text-[#888888] transition-colors"
                        title="Delete calculation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tax Rules & Brackets Explorer */}
        {activeTab === 'rules' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E5E5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEEEEE]">
              <div>
                <h2 className="text-lg font-medium text-[#111111]">Official Tax Rules & Brackets</h2>
                <p className="text-xs text-[#666666]">
                  Verified statutory tax brackets, exemptions and contribution limits.
                </p>
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#666666]">Filter:</span>
                <select
                  value={selectedRuleCountry}
                  onChange={(e) => setSelectedRuleCountry(e.target.value)}
                  className="px-3 py-1.5 border border-[#D5D5D5] rounded-md font-semibold bg-white outline-hidden focus:border-[#111111]"
                >
                  <option value="ALL">All Jurisdictions</option>
                  <option value="US">United States (IRS)</option>
                  <option value="VN">Vietnam (GDT)</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {taxRules
                .filter((r) => selectedRuleCountry === 'ALL' || r.country === selectedRuleCountry)
                .map((rule) => (
                  <div key={rule.id} className="p-5 border border-[#E5E5E5] rounded-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#111111]">
                          {rule.country === 'US' ? '🇺🇸 United States' : '🇻🇳 Vietnam'} • {rule.jurisdiction}
                        </span>
                        <span className="text-xs text-[#666666]">({rule.taxYear})</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold">
                          {rule.status}
                        </span>
                        <span className="text-[#888888]">v{rule.version}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAFAFA] p-3 rounded-md">
                      <div>
                        <span className="text-[#777777]">Income Type:</span>
                        <p className="font-medium text-[#111111]">{rule.incomeType}</p>
                      </div>
                      {rule.filingStatus && (
                        <div>
                          <span className="text-[#777777]">Filing Status:</span>
                          <p className="font-medium text-[#111111]">{rule.filingStatus}</p>
                        </div>
                      )}
                      {rule.standardDeduction && (
                        <div>
                          <span className="text-[#777777]">Standard Deduction:</span>
                          <p className="font-medium text-[#111111]">
                            ${rule.standardDeduction.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {rule.personalExemption && (
                        <div>
                          <span className="text-[#777777]">Personal Exemption:</span>
                          <p className="font-medium text-[#111111]">
                            ₫{rule.personalExemption.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {rule.socialSecurityWageBase && (
                        <div>
                          <span className="text-[#777777]">SS Wage Base:</span>
                          <p className="font-medium text-[#111111]">
                            ${rule.socialSecurityWageBase.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Brackets Table */}
                    {rule.brackets && rule.brackets.length > 0 && (
                      <div className="border border-[#EEEEEE] rounded-md overflow-hidden text-xs">
                        <div className="grid grid-cols-3 p-2 bg-[#F5F4F0] font-semibold text-[#444444]">
                          <span>Min Income</span>
                          <span>Max Income</span>
                          <span className="text-right">Marginal Rate</span>
                        </div>
                        {rule.brackets.map((b, idx) => (
                          <div key={idx} className="grid grid-cols-3 p-2 border-t border-[#EEEEEE]">
                            <span>
                              {rule.country === 'US' ? '$' : '₫'}
                              {b.min.toLocaleString()}
                            </span>
                            <span>
                              {b.max !== null ? (
                                `${rule.country === 'US' ? '$' : '₫'}${b.max.toLocaleString()}`
                              ) : (
                                'No upper limit'
                              )}
                            </span>
                            <span className="text-right font-semibold">
                              {(b.rate * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-[#888888] truncate">
                      Source Reference: <span className="underline">{rule.sourceReference}</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

