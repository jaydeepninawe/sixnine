const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const {ethers} = require('ethers');
require ('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

let playerBalance = 1000; // Initial balance

// Generate a provably fair roll
function generateRoll(serverSeed, clientSeed) {
    const hash = crypto.createHash('sha256').update(serverSeed + clientSeed).digest('hex');
    const roll = (parseInt(hash.substring(0, 8), 16) % 6) + 1;
    return { roll, hash };
}

app.post('/roll-dice', (req, res) => {
    const { betAmount, clientSeed } = req.body;
    if (betAmount > playerBalance || betAmount <= 0) {
        return res.status(400).json({ error: 'Invalid bet amount' });
    }
    
    const serverSeed = crypto.randomBytes(16).toString('hex');
    const { roll, hash } = generateRoll(serverSeed, clientSeed);
    
    let result = 'lost';
    
    if (roll >= 4) {
        playerBalance += betAmount * 2;
        result = 'won';
    }else{
        playerBalance -= betAmount;
    }
    
    res.json({ roll, result, balance: playerBalance, hash ,serverSeed});
});

app.get('/balance', (req, res) => {
    res.json({ balance: playerBalance });
});


app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT}`));
