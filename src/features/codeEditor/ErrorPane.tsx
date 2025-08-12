import * as monaco from "monaco-editor";
import "./styles.css";

type Props = {
  errors: monaco.editor.IMarkerData[];
  onErrorClick: (line: number, column: number) => void;
};

export default function ErrorPane({ errors, onErrorClick }: Props) {
  if (errors.length === 0) {
    return (
      <div className="errorsList">
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          No errors detected
        </div>
      </div>
    );
  }

  return (
    <div className="errorsList">
      {errors.map((error, index) => (
        <div 
          key={index} 
          className="item" 
          onClick={() => onErrorClick(error.startLineNumber, error.startColumn)}
        >
          <div style={{ fontWeight: "bold", color: "#d32f2f" }}>
            Line {error.startLineNumber}, Column {error.startColumn}
          </div>
          <div style={{ marginTop: "4px" }}>
            {error.message}
          </div>
          {error.severity === 4 && (
            <div style={{ fontSize: "12px", color: "#f57c00", marginTop: "2px" }}>
              Warning
            </div>
          )}
          {error.severity === 8 && (
            <div style={{ fontSize: "12px", color: "#d32f2f", marginTop: "2px" }}>
              Error
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
