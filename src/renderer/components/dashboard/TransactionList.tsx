import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, User, Users } from 'lucide-react';

interface Transaction {
  id: string; type: 'income' | 'expense'; description: string; amount: number; category: string; created_at: string; owner?: 'John' | 'Hannah' | 'Both';
}
interface Props { transactions: Transaction[]; onEdit: (t: Transaction) => void; onDelete: (id: string) => void; }

export const TransactionList = ({ transactions, onEdit, onDelete }: Props) => {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col h-[400px] overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <h3 className="font-semibold text-gray-300">Recent Activity</h3>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
          {transactions.length} items
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {transactions.map((t) => (
          <div key={t.id} className="group flex justify-between items-center p-4 bg-gray-950/50 rounded-xl hover:bg-gray-800 transition-all border border-gray-800/50 hover:border-gray-700 hover:shadow-lg">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-white truncate">{t.description}</p>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${t.owner === 'John' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : t.owner === 'Hannah' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                    {t.owner === 'Both' ? <Users size={10} /> : <User size={10} />}
                    {t.owner || 'Both'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 shrink-0">{t.category}</span>
              </div>
              <p className="text-xs text-gray-500">{format(parseISO(t.created_at), 'MMM d, h:mm a')}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.type === 'income' ? '+' : '-'}₱{Number(t.amount).toLocaleString()}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
                <button onClick={() => onEdit(t)} className="p-2 hover:bg-blue-500/10 hover:text-blue-400 text-gray-500 rounded-lg transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(t.id)} className="p-2 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};