import React from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Send } from "lucide-react";

 export interface ChatInputProps {
   isLoading: boolean;
   rateLimited: boolean;
   handleSubmit: React.SubmitEventHandler<HTMLFormElement>;
   maxLength: number;

   inputValue: string;
   setInputValue: (value: string) => void;

   inputError: string | null;
   setInputError: (error: string | null) => void;
 }

const ChatInput: React.FC<ChatInputProps> = ({
  isLoading,
  rateLimited,
  inputValue,
  setInputValue,
  handleSubmit,
  maxLength,
  inputError,
  setInputError,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background via-background to-transparent pt-6 pb-4">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-end gap-2 rounded-2xl border bg-card p-1 shadow-sm transition-all duration-200 focus-within:ring-1 focus-within:ring-ring focus-within:shadow-md ${
            inputError ? "border-destructive" : "border-input"
          }`}
        >
          <Input
            placeholder="Posez votre question..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            disabled={isLoading || rateLimited}
            className="min-h-11 border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0 resize-none flex-1"
            autoFocus
            maxLength={maxLength}
            autoComplete="off"
          />

          <div className="flex h-11 items-center pr-2">
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-xl transition-transform hover:scale-110 active:scale-90 disabled:scale-100"
              disabled={isLoading || rateLimited || !inputValue.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
        </form>

        {/* Footer / Error text */}
        <div className="mt-2 flex items-center justify-between px-2 text-[10px] text-muted-foreground">
          <span>
            {inputError ? (
              <span className="text-destructive font-medium">{inputError}</span>
            ) : (
              "L'assistant documentaire analyse les ressources internes pour vous répondre."
            )}
          </span>
          <span
            className={inputValue.length > maxLength * 0.9 ? "text-destructive font-medium" : ""}
          >
            {inputValue.length} / {maxLength}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
