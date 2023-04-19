import 'dotenv/config'
import express from "express";
import { port } from "@App/config.js";
import w from "@App/wallet.js";

const app = express();

app.get('/', async (req, res) => {
  res.send(await w.createBitcoinWallet().getAddress(0, 0));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
