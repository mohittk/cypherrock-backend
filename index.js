const bitcoin = require("bitcoinjs-lib");
const bip39 = require("bip39");
const { BIP32Factory } = require("bip32");
const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 5000;
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res){
  res.send("Hello bro!")
})

app.post("/getBalance", async (req, res) => {
  try {
    const { mnemonic } = req.body;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const account = root.derivePath("m/44'/0'/0'/0/0");

    console.log("Mnemonic:", mnemonic);
    console.log("Extended Public Key (xpub):", account.neutered().toBase58());

    const newIndex = 1; // 0-indexed
    const derivedNode = root.derive(newIndex);
    const address = bitcoin.payments.p2pkh({
      pubkey: derivedNode.publicKey,
      network: bitcoin.networks.testnet,
    }).address;

    const details = await getAddressDetails(address);
    res.json({balance: details.balance});
    
  } catch (err) {
    console.error(err);
  }
});

// const mnemonic = bip39.generateMnemonic();
// console.log(`Newly derived address at index ${newIndex}:`, address);


async function getAddressDetails(address) {
  try {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`
    );
    const details = await response.json();
    console.log(`Details for address ${address}:`, details);
    return details;
  } catch (error) {
    console.error(
      `Error fetching details for address ${address}:`,
      error.message
    );
  }
}

// Fetch details for the newly derived address
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
