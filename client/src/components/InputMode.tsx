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
    <div className="w-full max-w-md mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="font-display text-3xl font-bold text-white">
          Confess to the Signal
        </h2>
        <p className="text-slate-400">
          What's broken? What's too slow? Tell me what's really going on.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., My team is drowning in compliance paperwork..."
          className="min-h-[150px] bg-slate-900/50 border-cyan-500/30 text-white placeholder:text-slate-600 resize-none p-4 text-lg font-mono focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
        />
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleListening}
            className={`rounded-full hover:bg-cyan-500/10 ${isListening ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
