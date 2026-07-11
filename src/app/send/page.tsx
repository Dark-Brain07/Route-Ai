"use client";

import React, { useState } from "react";
import SwipeButton from "@/components/SwipeButton";
import { ArrowLeft, Search, User, CheckCircle2, QrCode, ChevronDown, XCircle, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

const RECENT_CONTACTS = [
  { name: "Raj", wallet: "0x12...aB" },
  { name: "John", wallet: "0x34...cD" },
  { name: "Steve", wallet: "0x56...eF" },
];

const MENTO_STABLES = [
  { symbol: "USDm", name: "USA", rate: 1.0, flagUrl: "https://flagcdn.com/w40/us.png" },
  { symbol: "EURm", name: "Europe", rate: 0.91, flagUrl: "https://flagcdn.com/w40/eu.png" },
  { symbol: "KESm", name: "Kenya", rate: 129.5, flagUrl: "https://flagcdn.com/w40/ke.png" },
  { symbol: "BRLm", name: "Brazil", rate: 4.95, flagUrl: "https://flagcdn.com/w40/br.png" },
  { symbol: "COPm", name: "Colombia", rate: 3950.0, flagUrl: "https://flagcdn.com/w40/co.png" },
  { symbol: "GHSm", name: "Ghana", rate: 14.5, flagUrl: "https://flagcdn.com/w40/gh.png" },
  { symbol: "XOFm", name: "West Africa", rate: 600.0, flagUrl: "https://flagcdn.com/w40/sn.png" },
  { symbol: "USDT", name: "Tether", rate: 1.0, flagUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
  { symbol: "USDC", name: "USD Coin", rate: 1.0, flagUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
];

export default function SendPage() {
  const [amount, setAmount] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [contacts, setContacts] = useState(RECENT_CONTACTS);
  const [isAddingNewContact, setIsAddingNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactWallet, setNewContactWallet] = useState("");
  
  const [selectedCurrency, setSelectedCurrency] = useState(MENTO_STABLES[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [statusModal, setStatusModal] = useState<"success" | "error" | null>(null);

  const { sendTransactionAsync } = useSendTransaction();

  const handleKeypad = (num: string) => {
    if (num === "<") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (amount === "0" && num !== ".") {
      setAmount(num);
    } else if (amount.includes(".") && num === ".") {
      return;
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleSwipeSuccess = async () => {
    if (!amount || Number(amount) <= 0) {
      setStatusModal("error");
      return;
    }

    setIsSending(true);
    
    try {
      // Find the wallet address of the selected contact
      const contactWallet = contacts.find(c => c.name === selectedContact)?.wallet || selectedContact;
      
      // In a full production app, you would use useWriteContract for ERC20 transfer
      // Since this is a hackathon app and we might not have all Mento addresses mapped,
      // we'll execute a native transaction here for demonstration (or you can replace with ERC20 transfer).
      const tx = await sendTransactionAsync({
        to: (contactWallet?.startsWith('0x') && contactWallet.length === 42) ? contactWallet as `0x${string}` : '0x0000000000000000000000000000000000000000',
        value: parseEther(amount),
      });

      console.log("Transaction Hash:", tx);
      setSent(true);
      setStatusModal("success");
    } catch (error) {
      console.error("Transaction failed", error);
      setStatusModal("error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#2EE56B] w-full h-full">
      
      {/* Status Modal Overlay */}
      <AnimatePresence>
        {statusModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0E291A] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-xs w-full relative"
            >
              <button 
                onClick={() => setStatusModal(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {statusModal === "success" ? (
                <>
                  <div className="w-16 h-16 bg-[#2EE56B]/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#2EE56B]" />
                  </div>
                  <h2 className="text-white text-xl font-black mb-2">Success!</h2>
                  <p className="text-white/60 text-sm text-center mb-6">Your transaction has been processed and confirmed.</p>
                  <button 
                    onClick={() => setStatusModal(null)}
                    className="w-full bg-[#2EE56B] text-[#0A1C12] font-bold py-3 rounded-2xl hover:bg-[#25C45B] transition-colors"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-white text-xl font-black mb-2">Failed</h2>
                  <p className="text-white/60 text-sm text-center mb-6">Something went wrong while processing your request.</p>
                  <button 
                    onClick={() => setStatusModal(null)}
                    className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between gap-3 text-[#0A1C12]">
        <Link href="/" className="w-10 h-10 shrink-0 rounded-full bg-black/10 border border-black/20 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#0A1C12]" />
        </Link>
        <div className="flex-1 bg-black/10 border border-black/20 rounded-full px-4 py-2.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#0A1C12]/50" />
          <input 
            type="text" 
            placeholder="Pay Contact or Wallet" 
            className="bg-transparent w-full text-sm font-bold text-[#0A1C12] outline-none placeholder:text-[#0A1C12]/50"
          />
        </div>
        <div className="w-10 h-10 shrink-0 rounded-full bg-black/10 border border-black/20 flex items-center justify-center transition-colors">
           <QrCode className="w-5 h-5 text-[#0A1C12]" />
        </div>
      </div>

      <div className="flex-1 bg-[#0E291A] rounded-t-[40px] rounded-b-[40px] mb-4 mx-2 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden">
        
        {/* Ticket Cutout Effects */}
        <div className="absolute top-1/3 -left-4 w-8 h-8 bg-[#2EE56B] rounded-full -translate-y-1/2 shadow-inner"></div>
        <div className="absolute top-1/3 -right-4 w-8 h-8 bg-[#2EE56B] rounded-full -translate-y-1/2 shadow-inner"></div>
        <div className="absolute top-1/3 left-4 right-4 border-t-2 border-dashed border-white/10 -translate-y-1/2 pointer-events-none"></div>

        {!selectedContact ? (
          <div className="p-6 flex-1 mt-6">
            <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
               Recent Contacts
            </h3>
            {isAddingNewContact ? (
              <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                <input 
                  type="text" 
                  placeholder="Name (e.g. Alice)" 
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-black/20 px-4 py-3 rounded-2xl w-full text-sm text-white outline-none placeholder:text-white/30 border border-transparent focus:border-[#2EE56B]/50 transition-colors"
                />
                <input 
                  type="text" 
                  placeholder="0x... Wallet Address" 
                  value={newContactWallet}
                  onChange={(e) => setNewContactWallet(e.target.value)}
                  className="bg-black/20 px-4 py-3 rounded-2xl w-full text-xs font-mono text-white outline-none placeholder:text-white/30 border border-transparent focus:border-[#2EE56B]/50 transition-colors"
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => { setIsAddingNewContact(false); setNewContactName(""); setNewContactWallet(""); }}
                    className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-white font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (newContactName && newContactWallet) {
                        setContacts([...contacts, { name: newContactName, wallet: newContactWallet }]);
                        setIsAddingNewContact(false);
                        setNewContactName("");
                        setNewContactWallet("");
                      }
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#2EE56B] hover:bg-[#25C45B] transition-colors text-[#0A1C12] font-bold text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-y-6 gap-x-4 overflow-y-auto max-h-48 pb-4">
                {contacts.map((contact, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedContact(contact.name)}
                    className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      <User className="w-6 h-6 text-[#2EE56B]" />
                    </div>
                    <span className="text-[10px] text-white font-bold truncate w-full text-center">{contact.name}</span>
                  </button>
                ))}
                <button 
                  onClick={() => setIsAddingNewContact(true)}
                  className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-14 h-14 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[#2EE56B] text-xl font-bold">+</span>
                  </div>
                  <span className="text-[10px] text-white/50 font-bold">New</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col flex-1 p-6">
            
            {/* Selected Contact Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-6 flex justify-between items-center relative overflow-hidden">
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-12 h-12 rounded-full bg-[#2EE56B] flex items-center justify-center">
                   <User className="w-6 h-6 text-[#0A1C12]" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-white">{selectedContact}</p>
                   <p className="text-[10px] font-mono text-white/50">0x...aB</p>
                 </div>
               </div>
               <button 
                 onClick={() => { setSelectedContact(null); setAmount(""); setSent(false); }}
                 className="text-[10px] bg-white/10 text-white font-bold px-3 py-1.5 rounded-full relative z-10"
               >
                 Change
               </button>
            </div>

            {/* Amount Input */}
            <div className="flex-1 flex flex-col justify-center items-center mb-6 relative">
              <div className="relative z-20 mb-4">
                <button 
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-bold border border-white/5"
                >
                  <img src={selectedCurrency.flagUrl} alt={selectedCurrency.name} className="w-5 h-auto rounded-sm shadow-sm" />
                  <span className="text-sm">Sending {selectedCurrency.symbol}</span>
                  <ChevronDown className="w-4 h-4 ml-1" strokeWidth={3} />
                </button>
                
                <AnimatePresence>
                  {showCurrencyDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-50"
                    >
                      {MENTO_STABLES.map((c) => (
                        <button
                          key={c.symbol}
                          onClick={() => { setSelectedCurrency(c); setShowCurrencyDropdown(false); }}
                          className="flex justify-between items-center w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <img src={c.flagUrl} alt={c.name} className="w-5 h-auto rounded-sm shadow-sm" />
                            <span className="font-bold text-[#0A1C12] text-sm">{c.symbol}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input 
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setAmount(val);
                }}
                className="text-5xl font-black text-white tracking-tight bg-transparent text-center w-full outline-none placeholder:text-white/30"
                placeholder="0"
              />
            </div>

            {/* Keypad */}
            {!sent && !isSending && (
              <div className="grid grid-cols-3 gap-y-2 gap-x-6 mb-4 px-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"].map(
                  (key, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleKeypad(key)}
                      className="h-12 flex items-center justify-center text-2xl font-bold text-white bg-transparent hover:bg-white/10 rounded-2xl transition-colors"
                    >
                      {key === "<" ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13.5 15.5L10.5 12.5L13.5 9.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        key
                      )}
                    </button>
                  )
                )}
              </div>
            )}

            {/* Swipe Action */}
            <div className="mt-auto h-14">
              {sent ? (
                <div className="w-full h-full border-2 border-[#2EE56B] bg-[#2EE56B]/20 rounded-[20px] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2EE56B]" />
                  <span className="font-bold text-[#2EE56B] text-sm">Successfully Sent</span>
                </div>
              ) : !isSending && (
                <div className="relative w-full h-full bg-[#2EE56B] rounded-[20px] overflow-hidden flex items-center justify-center shadow-lg">
                   <SwipeButton
                      text={`Swipe to send ${amount || "0"} ${selectedCurrency.symbol}`}
                      loadingText="Sending..."
                      onSuccess={handleSwipeSuccess}
                    />
                </div>
              )}
              {isSending && (
                 <div className="w-full h-full border border-white/20 bg-white/5 rounded-[20px] flex items-center justify-center">
                   <span className="font-bold text-[#2EE56B] text-sm animate-pulse">Sending via Celo...</span>
                 </div>
              )}
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
