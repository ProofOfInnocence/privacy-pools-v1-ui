"use client";

import { Keypair, Utxo, createTransactionData } from "@/services";
import { toWei } from "web3-utils";

export default function Home() {
  async function deposit() {
    const keypair = new Keypair();
    const output = new Utxo({ amount: toWei("0.1"), keypair });
    const {extData, args} = await createTransactionData({outputs: [output]}, keypair);
    console.log(extData, args);
  }

  return (
    <div>
      <button onClick={deposit}>AJDBHKG</button>
    </div>
  );
}
