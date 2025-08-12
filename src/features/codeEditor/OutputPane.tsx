import "./styles.css";

type Props = {
  output: string;
  isError?: boolean;
};

export default function OutputPane({ output, isError = false }: Props) {
  return (
    <div className="outputWrap" style={{ color: isError ? "#ff6b6b" : "#ffffff" }}>
      {output || (isError ? "No errors" : "Click 'Run' to see output here...")}
    </div>
  );
}
