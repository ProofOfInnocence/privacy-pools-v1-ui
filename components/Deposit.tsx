'use client'

import React, { useState } from 'react';

const DepositComponent = ({ deposit, balance }: {
    deposit: (amount: string) => void;
    balance: number;
}) => {
    const [amount, setAmount] = useState('');

    const handleMaxClick = () => {
        setAmount(balance.toString());
    };

    const handleDepositClick = () => {
        deposit(amount);
        setAmount(''); // Clearing the input after depositing
    };

    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <input 
                    type="text"
                    placeholder="Enter deposit amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="flex-1 p-2 border rounded"
                />
                <button 
                    onClick={handleMaxClick}
                    className="ml-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    Max
                </button>
            </div>
            <button 
                onClick={handleDepositClick}
                className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
                Deposit
            </button>
        </div>
    );
}

export default DepositComponent;
