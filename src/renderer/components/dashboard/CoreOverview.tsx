import { FinanceEngine } from '../../lib/finance';
import { ArrowUpRight, Activity, Zap } from 'lucide-react';

interface Props {
  transactions: any[];
}

export const CoreOverview = ({ transactions }: Props) => {
  const incomeItems = transactions.filter(t => t.type === 'income');
  const expenseItems = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeItems.reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = expenseItems.reduce((acc, t) => acc + Number(t.amount), 0);
  const netWorth = totalIncome - totalExpense;

  const monthlyBurn = totalExpense / Math.max(1, new Date().getMonth() + 1); 
  const runway = FinanceEngine.calcRunway(netWorth, monthlyBurn);
  const savingsRate = FinanceEngine.calcSavingsRate(totalIncome, totalExpense);
  const dailyBurn = monthlyBurn / 30;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. NET WORTH */}
      <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={60} /></div>
        <h3 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">Net Worth</h3>
        <div className="text-2xl md:text-3xl font-bold text-white mt-1 truncate">₱{netWorth.toLocaleString()}</div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="text-emerald-400 flex items-center bg-emerald-400/10 px-1.5 py-0.5 rounded">
            <ArrowUpRight size={12} className="mr-1" /> +12%
          </span>
        </div>
      </div>

      {/* 2. RUNWAY */}
      <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
        <h3 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">Runway</h3>
        <div className="text-2xl md:text-3xl font-bold text-white mt-1 truncate">
            {runway} <span className="text-sm md:text-lg text-gray-500 font-normal">Mo</span>
        </div>
        <p className="text-[10px] md:text-xs text-gray-500 mt-2">Survival time</p>
      </div>

      {/* 3. SAVINGS RATE */}
      <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
        <h3 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">Savings</h3>
        <div className={`text-2xl md:text-3xl font-bold mt-1 truncate ${savingsRate > 20 ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {savingsRate.toFixed(1)}%
        </div>
        <div className="w-full bg-gray-800 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
        </div>
      </div>

      {/* 4. BURN RATE */}
      <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
        <h3 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">Burn</h3>
        <div className="text-2xl md:text-3xl font-bold text-rose-400 mt-1 truncate">₱{Math.round(monthlyBurn).toLocaleString()}</div>
        <div className="flex items-center gap-1 mt-2 text-[10px] md:text-xs text-gray-500">
          <Zap size={12} className="text-yellow-500" />
          ~₱{Math.round(dailyBurn)}/day
        </div>
      </div>
    </div>
  );
};