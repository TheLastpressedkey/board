import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface CalculatorProps {
  onClose: () => void;
}

type Operation = '+' | '-' | '*' | '/' | null;

export function Calculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = React.useState('0');
  const [firstNumber, setFirstNumber] = React.useState<number | null>(null);
  const [operation, setOperation] = React.useState<Operation>(null);
  const [newNumber, setNewNumber] = React.useState(true);
  const { themeColors } = useTheme();

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
          className="col-span-4 text-white rounded transition-colors"
          onClick={handleClear}
          style={{ backgroundColor: themeColors.primary }}
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
                className="p-4 text-lg font-medium rounded transition-colors"
                style={{
                  backgroundColor: ['+', '-', '*', '/', '='].includes(btn) ? themeColors.primary : 'rgb(31, 41, 55)',
                  color: 'white'
                }}
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