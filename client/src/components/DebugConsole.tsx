import type { ChangeEvent, Dispatch, SetStateAction } from "react";

interface DebugConsoleProps {
  debugString: string;
  sendMessage: (message: string) => void;
  setDebugString: Dispatch<SetStateAction<string>>;
}

const DebugConsole = ({ debugString, sendMessage, setDebugString }: DebugConsoleProps) => {
  const debugStringHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDebugString(e.target.value);
  };

  return (
    <>
      <h2>Websockets Debug Console</h2>
      <textarea onChange={debugStringHandler} placeholder="WebSocket message" />
      <br />
      <button
        onClick={() => {
          sendMessage(debugString);
        }}
      >
        Send WebSocket Message
      </button>
    </>
  );
};

export default DebugConsole;
