import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ShieldCheck, Zap, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Props {
  transactions: any[];
}

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

export const IncomeAnalytics = ({ transactions }: Props) => {
  const { sourceData, monthlyStability, avgMonthly, topSource } = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'income');
    if (incomes.length === 0) return { sourceData: [], monthlyStability: 0, avgMonthly: 0, topSource: 'None' };

    const bySource: Record<string, number> = {};
    incomes.forEach(t => bySource[t.category] = (bySource[t.category] || 0) + Number(t.amount));
    
    const sourceArray = Object.keys(bySource).map(k => ({ name: k, value: bySource[k] })).sort((a, b) => b.value - a.value);

    const byMonth: Record<string, number> = {};
    incomes.forEach(t => {
      const k = format(parseISO(t.created_at), 'yyyy-MM');
      byMonth[k] = (byMonth[k] || 0) + Number(t.amount);
    });
    const vals = Object.values(byMonth);
    const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    const cv = mean === 0 ? 0 : Math.sqrt(variance) / mean;
    
    return {
      sourceData: sourceArray,
      monthlyStability: Math.round(Math.max(0, Math.min(100, 100 - (cv * 100)))),
      avgMonthly: mean,
      topSource: sourceArray[0]?.name || 'None'
    };
  }, [transactions]);

  if (sourceData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className={monthlyStability > 80 ? "text-emerald-400" : "text-yellow-400"} />
              Stability
            </h3>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white">{monthlyStability}<span className="text-lg text-gray-500">/100</span></div>
          <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className={`h-full ${monthlyStability > 80 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${monthlyStability}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Activity size={14} className="text-blue-400" /> Avg/Mo
                </h3>
                <div className="text-xl md:text-3xl font-bold text-white truncate">₱{Math.round(avgMonthly).toLocaleString()}</div>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-purple-400" /> Top Source
                </h3>
                <div className="text-xl md:text-2xl font-bold text-white truncate">{topSource}</div>
            </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-6 flex items-center gap-2">
          <TrendingUp size={16} /> Income Sources
        </h3>
        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} 
                formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {sourceData.map((_e, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};