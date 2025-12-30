import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Calendar, Edit2, TrendingDown, X, Save, Clock } from 'lucide-react';
import { format, parseISO, differenceInMonths, differenceInDays } from 'date-fns';

interface Loan {
  id: string; name: string; owner: 'John' | 'Hannah' | 'Both'; total_amount: number; current_balance: number; due_date: string; next_payment_date: string;
}

export const LoanTracker = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [owner, setOwner] = useState<'John' | 'Hannah' | 'Both'>('Both');
  const [total, setTotal] = useState('');
  const [balance, setBalance] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [nextDate, setNextDate] = useState('');

  const fetchLoans = async () => {
    const { data } = await supabase.from('loans').select('*').order('due_date', { ascending: true });
    if (data) setLoans(data);
  };
  useEffect(() => { fetchLoans(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, owner, total_amount: parseFloat(total), current_balance: parseFloat(balance), due_date: targetDate, next_payment_date: nextDate };
    if (editingId) { await supabase.from('loans').update(payload).eq('id', editingId); } else { await supabase.from('loans').insert(payload); }
    closeModal(); fetchLoans();
  };
  const handleDelete = async (id: string) => { if(confirm('Delete?')) { await supabase.from('loans').delete().eq('id', id); fetchLoans(); } };
  const openEdit = (loan: Loan) => { setName(loan.name); setOwner(loan.owner); setTotal(loan.total_amount.toString()); setBalance(loan.current_balance.toString()); setTargetDate(loan.due_date); setNextDate(loan.next_payment_date || ''); setEditingId(loan.id); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setName(''); setTotal(''); setBalance(''); setTargetDate(''); setNextDate(''); };
  
  const totalDebt = loans.reduce((acc, l) => acc + Number(l.current_balance), 0);
  const totalOriginal = loans.reduce((acc, l) => acc + Number(l.total_amount), 0);
  const progress = totalOriginal === 0 ? 0 : ((totalOriginal - totalDebt) / totalOriginal) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Debt</h3>
            <div className="text-4xl font-bold text-rose-400">₱{totalDebt.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 col-span-1 md:col-span-2 flex flex-col justify-center">
            <div className="flex justify-between mb-2">
                <span className="text-gray-300 font-medium">Payoff Progress</span>
                <span className="text-emerald-400 font-bold">{progress.toFixed(1)}% Free</span>
            </div>
            <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><TrendingDown /> Active Loans</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Add Loan</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map(loan => {
            const loanProgress = ((loan.total_amount - loan.current_balance) / loan.total_amount) * 100;
            const monthsLeft = loan.due_date ? differenceInMonths(parseISO(loan.due_date), new Date()) : 0;
            const daysToNext = loan.next_payment_date ? differenceInDays(parseISO(loan.next_payment_date), new Date()) : null;

            return (
                <div key={loan.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(loan)} className="p-1.5 bg-gray-800 hover:bg-blue-500 hover:text-white text-gray-400 rounded-md transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(loan.id)} className="p-1.5 bg-gray-800 hover:bg-red-500 hover:text-white text-gray-400 rounded-md transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${loan.owner === 'John' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : loan.owner === 'Hannah' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>{loan.owner}</span>
                            <h3 className="text-xl font-bold mt-2">{loan.name}</h3>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">₱{loan.current_balance.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">of ₱{loan.total_amount.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Payoff Progress</span><span>{loanProgress.toFixed(0)}%</span></div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${loanProgress}%` }}></div></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1 text-xs text-gray-400 bg-gray-950/50 p-2 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-1 font-bold text-gray-300"><Calendar size={12} /> Target Payoff</div>
                                <span>{loan.due_date ? format(parseISO(loan.due_date), 'MMM yyyy') : 'No date'}</span>
                                <span className={monthsLeft < 3 ? 'text-rose-400' : 'text-emerald-400'}>{monthsLeft > 0 ? `${monthsLeft} mo. left` : 'Due soon!'}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-xs text-gray-400 bg-gray-950/50 p-2 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-1 font-bold text-gray-300"><Clock size={12} /> Next Payment</div>
                                <span>{loan.next_payment_date ? format(parseISO(loan.next_payment_date), 'MMM d') : 'No date'}</span>
                                {daysToNext !== null && (<span className={daysToNext < 5 ? 'text-rose-400 font-bold' : 'text-blue-400'}>{daysToNext < 0 ? 'Overdue!' : daysToNext === 0 ? 'Today!' : `${daysToNext} days`}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
      
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">{editingId ? <Edit2 size={24} /> : <Plus size={24} />}{editingId ? 'Edit Loan' : 'Add New Loan'}</h2>
                    <button onClick={closeModal}><X className="text-gray-500 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="text-xs text-gray-500 uppercase font-bold ml-1">Loan Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-950 p-3 rounded-xl border border-gray-700 text-white focus:border-blue-500 focus:outline-none" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 uppercase font-bold ml-1">Original Amount</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className="w-full bg-gray-950 p-3 rounded-xl border border-gray-700 text-white focus:border-blue-500 focus:outline-none" required /></div>
                        <div><label className="text-xs text-gray-500 uppercase font-bold ml-1">Current Balance</label><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="w-full bg-gray-950 p-3 rounded-xl border border-gray-700 text-white focus:border-blue-500 focus:outline-none" required /></div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold ml-1">Owner</label>
                        <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-700 mt-1">
                            {['John', 'Hannah', 'Both'].map((person) => (
                                <button key={person} type="button" onClick={() => setOwner(person as any)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${owner === person ? 'bg-gray-800 text-white shadow-sm border border-gray-700' : 'text-gray-500 hover:text-gray-300'}`}>{person}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 uppercase font-bold ml-1">Next Due Date</label><input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="w-full bg-gray-950 p-3 rounded-xl border border-gray-700 text-white focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" /></div>
                        <div><label className="text-xs text-gray-500 uppercase font-bold ml-1">Target Payoff</label><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-gray-950 p-3 rounded-xl border border-gray-700 text-white focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" required /></div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl mt-4 flex justify-center items-center gap-2"><Save size={20} />{editingId ? 'Update Loan' : 'Save Loan'}</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};