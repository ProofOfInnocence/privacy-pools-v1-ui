'use client'

import React, { useState } from 'react';
import { RelayerInfo } from '@/types'

type WithdrawComponentProps = {
  withdrawWithRelayer: (amount: string, recipient: string, relayer: RelayerInfo) => void;
  relayers: RelayerInfo[];
};

const WithdrawComponent: React.FC<WithdrawComponentProps> = ({ withdrawWithRelayer, relayers }) => {
  const [amount, setAmount] = useState('0.0001');
  const [recipient, setRecipient] = useState('0xcbef1A6b6a001eEe4B75d99cf484DCe5D00F8925');
  const [selectedRelayer, setSelectedRelayer] = useState(relayers[0]);

  const handleWithdrawClick = () => {
    withdrawWithRelayer(amount, recipient, selectedRelayer);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block mb-2">Withdraw Amount</label>
        <input
          type="text"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Recipient Address</label>
        <input
          type="text"
          placeholder="Enter recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
{/* 
      <div className="mb-4">
        <label className="block mb-2">Select Relayer</label>
        <select
          value={selectedRelayer.name}
          onChange={(e) => setSelectedRelayer(relayers.find(r => r.name === e.target.value) || relayers[0])}
          className="w-full p-2 border rounded"
        >
          {relayers.map((relayer) => (
            <option key={relayer.name} value={relayer.name}>
              {relayer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Relayer</th>
              <th className="border p-2">Fee</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{selectedRelayer.name}</td>
              <td className="border p-2">{selectedRelayer.fee}</td>
            </tr>
          </tbody>
        </table>
      </div> */}

      <button
        onClick={handleWithdrawClick}
        className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
      >
        Withdraw
      </button>
    </div>
  );
};

export default WithdrawComponent;
