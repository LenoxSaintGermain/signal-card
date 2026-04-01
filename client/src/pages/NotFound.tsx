import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0D12]">
      <Card className="w-full max-w-lg mx-4 shadow-[0_30px_80px_rgba(0,0,0,0.4)] border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-rose-200" />
            </div>
          </div>

          <h1 className="text-4xl font-semibold text-white mb-2">404</h1>

          <h2 className="text-xl font-semibold text-slate-200 mb-4">
            Page Not Found
          </h2>

          <p className="text-slate-400 mb-8 leading-relaxed">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="bg-emerald-300 hover:bg-emerald-200 text-slate-950 px-6 py-2.5 rounded-full transition-all duration-200 shadow-[0_20px_50px_rgba(94,234,212,0.35)]"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
