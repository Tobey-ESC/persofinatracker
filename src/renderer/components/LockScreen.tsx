import { useState, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';

interface Props {
  onUnlock: () => void;
  isLocked: boolean;
}

// DEFAULT CONFIG
const CORRECT_PIN = "1022";
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const LockScreen = ({ onUnlock, isLocked }: Props) => {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Handle countdown timer if locked out
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutUntil) {
      interval = setInterval(() => {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutUntil(null);
          setAttempts(0);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handlePress = (num: string) => {
    if (lockoutUntil) return;
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit on 4th digit
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === CORRECT_PIN) {
      // Success
      setPin("");
      setAttempts(0);
      onUnlock();
    } else {
      // Fail
      setPin("");
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* ICON & STATUS */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className={`p-6 rounded-full ${lockoutUntil ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {lockoutUntil ? <AlertTriangle size={48} /> : <Lock size={48} />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {lockoutUntil ? "System Locked" : "Enter PIN"}
          </h1>
          <p className="text-gray-400 text-sm text-center">
            {lockoutUntil 
              ? `Too many attempts. Try again in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` 
              : "Secure Financial Tracker"}
          </p>
        </div>

        {/* PIN DOTS */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < pin.length ? 'bg-blue-500 scale-110' : 'bg-gray-800'
              } ${lockoutUntil ? 'bg-red-900' : ''}`}
            />
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {!lockoutUntil && attempts > 0 && (
          <p className="text-red-400 text-sm mb-6 animate-pulse">
            Incorrect PIN ({attempts}/{MAX_ATTEMPTS})
          </p>
        )}

        {/* NUMPAD */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              disabled={!!lockoutUntil}
              onClick={() => handlePress(num.toString())}
              className="h-16 rounded-2xl bg-gray-900 border border-gray-800 text-2xl font-bold text-white hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          <div className="h-16"></div> {/* Spacer */}
          <button
            disabled={!!lockoutUntil}
            onClick={() => handlePress("0")}
            className="h-16 rounded-2xl bg-gray-900 border border-gray-800 text-2xl font-bold text-white hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
          >
            0
          </button>
          <button
            disabled={!!lockoutUntil}
            onClick={handleBackspace}
            className="h-16 rounded-2xl bg-gray-900/50 border border-transparent text-gray-400 hover:text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
          >
            ⌫
          </button>
        </div>

      </div>
    </div>
  );
};