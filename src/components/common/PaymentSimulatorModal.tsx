import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, ShieldCheck, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface PaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  amount?: number;
  onSuccess?: () => void;
}

export const PaymentSimulatorModal: React.FC<PaymentSimulatorModalProps> = ({
  isOpen,
  onClose,
  planName = 'Verified Candidate Pro',
  amount = 499,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Contact, 2: Simulator Payment, 3: Success
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      await api.createTransaction({
        type: `SUBSCRIPTION_${planName.toUpperCase().replace(/\s+/g, '_')}`,
        amount,
      });

      setTimeout(() => {
        setProcessing(false);
        setStep(3);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed.');
      setProcessing(false);
    }
  };

  const handleFinish = () => {
    setStep(1);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {planName} Checkout
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Amount: ₹{amount} (Development Payment Gateway)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step Content */}
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4 text-xs font-medium">
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{planName}</span>
                  <span className="text-[11px] text-slate-500">Unlocks AI Interviews, Priority Discovery & Score Report</span>
                </div>
                <span className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400">₹{amount}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 py-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Razorpay Simulator Gateway</p>
                <p className="text-slate-500">Test Payment Mode • Demo Transaction</p>
              </div>

              {processing ? (
                <div className="py-6 space-y-3">
                  <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Authorizing transaction...</p>
                </div>
              ) : (
                <button
                  onClick={handleSimulatePayment}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simulate Successful Payment (₹{amount})</span>
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Payment Successful & Entitlement Activated!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you. Your Hire Me Out Pro features and verified badge priority are now active.
              </p>
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
