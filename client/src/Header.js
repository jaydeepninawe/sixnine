import React, { useState, useEffect } from "react";
const ethers = require("ethers");
import "./Header.css";

const Header = ({ user_balance }) => {
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0); // Local balance state
  const [wallet, setWallet] = useState(null); // Wallet state

  useEffect(() => {
    setBalance(user_balance);
  }, [user_balance]);

  const simulateWallet = () => {
    try {
      // Check if wallet is already connected
      if (connected) {
        alert("Wallet is already connected!");
        return;
      }

      // Create a random wallet
      const newWallet = ethers.Wallet.createRandom();

      // Save the wallet in state
      setWallet(newWallet);

      // Set connected to true
      setConnected(true);

      // Display wallet details
      console.log("Wallet Address:", newWallet.address);
      alert("Wallet connected!");
    
    } catch (error) {
      console.error("Error simulating wallet:", error);
    }
  };

  // Function to disconnect the wallet
  const disconnectWallet = () => {
    setConnected(false);
    setWallet(null);
    setBalance(0); // Reset balance
    alert("Wallet disconnected!");
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>Dice Game</h1>
      </div>

      {connected && wallet && (
        <div className="wallet-info">
          <p>Wallet Address: {wallet.address}</p>
          <p>Balance: {balance} ETH</p>
        </div>
      )}

      <div className="join-button" onClick={connected ? disconnectWallet : simulateWallet}>
        {connected ? "Disconnect Wallet" : "Connect Wallet"}
      </div>
    </header>
  );
};

export default Header;