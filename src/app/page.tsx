"use client";
import { useChat } from "@ai-sdk/react";
import { KeyboardEvent, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { getResponse } from "./actions";
import { readStreamableValue } from "ai/rsc";

export default function Home() {   
  const [value, setValue] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {

    if (e.key !== 'Enter') return;
    setValue("");
    setError("");
    if (prompt.length < 4) {
      setError("The prompt length must be at least 4 chracters long");
      return;
    }

    setPrompt("");
    setLoading(true);

    try {
      const result = await getResponse(prompt);
      setLoading(false);
      let closeId = false;
      const idsToFetch = [];
      for await (const content of readStreamableValue(result)) {
        if (content?.includes('<id>')) {
          closeId = true;
          if (content.includes('</id>')) {
            closeId = false;
            
          }
        } else {
          setValue(content || '');
        }
      }
    } catch (e) {
      setError("An unexpected error occurred, please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="w-full flex  flex-col h-screen justify-center items-center">
      <h1 className="mb-4 text-3xl text-center">Where knowledge begins</h1>
      <div className="w-full sm:w-1/3 hover:shadow-sm border-2">
        <ReactTextareaAutosize
          className="p-4 w-full text-lg outline-none"
          placeholder="Ask anything..."
          value={prompt} onChange={(e) => setPrompt(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          maxRows={20}
        />
      </div>

      {
        loading
          ? (
            <>
              <div role="status" className="w-full sm:w-1/3 pt-4 animate-pulse">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <span className="sr-only">Loading...</span>
              </div>
            </>
          )
          : (
            <div className="w-full sm:w-1/3 pt-4 text-base" >{value}</div>
          )
      }
      {
        error ?
          <p className="text-red-800">{error}</p>
          : null
      }
    </main>
  );
}
