import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { VscDebug } from "react-icons/vsc";

interface DebugConsoleProps {
  sendMessage: (message: string) => void;
}

const DebugConsole = ({ sendMessage }: DebugConsoleProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [debugString, setDebugString] = useState<string>("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!modalRef.current?.contains(e.target as Node)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const debugStringHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDebugString(e.target.value);
  };

  const sendMessageHandler = () => {
    sendMessage(debugString);
  };

  return (
    <div>
      <button
        className="fixed right-4 bottom-4 p-2 text-white bg-cyan-500 rounded-full shadow hover:bg-cyan-600"
        onClick={openModal}
      >
        <VscDebug />
      </button>
      {isModalOpen && (
        <div
          className="fixed right-4 bottom-4 z-10 py-4 px-6 w-96 bg-cyan-100 rounded-lg border-2 border-cyan-500"
          ref={modalRef}
        >
          <h2 className="mb-2 font-bold">WebSocket Debug Console</h2>
          <textarea
            className="py-1 px-2 w-full h-24 bg-white rounded border-2 border-cyan-500"
            onChange={debugStringHandler}
            placeholder="WebSocket message"
          />
          <div className="flex justify-end">
            <button
              className="py-2 px-4 text-sm text-white bg-cyan-500 rounded-full hover:bg-cyan-600"
              onClick={sendMessageHandler}
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugConsole;
