"use client";
import { useState } from "react";
import Link from "next/link";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "@/lib/contracts";

export default function StakePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stakedBalance, setStakedBalance] = useState("0");

  const connectWallet = async () => {
    try {
      const freighter = await import("@stellar/freighter-api");
      await freighter.requestAccess();
      const result = await freighter.getAddress();
      if (result.address) {
        setWalletAddress(result.address);
        setMessage("✅ Wallet connected!");
      } else {
        setMessage("❌ Could not get address. Try again.");
      }
    } catch (err: any) {
      setMessage(`❌ ${err?.message || "Failed to connect wallet"}`);
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
      const freighterModule = await import("@stellar/freighter-api");
      const signed = await freighterModule.signTransaction(
        prepared.toXDR(),
        { networkPassphrase: Networks.TESTNET }
      );
      const { Transaction } = await import("@stellar/stellar-sdk");
      const signedTx = new Transaction(signed.signedTxXdr || (signed as any), Networks.TESTNET);
      const result = await server.sendTransaction(signedTx);
      setMessage(`✅ Staked successfully! TX: ${result.hash.slice(0, 20)}...`);
      setAmount("");
    } catch (err: any) {
      setMessage(`❌ Stake failed: ${err?.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  const unstakeTokens = async () => {
    if (!walletAddress || !unstakeAmount) return;
    setLoading(true);
    setMessage("⏳ Processing unstake transaction...");
    try {
      const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, nativeToScVal, Address } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ADDRESSES.STAKING);
      const amountInStroops = BigInt(Math.floor(parseFloat(unstakeAmount) * 10_000_000));
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "unstake",
            new Address(walletAddress).toScVal(),
            nativeToScVal(amountInStroops, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();
      const prepared = await server.prepareTransaction(tx);
      const freighterModule = await import("@stellar/freighter-api");
      const signed = await freighterModule.signTransaction(
        prepared.toXDR(),
        { networkPassphrase: Networks.TESTNET }
      );
      const { Transaction } = await import("@stellar/stellar-sdk");
      const signedTx = new Transaction(signed.signedTxXdr || (signed as any), Networks.TESTNET);
      const result = await server.sendTransaction(signedTx);
      setMessage(`✅ Unstaked successfully! TX: ${result.hash.slice(0, 20)}...`);
      setUnstakeAmount("");
      checkBalance();
    } catch (err: any) {
      setMessage(`❌ Unstake failed: ${err?.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  const checkBalance = async () => {
    if (!walletAddress) return;
    setStakedBalance("Loading...");
    try {
      const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, Address } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ADDRESSES.STAKING);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "get_stake",
            new Address(walletAddress).toScVal(),
          )
        )
        .setTimeout(30)
        .build();
      const result = await server.simulateTransaction(tx);
      if ("result" in result && result.result) {
        const { scValToNative } = await import("@stellar/stellar-sdk");
        const balance = scValToNative(result.result.retval);
        const readableBalance = (Number(balance) / 10_000_000).toFixed(2);
        setStakedBalance(readableBalance);
        setMessage(`✅ Your staked balance: ${readableBalance} FARM`);
      } else {
        setStakedBalance("0");
        setMessage("✅ No tokens staked yet");
      }
    } catch (err: any) {
      setStakedBalance("0");
      setMessage(`❌ Error: ${err?.message || "Could not fetch balance"}`);
    }
  };

  const claimRewards = async () => {
    if (!walletAddress) return;
    setLoading(true);
    setMessage("⏳ Claiming rewards...");
    try {
      const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, Address } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ADDRESSES.STAKING);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            "claim_rewards",
            new Address(walletAddress).toScVal(),
          )
        )
        .setTimeout(30)
        .build();
      const prepared = await server.prepareTransaction(tx);
      const freighterModule = await import("@stellar/freighter-api");
      const signed = await freighterModule.signTransaction(
        prepared.toXDR(),
        { networkPassphrase: Networks.TESTNET }
      );
      const { Transaction } = await import("@stellar/stellar-sdk");
      const signedTx = new Transaction(signed.signedTxXdr || (signed as any), Networks.TESTNET);
      const result = await server.sendTransaction(signedTx);
      setMessage(`✅ Rewards claimed! TX: ${result.hash.slice(0, 20)}...`);
    } catch (err: any) {
      setMessage(`❌ Claim failed: ${err?.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
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
        <p className="text-gray-400 mb-8">Stake your FARM tokens to earn rewards</p>

        {/* Connect Wallet */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">1. Connect Wallet</h3>
          {walletAddress ? (
            <p className="text-green-400 text-sm font-mono break-all">✅ {walletAddress}</p>
          ) : (
            <button onClick={connectWallet} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition">
              Connect Freighter Wallet
            </button>
          )}
        </div>

        {/* Stake */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">2. Stake Amount</h3>
          <p className="text-gray-400 text-sm mb-4">Stake FARM tokens to start earning rewards</p>
          <input
            type="number"
            placeholder="Enter amount to stake"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoComplete="off"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={stakeTokens}
            disabled={!walletAddress || !amount || loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Processing..." : "Stake FARM Tokens"}
          </button>
        </div>

        {/* Unstake */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">3. Unstake</h3>
          <p className="text-gray-400 text-sm mb-4">Withdraw your staked FARM tokens</p>
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>Your staked balance:</span>
            <span className="text-green-400 font-bold">{stakedBalance} FARM</span>
          </div>
          <button
            onClick={checkBalance}
            disabled={!walletAddress}
            className="w-full border border-green-500 text-green-400 hover:bg-green-500/10 disabled:border-gray-700 disabled:text-gray-500 font-bold py-3 px-6 rounded-lg transition mb-4"
          >
            Check My Balance
          </button>
          <input
            type="number"
            placeholder="Enter amount to unstake"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            autoComplete="off"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={unstakeTokens}
            disabled={!walletAddress || !unstakeAmount || loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Processing..." : "Unstake FARM Tokens"}
          </button>
        </div>

        {/* Claim Rewards */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">4. Claim Rewards</h3>
          <p className="text-gray-400 text-sm mb-4">Claim your earned FARM token rewards</p>
          <button
            onClick={claimRewards}
            disabled={!walletAddress || loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Claiming..." : "Claim Rewards 🎁"}
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
            Staking Contract:{" "}
            
              <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.STAKING}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 underline"
            >
              {CONTRACT_ADDRESSES.STAKING}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}