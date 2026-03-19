import React from 'react';
import { GripHorizontal, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';

interface CalculatorProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

type Operation = '+' | '-' | '*' | '/' | null;

export function Calculator({ onClose, onDragStart }: CalculatorProps) {
  const [display, setDisplay] = React.useState('0');
  const [firstNumber, setFirstNumber] = React.useState<number | null>(null);
  const [operation, setOperation] = React.useState<Operation>(null);
  const [newNumber, setNewNumber] = React.useState(true);
  const { themeColors } = useTheme();
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

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

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgDisplay = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(31, 41, 55)';
  const bgButton = isTerminalTheme ? 'rgb(20, 20, 20)' : 'rgb(31, 41, 55)';
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'transparent';

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: borderColor, backgroundColor: bgMain }}>
        <div
          className="cursor-move p-1 hover:bg-white/10 rounded transition-colors"
          onMouseDown={onDragStart}
        >
          <GripHorizontal className="w-5 h-5" style={{ color: textColor }} />
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-5 h-5" style={{ color: textColor }} />
        </button>
      </div>

      {/* Display */}
      <div className="p-4" style={{ backgroundColor: bgMain }}>
        <div className="p-4 rounded-lg" style={{ backgroundColor: bgDisplay, border: `1px solid ${borderColor}` }}>
          <div className="text-right text-2xl font-mono" style={{ color: textColor }}>
            {display}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="flex-1 grid grid-cols-4 gap-1 p-2" style={{ backgroundColor: bgMain }}>
        <button
          className="col-span-4 rounded transition-colors"
          onClick={handleClear}
          style={{
            backgroundColor: themeColors.primary,
            color: textColor,
            border: isTerminalTheme ? `1px solid ${borderColor}` : 'none'
          }}
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
                  backgroundColor: ['+', '-', '*', '/', '='].includes(btn) ? themeColors.primary : bgButton,
                  color: textColor,
                  border: `1px solid ${borderColor}`
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