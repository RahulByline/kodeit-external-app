import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import "./styles.css";

type Props = {
  isActive: boolean;
  executionId?: string;
};

export default function TerminalPane({ isActive, executionId }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    if (!terminal.current && terminalRef.current) {
      terminal.current = new Terminal({
        theme: {
          background: "#1e1e1e",
          foreground: "#ffffff",
          cursor: "#ffffff",
          selection: "#3a3a3a"
        },
        fontSize: 14,
        fontFamily: "Consolas, 'Courier New', monospace",
        cursorBlink: true,
        rows: 24,
        cols: 80
      });

      fitAddon.current = new FitAddon();
      terminal.current.loadAddon(fitAddon.current);
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();

      // Connect to WebSocket terminal backend
      connectToTerminal();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isActive]);

  const connectToTerminal = () => {
    if (!terminal.current) return;

    try {
      // Connect to our interactive execution WebSocket server
      ws.current = new WebSocket("ws://localhost:5000");
      
      ws.current.onopen = () => {
        setIsConnected(true);
        terminal.current?.write("Interactive execution terminal connected.\r\n");
        if (executionId) {
          terminal.current?.write(`Execution ID: ${executionId}\r\n`);
        }
        terminal.current?.write("Type your input when prompted:\r\n\r\n");
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
                     if (message.type === 'connected') {
             terminal.current?.write(`${message.message}\r\n`);
           } else if (message.type === 'output') {
             terminal.current?.write(message.data);
           } else if (message.type === 'error') {
             terminal.current?.write(`\x1b[31m${message.data}\x1b[0m`); // Red color for errors
           }
        } catch (error) {
          // Fallback for non-JSON messages
          terminal.current?.write(event.data);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        terminal.current?.write("\r\n\r\nTerminal disconnected.\r\n");
      };

      ws.current.onerror = () => {
        setIsConnected(false);
        terminal.current?.write("\r\n\r\nTerminal connection failed. Make sure the backend server is running.\r\n");
      };

      terminal.current.onData((data) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          if (executionId) {
            // Send input to the interactive execution
            ws.current.send(JSON.stringify({
              type: 'input',
              executionId: executionId,
              input: data
            }));
          } else {
            // For regular terminal input, just echo it back
            terminal.current?.write(data);
          }
        }
      });
    } catch (error) {
      terminal.current?.write("\r\n\r\nTerminal unavailable. Backend server may not be running.\r\n");
    }
  };

  const handleReconnect = () => {
    if (terminal.current) {
      terminal.current.clear();
      connectToTerminal();
    }
  };

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div style={{ 
        position: "absolute", 
        top: "8px", 
        right: "8px", 
        zIndex: 10,
        display: "flex",
        gap: "8px",
        alignItems: "center"
      }}>
        <div style={{ 
          fontSize: "12px", 
          color: isConnected ? "#28a745" : "#dc3545",
          fontWeight: "bold"
        }}>
          {isConnected ? "● Connected" : "● Disconnected"}
        </div>
        <button 
          onClick={handleReconnect}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          Reconnect
        </button>
      </div>
      <div 
        ref={terminalRef} 
        className="terminalContainer"
        style={{ height: "100%", paddingTop: "32px" }}
      />
    </div>
  );
}
