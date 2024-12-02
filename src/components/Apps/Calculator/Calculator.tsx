import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

type Operation = '+' | '-' | '*' | '/' | null;

export function Calculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [firstNumber, setFirstNumber] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: Operation) => {
    setOperation(op);
    setFirstNumber(parseFloat(display));
    setNewNumber(true);
  };

  const handleEqual = () => {
    if (firstNumber === null || operation === null) return;
    
    const secondNumber = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = firstNumber + secondNumber;
        break;
      case '-':
        result = firstNumber - secondNumber;
        break;
      case '*':
        result = firstNumber * secondNumber;
        break;
      case '/':
        result = firstNumber / secondNumber;
        break;
      default:
        return;
    }

    setDisplay(result.toString());
    setFirstNumber(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setFirstNumber(null);
    setOperation(null);
    setNewNumber(true);
  };

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+']
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
        <span className="text-sm font-medium text-gray-300">Calculator</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Display */}
      <div className="bg-gray-800 p-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-right text-2xl font-mono text-white">
            {display}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="flex-1 grid grid-cols-4 gap-1 p-2 bg-gray-900">
        <button
          className="col-span-4 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          onClick={handleClear}
        >
          C
        </button>
        
        {buttons.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === '=') handleEqual();
                  else if (['+', '-', '*', '/'].includes(btn)) handleOperation(btn as Operation);
                  else handleNumber(btn);
                }}
                className={`
                  p-4 text-lg font-medium rounded transition-colors
                  ${['+', '-', '*', '/', '='].includes(btn)
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-gray-800 text-white hover:bg-gray-700'}
                `}
              >
                {btn}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
