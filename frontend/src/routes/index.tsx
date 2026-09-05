import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Activity, ShieldCheck, Map as MapIcon } from "lucide-react";
import { ThemeToggle } from "@/components/app-shell";
import { InteractiveTree } from "@/components/interactive-tree";
import { PerchedAnimal } from "@/components/animated-animals";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-border/50 bg-background/80">
        <div className="flex items-center gap-2.5 font-semibold">
          <img
            src="/logo.png"
            alt="FRA Monitor Logo"
            className="size-9 rounded-full object-cover shadow-xs ring-1 ring-border/20"
          />
          <span className="text-base tracking-tight">FRA Monitor</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <InteractiveTree />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-16 px-6 text-center">
        <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm text-muted-foreground mb-10 bg-muted/50 backdrop-blur-sm">
          <span className="flex size-2 rounded-full bg-emerald-500 mr-2"></span>
          Now available for state-level integration
        </div>
        
        <h1 className="max-w-4xl text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight sm:leading-tight">
          <span className="relative inline-block">
            <PerchedAnimal
              emoji="🐒"
              name="Forest Langur"
              actionText="Eek! 🌿"
              className="-top-7 left-0 sm:-top-9 sm:left-1"
              idleAnimation="animate-animal-wag"
            />
            Decision
          </span>{" "}
          <span className="relative inline-block">
            <PerchedAnimal
              emoji="🐦"
              name="Songbird"
              actionText="Chirp! 🎵"
              className="-top-6 right-1 sm:-top-8 sm:right-2"
              idleAnimation="animate-animal-bob"
            />
            Support
          </span>{" "}
          <span className="relative inline-block">
            <PerchedAnimal
              emoji="🦋"
              name="Emerald Butterfly"
              actionText="Flutter! ✨"
              className="-top-6 right-0 sm:-top-8 sm:right-1"
              idleAnimation="animate-animal-flutter"
            />
            System
          </span>{" "}
          <span className="inline-block">for</span>{" "}
          <span className="text-emerald-700 dark:text-emerald-400">
            <span className="relative inline-block">
              <PerchedAnimal
                emoji="🦌"
                name="Forest Deer"
                actionText="Prance! 🍃"
                className="-top-7 left-1 sm:-top-9 sm:left-2"
                idleAnimation="animate-animal-float"
              />
              Forest
            </span>{" "}
            <span className="relative inline-block">
              <PerchedAnimal
                emoji="🦜"
                name="Indian Parakeet"
                actionText="Squawk! 💚"
                className="-top-6 right-0 sm:-top-8 sm:right-1"
                idleAnimation="animate-animal-bob"
                flip
              />
              Rights.
            </span>
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
          Monitor claim throughput, identify spatial anomalies, and get AI-synthesized compliance briefings across states and districts in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/dashboard"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all hover:bg-foreground/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            View Dashboard
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Infinite Image Marquee */}
        <div className="mt-24 w-[calc(100%+3rem)] -mx-6 flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Deployed in districts across India
          </p>
          
          <div className="relative w-full overflow-hidden flex group">
            {/* Gradient masks for fading edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
            
            {/* First Marquee Track */}
            <div className="flex shrink-0 animate-marquee gap-4 px-2 group-hover:[animation-play-state:paused]">
              {/* Duplicate the array inside the track so it's long enough for 4K screens */}
              {[...Array(3)].map((_, i) => (
                <div key={`track1-${i}`} className="flex gap-4 shrink-0">
                  <div className="w-80 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image1.jpg" alt="Deployed District 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-64 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image2.jpg" alt="Deployed District 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-96 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image3.jpg" alt="Deployed District 3" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-72 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image4.jpg" alt="Deployed District 4" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-80 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image5.jpg" alt="Deployed District 5" className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>

            {/* Second Marquee Track (Seamless Loop) */}
            <div className="flex shrink-0 animate-marquee gap-4 px-2 group-hover:[animation-play-state:paused]" aria-hidden="true">
              {[...Array(3)].map((_, i) => (
                <div key={`track2-${i}`} className="flex gap-4 shrink-0">
                  <div className="w-80 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image1.jpg" alt="Deployed District 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-64 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image2.jpg" alt="Deployed District 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-96 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image3.jpg" alt="Deployed District 3" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-72 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image4.jpg" alt="Deployed District 4" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-80 h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img src="/images/image5.jpg" alt="Deployed District 5" className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid gap-8 sm:grid-cols-3 w-full max-w-5xl text-left">
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
              <Activity className="size-5 text-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Real-time Analytics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track throughput at every statutory stage, from Gram Sabha submission to final title conversion.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
              <MapIcon className="size-5 text-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Spatial Anomalies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Geographic visualization of claim hotspots and automated flags for rule-based discrepancies.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50">
              <ShieldCheck className="size-5 text-foreground" />
            </div>
            <h3 className="text-lg font-semibold">AI Compliance Briefs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Synthesized district-level advisory insights powered by LLMs for human review and action.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 FRA Monitor. All rights reserved.</p>
        <p className="mt-2 text-xs">Synthetic data used for demonstration purposes only.</p>
      </footer>
    </div>
  );
}
