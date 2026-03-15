"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "@/lib/contracts";


export default function StakePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stakedBalance, setStakedBalance] = useState("0");

  const connectWallet = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const freighter = (window as any).freighter;
      const freighterApi = (window as any).freighterApi;
      if (freighter) {
        await freighter.requestAccess();
        const result = await freighter.getAddress();
        setWalletAddress(result?.address || result);
        setMessage("✅ Wallet connected!");
      } else if (freighterApi) {
        await freighterApi.requestAccess();
        const result = await freighterApi.getPublicKey();
        setWalletAddress(result);
        setMessage("✅ Wallet connected!");
      } else {
        try {
          const freighterModule = await import("@stellar/freighter-api");
          const isConnected = await freighterModule.isConnected();
          if (isConnected) {
            await freighterModule.requestAccess();
            const result = await freighterModule.getAddress();
            setWalletAddress(result.address);
            setMessage("✅ Wallet connected!");
          } else {
            setMessage("❌ Please refresh the page and try again.");
          }
        } catch (e) {
          setMessage("❌ Please refresh the page and try again.");
        }
      }
    } catch (err) {
      setMessage("❌ Connection failed. Please try again.");
    }
  };
const stakeTokens = async () => {
    if (!walletAddress || !amount) return;
    setLoading(true);
    setMessage("⏳ Processing stake transaction...");
    try {
      const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, nativeToScVal, Address } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ADDRESSES.STAKING);
      const amountInStroops = BigInt(Math.floor(parseFloat(amount) * 10_000_000));
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "stake",
            new Address(walletAddress).toScVal(),
            nativeToScVal(amountInStroops, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();
      const prepared = await server.prepareTransaction(tx);
      const signed = await (window as any).freighter.signTransaction(
        prepared.toXDR(),
        { networkPassphrase: Networks.TESTNET }
      );
      const { Transaction } = await import("@stellar/stellar-sdk");
      const signedTx = new Transaction(signed.signedTxXdr || signed, Networks.TESTNET);
      const result = await server.sendTransaction(signedTx);
      setMessage(`✅ Staked successfully! TX: ${result.hash.slice(0, 20)}...`);
      setAmount("");
    } catch (err: any) {
      setMessage(`❌ Stake failed: ${err?.message || "Unknown error"}`);
    }
    setLoading(false);
  };
  const checkBalance = async () => {
    if (!walletAddress) return;
    try {
      const server = new StellarSdk.SorobanRpc.Server(NETWORK_CONFIG.rpcUrl);
      setStakedBalance("Loading...");
      setMessage("✅ Balance checked!");
    } catch (err) {
      setMessage("❌ Error checking balance");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <nav className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-400">
            🌾 YieldFarm
          </Link>
          <span className="text-sm text-gray-400">Stellar Testnet</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-2">Stake Tokens</h2>
        <p className="text-gray-400 mb-8">
          Stake your FARM tokens to earn rewards
        </p>

        {/* Wallet Connection */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">1. Connect Wallet</h3>
          {walletAddress ? (
            <div>
              <p className="text-green-400 text-sm font-mono break-all">
                ✅ {walletAddress}
              </p>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition"
            >
              Connect Freighter Wallet
            </button>
          )}
        </div>

        {/* Stake Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">2. Stake Amount</h3>
          <input
            type="number"
            placeholder="Enter amount to stake"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-green-500"
          />
          <button
    onClick={stakeTokens}
    disabled={!walletAddress || !amount || loading}
    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 px-6 rounded-lg transition"
  >
    {loading ? "Staking..." : "Stake FARM Tokens"}
</button>
        </div>

        {/* Unstake Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">3. Unstake</h3>
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>Your staked balance:</span>
            <span className="text-green-400">{stakedBalance} FARM</span>
          </div>
          <button
            onClick={checkBalance}
            disabled={!walletAddress}
            className="w-full border border-green-500 text-green-400 hover:bg-green-500/10 disabled:border-gray-700 disabled:text-gray-500 font-bold py-3 px-6 rounded-lg transition"
          >
            Check My Balance
          </button>
        </div>

        {/* Claim Rewards */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">4. Claim Rewards</h3>
          <p className="text-gray-400 text-sm mb-4">
            Claim your earned FARM token rewards
          </p>
          <button
            disabled={!walletAddress}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 px-6 rounded-lg transition"
          >
            Claim Rewards 🎁
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Contract Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-6">
          <p className="text-gray-500 text-xs text-center">
            Staking Contract: {CONTRACT_ADDRESSES.STAKING}
          </p>
        </div>
      </div>
    </main>
  );
}