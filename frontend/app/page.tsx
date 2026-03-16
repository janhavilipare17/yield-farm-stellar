import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <nav className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">🌾 YieldFarm</h1>
          <span className="text-sm text-gray-400">Stellar Testnet</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Earn <span className="text-green-400">FARM</span> Rewards
        </h2>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
          Stake your tokens on Stellar blockchain and earn FARM token rewards.
          Powered by Soroban smart contracts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/stake" className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-lg transition">
            Start Staking
          </Link>
          <Link href="/dashboard" className="border border-green-500 text-green-400 hover:bg-green-500/10 font-bold py-3 px-8 rounded-lg transition">
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Token Contract</p>
            
              <a href="https://stellar.expert/explorer/testnet/contract/CAIBAOAMQCILYEI3LTM3DUK3G3DA3Q3FG7ON4FBFKOFF7EV46GAKZTWU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 text-xs font-mono break-all hover:text-green-300 underline"
            >
              CAIBAOAMQCILYEI3LTM3DUK3G3DA3Q3FG7ON4FBFKOFF7EV46GAKZTWU
            </a>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Staking Contract</p>
            
              <a href="https://stellar.expert/explorer/testnet/contract/CDK43XOUACVO327NBOWCMYVJ7BDMZ6KNISUA7JOF3UA3F2QH6OJIQ2E4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 text-xs font-mono break-all hover:text-green-300 underline"
            >
              CDK43XOUACVO327NBOWCMYVJ7BDMZ6KNISUA7JOF3UA3F2QH6OJIQ2E4
            </a>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Network</p>
            
             <a href="https://stellar.expert/explorer/testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 font-bold text-lg hover:text-green-300"
            >
              Stellar Testnet ↗
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="font-bold text-lg mb-2">1. Stake</h4>
            <p className="text-gray-400 text-sm">
              Stake your FARM tokens into the Soroban smart contract securely.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-4xl mb-4">⏳</div>
            <h4 className="font-bold text-lg mb-2">2. Earn</h4>
            <p className="text-gray-400 text-sm">
              Earn rewards automatically based on your stake amount and time.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="font-bold text-lg mb-2">3. Claim</h4>
            <p className="text-gray-400 text-sm">
              Claim your FARM token rewards anytime directly to your wallet.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 py-6 mt-10">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          Built on Stellar Soroban • YieldFarm 2026
        </div>
      </footer>
    </main>
  );
}