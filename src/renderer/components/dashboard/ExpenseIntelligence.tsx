import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, TrendingUp, ShoppingBag } from 'lucide-react';

interface Props { transactions: any[]; }
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
const NEEDS = ['Housing', 'Food', 'Transportation', 'Utilities', 'Healthcare', 'Debt'];

export const ExpenseIntelligence = ({ transactions }: Props) => {
  const { categoryData, totalExpenses, needsTotal, wantsTotal, topExpense } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const grouped: Record<string, number> = {};
    let needs = 0;
    let maxTx = { description: 'None', amount: 0 };

    expenses.forEach(t => {
      const amt = Number(t.amount);
      grouped[t.category] = (grouped[t.category] || 0) + amt;
      if (NEEDS.includes(t.category)) needs += amt;
      if (amt > maxTx.amount) maxTx = { description: t.description, amount: amt };
    });

    const data = Object.keys(grouped).map(key => ({ name: key, value: grouped[key] })).sort((a, b) => b.value - a.value);
    return { categoryData: data, totalExpenses: total, needsTotal: needs, wantsTotal: total - needs, topExpense: maxTx };
  }, [transactions]);

  if (totalExpenses === 0) return null; 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      <div className="col-span-1 lg:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShoppingBag size={16} /> Spending Breakdown
        </h3>
        <div className="flex-1 w-full flex flex-col md:flex-row items-center">
            <div className="h-[200px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {categoryData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} formatter={(value: any) => `₱${Number(value).toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 md:pl-4 mt-4 md:mt-0 space-y-2 overflow-y-auto max-h-[150px] custom-scrollbar">
                {categoryData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-gray-300 truncate max-w-[100px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-100">₱{item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp size={16} /> Needs/Wants
            </h3>
            <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-emerald-400">Needs ₱{(needsTotal).toLocaleString()}</span>
                <span className="text-rose-400">Wants ₱{(wantsTotal).toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(needsTotal / totalExpenses) * 100}%` }}></div>
                <div className="bg-rose-500 h-full" style={{ width: `${(wantsTotal / totalExpenses) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2 text-rose-400">
                <AlertTriangle size={16} /> Top Expense
            </h3>
            <div className="mt-2">
                <div className="text-xl md:text-2xl font-bold text-white truncate">{topExpense.description}</div>
                <div className="text-lg md:text-xl text-rose-400 font-mono">-₱{topExpense.amount.toLocaleString()}</div>
            </div>
          </div>
      </div>
    </div>
  );
};