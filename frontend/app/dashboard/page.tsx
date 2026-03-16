"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "@/lib/contracts";

interface LiveEvent {
  id: string;
  type: string;
  amount: string;
  time: string;
}

export default function DashboardPage() {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [latestLedger, setLatestLedger] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);

  const fetchEvents = async () => {
    try {
      const { rpc } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const latest = await server.getLatestLedger();
      const startLedger = Math.max(1, latest.sequence - 100);
      const events = await server.getEvents({
        startLedger: startLedger,
        filters: [{ type: "contract", contractIds: [CONTRACT_ADDRESSES.STAKING] }],
        limit: 20,
      });
      const records = (events as any)?.records || (events as any)?.events || [];
      if (records.length > 0) {
        const newEvents = records.map((e: any) => ({
          id: e.id || Math.random().toString(),
          type: e.topic?.[0]?.toString() || "event",
          amount: e.value?.toString() || "0",
          time: new Date().toLocaleTimeString(),
        }));
        setLiveEvents((prev) => [...newEvents, ...prev].slice(0, 20));
      }
      setLatestLedger(latest.sequence);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    setIsStreaming(true);
    const interval = setInterval(fetchEvents, 5000);
    return () => {
      clearInterval(interval);
      setIsStreaming(false);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-400">
            🌾 YieldFarm
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
            <span className="text-sm text-gray-400">{isStreaming ? "Live" : "Offline"}</span>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-400 mb-8">Real-time Stellar contract event streaming</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Latest Ledger</p>
            <p className="text-2xl font-bold text-blue-400">{latestLedger}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Events Captured</p>
            <p className="text-2xl font-bold text-yellow-400">{liveEvents.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-1">Reward Rate</p>
            <p className="text-2xl font-bold text-purple-400">100 / epoch</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">
              Live Event Feed
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                {isStreaming ? "● LIVE" : "○ OFF"}
              </span>
            </h3>
            <button onClick={fetchEvents} className="text-sm text-green-400 hover:text-green-300 transition">
              Refresh ↺
            </button>
          </div>
          {liveEvents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-4xl mb-3">📡</p>
              <p>Listening for contract events...</p>
              <p className="text-sm mt-1">Events appear here when users stake/unstake</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {event.type.includes("stake") ? "🔒" : event.type.includes("unstake") ? "🔓" : "🎁"}
                    </span>
                    <div>
                      <p className="font-medium capitalize">{event.type}</p>
                      <p className="text-gray-400 text-xs font-mono">{event.id.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{event.amount}</p>
                    <p className="text-gray-500 text-xs">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Token Contract</p>
            
              <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.TOKEN}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 text-xs font-mono break-all hover:text-green-300 underline"
            >
              {CONTRACT_ADDRESSES.TOKEN}
            </a>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Staking Contract</p>
            
             <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.STAKING}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 text-xs font-mono break-all hover:text-green-300 underline"
            >
              {CONTRACT_ADDRESSES.STAKING}
            </a>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/stake" className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-lg transition inline-block">
            Go to Staking →
          </Link>
        </div>
      </div>
    </main>
  );
}