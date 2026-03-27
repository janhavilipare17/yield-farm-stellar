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
  const [tokenBalance, setTokenBalance] = useState("0");
  const [pendingRewards, setPendingRewards] = useState("0");

  const connectWallet = async () => {
    try {
      const freighter = await import("@stellar/freighter-api");
      await freighter.requestAccess();
      const result = await freighter.getAddress();
      if (result.address) {
        setWalletAddress(result.address);
        setMessage("✅ Wallet connected!");
        await fetchTokenBalance(result.address);
      } else {
        setMessage("❌ Could not get address. Try again.");
      }
    } catch (err: any) {
      setMessage(`❌ ${err?.message || "Failed to connect wallet"}`);
    }
  };

  const fetchTokenBalance = async (address: string) => {
    try {
      const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, Address, scValToNative } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const account = await server.getAccount(address);
      const contract = new Contract(CONTRACT_ADDRESSES.TOKEN);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call("balance", new Address(address).toScVal()))
        .setTimeout(30)
        .build();
      const result = await server.simulateTransaction(tx);
      if ("result" in result && result.result) {
        const balance = scValToNative(result.result.retval);
        setTokenBalance((Number(balance) / 10_000_000).toFixed(2));
      }
    } catch (err) {
      console.error("Error fetching token balance:", err);
    }
  };

  const getTestTokens = async () => {
    if (!walletAddress) {
      setMessage("❌ Please connect wallet first!");
      return;
    }
    setLoading(true);
    setMessage("⏳ Getting test FARM tokens...");
    try {
      const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, Address } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ADDRESSES.TOKEN);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call("faucet", new Address(walletAddress).toScVal()))
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
      setMessage(`✅ Got 100 FARM tokens! TX: ${result.hash.slice(0, 20)}...`);
      setTimeout(() => fetchTokenBalance(walletAddress), 3000);
    } catch (err: any) {
      setMessage(`❌ Faucet failed: ${err?.message || "Unknown error"}`);
    }
    setLoading(false);
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
      setTimeout(() => { checkBalance(); fetchTokenBalance(walletAddress); }, 3000);
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
      setTimeout(() => { checkBalance(); fetchTokenBalance(walletAddress); }, 3000);
    } catch (err: any) {
      setMessage(`❌ Unstake failed: ${err?.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  const checkBalance = async () => {
    if (!walletAddress) return;
    setStakedBalance("Loading...");
    try {
      const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, Address, scValToNative } = await import("@stellar/stellar-sdk");
      const server = new rpc.Server(NETWORK_CONFIG.rpcUrl);
      const account = await server.getAccount(walletAddress);
      const contract = new Contract(CONTRACT_ADDRESSES.STAKING);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call("get_stake", new Address(walletAddress).toScVal()))
        .setTimeout(30)
        .build();
      const result = await server.simulateTransaction(tx);
      if ("result" in result && result.result) {
        const balance = scValToNative(result.result.retval);
        const readableBalance = (Number(balance) / 10_000_000).toFixed(2);
        setStakedBalance(readableBalance);
        setMessage(`✅ Staked balance: ${readableBalance} FARM`);
      } else {
        setStakedBalance("0");
      }

      // Also fetch pending rewards
      const rewardTx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call("get_rewards", new Address(walletAddress).toScVal()))
        .setTimeout(30)
        .build();
      const rewardResult = await server.simulateTransaction(rewardTx);
      if ("result" in rewardResult && rewardResult.result) {
        const rewards = scValToNative(rewardResult.result.retval);
        setPendingRewards((Number(rewards) / 10_000_000).toFixed(4));
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
        .addOperation(contract.call("claim_rewards", new Address(walletAddress).toScVal()))
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
      setTimeout(() => fetchTokenBalance(walletAddress), 3000);
    } catch (err: any) {
      setMessage(`❌ Claim failed: ${err?.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-400">🌾 YieldFarm</Link>
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
            <div>
              <p className="text-green-400 text-sm font-mono break-all mb-3">✅ {walletAddress}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">FARM Balance</p>
                  <p className="text-green-400 font-bold">{tokenBalance} FARM</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">Staked</p>
                  <p className="text-blue-400 font-bold">{stakedBalance} FARM</p>
                </div>
              </div>
            </div>
          ) : (
           <button onClick={connectWallet} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-lg transition">
               Connect Freighter Wallet
            </button>
          )}
        </div>

        {/* Get Test Tokens */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">2. Get Test FARM Tokens</h3>
          <p className="text-gray-400 text-sm mb-4">
            New to the app? Get 100 free FARM tokens to start staking!
          </p>
          
          <button
            onClick={getTestTokens}
            disabled={!walletAddress || loading}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Processing..." : "🪙 Get 100 Test FARM Tokens"}
          </button>
        </div>

        {/* Stake */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">3. Stake FARM Tokens</h3>
          <p className="text-gray-400 text-sm mb-4">
            Stake your FARM tokens to earn rewards over time
          </p>
          
          <input
            type="number"
            placeholder="Enter amount to stake (e.g. 10)"
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
            {loading ? "Processing..." : "🔒 Stake FARM Tokens"}
          </button>
        </div>

        {/* Unstake */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">4. Unstake Tokens</h3>
          <p className="text-gray-400 text-sm mb-4">Withdraw your staked FARM tokens back to your wallet</p>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Staked balance:</span>
            <span className="text-green-400 font-bold">{stakedBalance} FARM</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Pending rewards:</span>
            <span className="text-yellow-400 font-bold">{pendingRewards} FARM</span>
          </div>
          <button
            onClick={checkBalance}
            disabled={!walletAddress}
            className="w-full border border-green-500 text-green-400 hover:bg-green-500/10 disabled:border-gray-700 disabled:text-gray-500 font-bold py-3 px-6 rounded-lg transition mb-4"
          >
            🔍 Check My Balance & Rewards
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
            {loading ? "Processing..." : "🔓 Unstake FARM Tokens"}
          </button>
        </div>

        {/* Claim Rewards */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">5. Claim Rewards</h3>
          <p className="text-gray-400 text-sm mb-2">Claim your earned FARM token rewards</p>
          
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-400">Pending rewards:</span>
            <span className="text-yellow-400 font-bold">{pendingRewards} FARM</span>
          </div>
          <button
            onClick={claimRewards}
            disabled={!walletAddress || loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? "Claiming..." : "🎁 Claim Rewards"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center mb-6">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Contract Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs text-center mb-2">Contract Addresses</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Token:</span>
              
               <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.TOKEN}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 text-xs font-mono hover:text-green-300 underline"
              >
                {CONTRACT_ADDRESSES.TOKEN.slice(0, 20)}...
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Staking:</span>
              
               <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.STAKING}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 text-xs font-mono hover:text-green-300 underline"
              >
                {CONTRACT_ADDRESSES.STAKING.slice(0, 20)}...
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}