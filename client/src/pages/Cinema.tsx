import { BackgroundLayer } from "@/components/BackgroundLayer";
import { HUDOverlay } from "@/components/HUDOverlay";
import { ScrollyTelling } from "@/components/ScrollyTelling";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Film } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

type StoryboardPayload = {
  storyboard?: Array<{ video_url?: string }>;
};

export default function Cinema() {
  const { data: movies, isLoading } = trpc.cinema.list.useQuery();
  const [playingMovie, setPlayingMovie] = useState<any>(null);

  if (playingMovie) {
    return (
      <div className="min-h-[100dvh] bg-[#0B0D12] relative">
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-50 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full"
          onClick={() => setPlayingMovie(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cinema
        </Button>
        <ScrollyTelling
          storyboard={playingMovie.storyboard.storyboard}
          finalCta={playingMovie.finalCta}
          onRestart={() => setPlayingMovie(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative selection:bg-emerald-200/30">
      <BackgroundLayer type="gradient" fallbackGradient="from-[#0B0D12] via-[#0F1320] to-[#0B0D12]" />
      <HUDOverlay />

      <div className="relative z-20 container max-w-6xl mx-auto px-4 sm:px-6 py-20 min-h-[100dvh]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-200 text-[9px] font-mono tracking-[0.35em] uppercase">
              <Film size={12} />
              Archive
            </div>
            <h1 className="font-display font-semibold text-4xl sm:text-6xl text-white">
              Signal Cinema
            </h1>
            <p className="text-slate-300 max-w-xl">
              A curated archive of generated strategic narratives and future-state artifacts.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-full">
              Generate New <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies?.map((movie) => {
              const scenes = ((movie.storyboard as StoryboardPayload | undefined)?.storyboard ?? []);
              const hasVideo = Array.isArray(scenes) && scenes.some((scene: any) => scene?.video_url);
              return (
              <motion.div
                key={movie.id}
                layoutId={`movie-${movie.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-emerald-200/40 transition-colors cursor-pointer aspect-[4/3] flex flex-col rounded-2xl"
                  onClick={() => setPlayingMovie(movie)}
                >
                  {/* Thumbnail / Visual Placeholder */}
                  <div className="flex-1 bg-gradient-to-br from-[#0E121A] via-[#101827] to-[#0B0D12] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                    <div className="absolute -top-16 right-[-20%] h-40 w-40 rounded-full bg-emerald-300/10 blur-[80px]" />
                    <div className="absolute -bottom-16 left-[-10%] h-32 w-32 rounded-full bg-sky-300/10 blur-[70px]" />

                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 relative z-20">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono uppercase tracking-[0.3em] ${hasVideo ? "text-emerald-200" : "text-slate-400"}`}>
                        {hasVideo ? "Ready" : "Processing"}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
                        {new Date(movie.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-xl text-white mb-2 line-clamp-1 group-hover:text-emerald-200 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-[0.25em]">
                      {movie.industry || 'General'}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
