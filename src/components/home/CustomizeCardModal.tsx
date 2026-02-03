"use client";

import { useState } from "react";

interface CustomizeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSelection: "transactions" | "blocks";
  onSave: (selection: "transactions" | "blocks") => void;
}

export default function CustomizeCardModal({
  isOpen,
  onClose,
  currentSelection,
  onSave,
}: CustomizeCardModalProps) {
  const [selected, setSelected] = useState<"transactions" | "blocks">(currentSelection);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed left-[50%] top-[50%] z-50 grid max-h-[100svh] overflow-y-auto w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-gray-200 bg-white shadow-lg rounded-lg">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left bg-gray-50 px-6 py-4 rounded-tr-md rounded-tl-md border-b border-gray-200">
          <h2 className="text-[16px] font-medium text-gray-900 leading-none tracking-tight">
            Custom Card
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 bg-gray-50">
          <div className="flex flex-col gap-4 items-start justify-start">
            <div className="text-[14px] font-normal text-gray-900 leading-[24px]">
              Customize this card by selecting one of the options below.
            </div>
            <div>
              <div className="text-[14px] font-normal text-gray-500 leading-[24px] mb-2">
                Preset
              </div>
              <div className="grid gap-2">
                <div className="flex gap-3 flex-wrap flex-row items-center justify-start w-full">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected === "transactions"}
                      onClick={() => setSelected("transactions")}
                      className={`aspect-square h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        selected === "transactions"
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selected === "transactions" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500 fill-current"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      )}
                    </button>
                    <label
                      className="text-[14px] font-normal text-gray-900 leading-[24px] cursor-pointer"
                      onClick={() => setSelected("transactions")}
                    >
                      Latest Transactions
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected === "blocks"}
                      onClick={() => setSelected("blocks")}
                      className={`aspect-square h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        selected === "blocks"
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selected === "blocks" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500 fill-current"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      )}
                    </button>
                    <label
                      className="text-[14px] font-normal text-gray-900 leading-[24px] cursor-pointer"
                      onClick={() => setSelected("blocks")}
                    >
                      Latest Blocks
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 py-4 px-6 border-t border-gray-200">
          <div className="flex gap-1 flex-row items-stretch justify-end flex-wrap">
            <button
              onClick={onClose}
              className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none hover:bg-gray-100 rounded-lg inline-flex items-center justify-center h-auto transition-colors text-gray-900 bg-white border border-gray-300 font-normal py-1.5 text-[12px] leading-[18px] px-3 gap-1"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="whitespace-nowrap ring-offset-background focus-visible:outline-none disabled:pointer-events-none rounded-lg inline-flex items-center justify-center font-bold h-auto transition-colors text-white bg-green-500 hover:bg-green-600 py-1.5 text-[12px] leading-[18px] px-3 gap-1"
              type="button"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}

