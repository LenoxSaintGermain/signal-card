import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Mic, Send } from "lucide-react";
import { useState } from "react";

interface InputModeProps {
  onCommit: (input: string) => void;
}

export function InputMode({ onCommit }: InputModeProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      onCommit(input);
    }
  };

  const toggleListening = () => {
    // Placeholder for Web Speech API integration
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setInput((prev) => prev + " (Voice input simulation: I feel like we're moving too slow...)");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">
          Describe the friction.
        </h2>
        <p className="text-slate-400 text-base sm:text-lg">
          Capture the constraint, not the symptom. We’ll shape the signal.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., Every expansion request stalls because compliance proof is manual."
          className="min-h-[170px] bg-transparent border-white/10 text-white placeholder:text-slate-500 resize-none p-4 text-base sm:text-lg focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300/40"
        />
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleListening}
            className={`rounded-full hover:bg-white/10 ${isListening ? 'text-red-400 animate-pulse' : 'text-emerald-200'}`}
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="rounded-full bg-emerald-300 text-slate-950 hover:bg-emerald-200"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
