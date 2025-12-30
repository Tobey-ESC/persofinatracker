import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './lib/supabase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowUpCircle, ArrowDownCircle, Activity, 
  Search, X, Save, Tag, Edit2, LayoutDashboard, Landmark, User, Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { CoreOverview } from './components/dashboard/CoreOverview';
import { ExpenseIntelligence } from './components/dashboard/ExpenseIntelligence';
import { IncomeAnalytics } from './components/dashboard/IncomeAnalytics';
import { TransactionList } from './components/dashboard/TransactionList';
import { LoanTracker } from './components/dashboard/LoanTracker';
import { LockScreen } from './components/LockScreen';

const CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Personal', 
  'Education', 'Debt', 'Savings', 'Salary', 'Freelance', 'Investments', 'Gift', 'Other Income', 'Uncategorized'
];

interface Transaction {
  id: string; type: 'income' | 'expense'; description: string; amount: number; category: string; created_at: string; owner?: 'John' | 'Hannah' | 'Both';
}

function App() {
  // --- LOCK SYSTEM STATE ---
  const [isLocked, setIsLocked] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_LIMIT = 5 * 60 * 1000;

  const [currentView, setCurrentView] = useState<'dashboard' | 'loans'>('dashboard');
  const [dashboardFilter, setDashboardFilter] = useState<'All' | 'John' | 'Hannah'>('All');
  const [activeModal, setActiveModal] = useState<"income" | "expense" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [descInput, setDescInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Uncategorized");
  const [ownerInput, setOwnerInput] = useState<'John' | 'Hannah' | 'Both'>("Both");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!isLocked) { inactivityTimer.current = setTimeout(() => { setIsLocked(true); }, INACTIVITY_LIMIT); }
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach(event => window.addEventListener(event, handler));
    resetInactivityTimer();
    return () => { events.forEach(event => window.removeEventListener(event, handler)); if (inactivityTimer.current) clearTimeout(inactivityTimer.current); };
  }, [isLocked]);

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (data) setTransactions(data);
  };
  useEffect(() => {
    fetchTransactions();
    const channel = supabase.channel('realtime-transactions').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchTransactions()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOwner = dashboardFilter === 'All' ? true : t.owner === dashboardFilter;
      return matchesSearch && matchesOwner;
    });
  }, [transactions, searchQuery, dashboardFilter]);

  const chartData = [...filteredTransactions].reverse().map(t => ({
    date: format(parseISO(t.created_at), 'MMM d'),
    amount: Number(t.amount),
    type: t.type
  }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput || !amountInput) return;
    const amount = parseFloat(amountInput);
    
    if (activeModal === 'edit' && editingId) {
        await supabase.from('transactions').update({ description: descInput, amount, category: categoryInput, owner: ownerInput }).eq('id', editingId);
        setTransactions(prev => prev.map(t => t.id === editingId ? { ...t, description: descInput, amount, category: categoryInput, owner: ownerInput } : t));
    } else {
        const { data } = await supabase.from('transactions').insert({ type: activeModal as any, description: descInput, amount, category: categoryInput, owner: ownerInput }).select().single();
        if (data) setTransactions(prev => [data, ...prev]);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => { if (confirm("Delete?")) { setTransactions(prev => prev.filter(t => t.id !== id)); await supabase.from('transactions').delete().eq('id', id); } };
  const openEdit = (t: Transaction) => { setDescInput(t.description); setAmountInput(t.amount.toString()); setCategoryInput(t.category || "Uncategorized"); setOwnerInput(t.owner || "Both"); setEditingId(t.id); setActiveModal('edit'); };
  const closeModal = () => { setActiveModal(null); setEditingId(null); setDescInput(""); setAmountInput(""); setCategoryInput("Uncategorized"); setOwnerInput("Both"); };

  // Helper to open modal cleanly (reset inputs first)
  const openNew = (type: 'income' | 'expense') => {
    closeModal();
    setActiveModal(type);
  }

  if (isLocked) { return <LockScreen isLocked={isLocked} onUnlock={() => setIsLocked(false)} />; }

  return (
    <div className="h-screen w-screen bg-gray-950 text-white font-sans overflow-hidden flex flex-col relative">
      <div className="p-4 md:p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center bg-gray-900/50 backdrop-blur-md gap-4">
        <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-4 md:gap-8">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Activity className="text-emerald-500" size={24} /> FinanceOS</h1>
            <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                <button onClick={() => setCurrentView('dashboard')} className={`p-2 rounded-md transition-all ${currentView === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}><LayoutDashboard size={18} /></button>
                <button onClick={() => setCurrentView('loans')} className={`p-2 rounded-md transition-all ${currentView === 'loans' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}><Landmark size={18} /></button>
            </div>
        </div>
        {currentView === 'dashboard' && (<div className="relative w-full md:flex-1 md:max-w-md"><Search className="absolute left-3 top-2.5 text-gray-500" size={18} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors" /></div>)}
        <div className="hidden lg:block text-sm text-gray-500"><span className="bg-gray-800 px-2 py-1 rounded border border-gray-700 mx-1">Alt + I</span><span className="bg-gray-800 px-2 py-1 rounded border border-gray-700 mx-1">Alt + E</span></div>
      </div>

      <div className={`flex-1 p-4 md:p-8 overflow-y-auto ${activeModal ? 'blur-sm brightness-50' : ''}`}>
        {currentView === 'loans' ? (<LoanTracker />) : (
            <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div><h2 className="text-xl font-bold text-white mb-1">Overview</h2><p className="text-sm text-gray-400">Data: <span className="text-emerald-400 font-bold">{dashboardFilter === 'All' ? 'Everyone' : dashboardFilter}</span></p></div>
                    <div className="flex w-full md:w-auto bg-gray-900 p-1 rounded-xl border border-gray-700 overflow-x-auto">
                        {['All', 'John', 'Hannah'].map(filter => (<button key={filter} onClick={() => setDashboardFilter(filter as any)} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all ${dashboardFilter === filter ? (filter === 'John' ? 'bg-blue-600 text-white' : filter === 'Hannah' ? 'bg-pink-600 text-white' : 'bg-purple-600 text-white') : 'text-gray-400'}`}>{filter === 'All' ? <Users size={14} /> : <User size={14} />} {filter}</button>))}
                    </div>
                </div>
                <CoreOverview transactions={filteredTransactions} />
                <IncomeAnalytics transactions={filteredTransactions} />
                <ExpenseIntelligence transactions={filteredTransactions} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-1 lg:col-span-2">
                        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-[300px] md:h-[400px] flex flex-col">
                            <h3 className="text-lg font-semibold mb-4 text-gray-300">Trend</h3>
                            <div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} /><Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} itemStyle={{ color: '#fff' }} /><Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
                        </div>
                    </div>
                    <TransactionList transactions={filteredTransactions} onEdit={openEdit} onDelete={handleDelete} />
                </div>
            </>
        )}
      </div>

      {/* --- MOBILE FLOATING ACTION BUTTONS (Hidden on Laptop 'lg') --- */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 lg:hidden z-40">
        <button 
          onClick={() => openNew('income')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg border-2 border-emerald-400/50 flex items-center justify-center transition-transform active:scale-90"
        >
          <ArrowUpCircle size={28} />
        </button>
        <button 
          onClick={() => openNew('expense')}
          className="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-full shadow-lg border-2 border-rose-400/50 flex items-center justify-center transition-transform active:scale-90"
        >
          <ArrowDownCircle size={28} />
        </button>
      </div>

      {activeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-gray-900 border border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl md:text-2xl font-bold flex items-center gap-2 ${activeModal === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{activeModal === 'edit' ? <Edit2 /> : (activeModal === 'income' ? <ArrowUpCircle /> : <ArrowDownCircle />)}{activeModal === 'edit' ? 'Edit' : `New ${activeModal === 'income' ? 'Income' : 'Expense'}`}</h2>
                <button onClick={closeModal}><X className="text-gray-500 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div><label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Description</label><input autoFocus={activeModal !== 'edit'} type="text" value={descInput} onChange={(e) => setDescInput(e.target.value)} placeholder="e.g. Dinner" className="w-full bg-gray-950 text-white text-lg p-3 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 transition-all" /></div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Owner</label>
                <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-700 mt-1">{['John', 'Hannah', 'Both'].map((person) => (<button key={person} type="button" onClick={() => setOwnerInput(person as any)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${ownerInput === person ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500'}`}>{person}</button>))}</div>
              </div>
              <div className="flex gap-4">
                  <div className="flex-1"><label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Amount (₱)</label><input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} placeholder="0.00" className="w-full bg-gray-950 text-white text-lg p-3 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 transition-all" /></div>
                  <div className="flex-1"><label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Category</label><div className="relative"><Tag className="absolute left-3 top-4 text-gray-500" size={16} /><select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} className="w-full bg-gray-950 text-white text-lg p-3 pl-10 rounded-xl border border-gray-700 focus:outline-none focus:border-emerald-500 appearance-none">{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div></div>
              </div>
              <button type="submit" className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"><Save size={20} /> Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;