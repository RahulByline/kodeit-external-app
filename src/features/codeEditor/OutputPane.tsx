import React, { useState } from "react";
import "./styles.css";

type Props = {
  output: string;
  isError?: boolean;
  isWaitingForInput?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onInputSubmit?: (input: string) => void;
  status?: string;
};

export default function OutputPane({ 
  output, 
  isError = false, 
  isWaitingForInput = false,
  inputValue = "",
  onInputChange,
  onInputSubmit,
  status
}: Props) {
  const [localInputValue, setLocalInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalInputValue(value);
    onInputChange?.(value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valueToSubmit = inputValue || localInputValue;
    if (valueToSubmit.trim() && onInputSubmit) {
      onInputSubmit(valueToSubmit);
      setLocalInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit(e);
    }
  };

  return (
    <div className="outputWrap" style={{ color: isError ? "#ff6b6b" : "#ffffff" }}>
      {output || (isError ? "No errors" : "Click 'Run' to see output here...")}
      
      {isWaitingForInput && (
        <div className="input-prompt">
          <form onSubmit={handleInputSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ color: '#4ade80' }}>▶</span>
            <input
              type="text"
              value={inputValue || localInputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter input..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                flex: 1,
                fontFamily: 'monospace'
              }}
              autoFocus
            />
          </form>
        </div>
      )}
      
      {status && (
        <div className="output-status" style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
          {status}
        </div>
      )}
    </div>
  );
}
