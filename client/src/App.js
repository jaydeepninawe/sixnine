  import React, { useEffect, useState } from "react";
  import "./App.css";
  import crypto from "crypto";
  import Dice from "react-dice-roll";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css"; 
  import Header from "./Header";

  const App = () => {
    const [balance, setBalance] = useState(1000);
    const [betAmount, setBetAmount] = useState(10);
    const [rollResult, setRollResult] = useState(null);
    const [hash, setHash] = useState("");
    const [serverSeed, setServerSeed] = useState("");
    const [clientSeed, setClientSeed] = useState("");
    const [isFair, setIsFair] = useState(null);
    const [connected, setConnected] = useState(true);
    const [rolling, setRolling] = useState(false);

    useEffect(() => {
      fetch("http://localhost:4000/balance")
        .then((res) => res.json())
        .then((data) => setBalance(data.balance))
        .catch((error) => console.error("Error fetching balance:", error));
    }, []);

    const rollDice = async () => {
      if (betAmount <= 0 || betAmount > balance) {
        toast.warn("Enter a valid bet amount!", { position: "top-right" });
        return;
      }

      if (!connected) {
        toast.error("Please connect to your wallet!", { position: "top-right" });
        return;
      }

      setRolling(true); // Start animation

      const newClientSeed = Math.random().toString(36).substring(7);
      setClientSeed(newClientSeed);

      try {
        const res = await fetch("http://localhost:4000/roll-dice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ betAmount, clientSeed: newClientSeed }),
        });

        const data = await res.json();
        setTimeout(() => {
          setRollResult(data.roll);
          setBalance(data.balance);
          setHash(data.hash);
          setServerSeed(data.serverSeed);
          setRolling(false); // Stop animation

          // 🎉 Show toast notification based on result
          if (data.roll >= 4) {
            toast.success(`🎉 You rolled ${data.roll}! You win!`, { position: "top-right" });
          } else {
            toast.error(`😢 You rolled ${data.roll}. You lose!`, { position: "top-right" });
          }
        }, 2000); // Simulating dice roll time
      } catch (error) {
        console.error("Error rolling dice:", error);
        setRolling(false);
      }
    };

    const verifyFairness = () => {
      if (!serverSeed || !clientSeed || !hash) return;

      const computedHash = crypto
        .createHash("sha256")
        .update(serverSeed + clientSeed)
        .digest("hex");

      const computedRoll = (parseInt(computedHash.substring(0, 8), 16) % 6) + 1;
      const fairness = computedHash === hash && computedRoll === rollResult;

      setIsFair(fairness);
      
      // 🎉 Show toast notification for fairness verification
      if (fairness) {
        toast.success("✅ The game is fair!", { position: "top-right" });
      } else {
        toast.error("❌ The game is unfair!", { position: "top-right" });
      }
    };

    return (
      <>
      <Header user_balance={balance}/>
      <div className="app-container">
        {/* Left Section */}
        <div className="game-container">
          <h1>🎲 Dice Betting Game 🎲</h1>
          {connected ? (
            <p className="balance">Balance: {balance} ETH</p>
          ) : (
            <p className="balance warning">Wallet not connected</p>
          )}

          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="bet-input"
            placeholder="Enter Bet Amount"
          />

          <button onClick={rollDice} className="roll-button" disabled={rolling}>
            {rolling ? "Rolling..." : "Roll Dice"}
          </button>

          {/* Dice Display */}
          <div className="dice-container">
            {rolling ? (
              <div className="dice-animation">🎲</div>
            ) : (
              rollResult !== null && (
                <Dice key={rollResult} size={100} defaultValue={rollResult} />
              )
            )}
          </div>
        </div>

        {/* Right Section - Fairness */}
        <div className="fairness-section">
          {hash && <p className="hash"> {hash}</p>}

          {serverSeed && (
            <>
              <div className="seed-container">
                <p className="server-seed">Server Seed: {serverSeed}</p>
                <p className="client-seed">Client Seed: {clientSeed}</p>
              </div>
              <button onClick={verifyFairness} className="verify-button">
                Verify Fairness
              </button>
            </>
          )}
        </div>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
      </>
    );
  };

  export default App;
