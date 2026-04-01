import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EmailCaptureFormProps {
  role: string;
  industry: string;
  signal: string;
  onSuccess: () => void;
}

export function EmailCaptureForm({ role, industry, signal, onSuccess }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const saveEmail = trpc.emailCaptures.save.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await saveEmail.mutateAsync({
        email,
        role,
        industry,
        signal,
      });
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save email. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-8 border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-200/10 border border-emerald-200/30 flex items-center justify-center"
        >
          <Mail className="w-8 h-8 text-emerald-200" />
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-display font-semibold text-center mb-2 text-white"
        >
          Access Your Intelligence
        </motion.h3>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-300 text-center mb-8 text-sm"
        >
          Enter your email to receive your personalized strategic insight
        </motion.p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saveEmail.isPending}
              className="h-12 bg-transparent border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-200 focus:ring-emerald-200/20"
              autoFocus
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              disabled={saveEmail.isPending}
              className="w-full h-12 bg-emerald-300 hover:bg-emerald-200 text-slate-950 font-semibold tracking-[0.3em] uppercase group rounded-full"
            >
              {saveEmail.isPending ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>Generate Insight</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-slate-500 text-center mt-4"
        >
          We respect your privacy. No spam, ever.
        </motion.p>
      </div>
    </motion.div>
  );
}
