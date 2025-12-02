import Link from "next/link";
import { ArrowRight, Sparkles, Paintbrush, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Webtoon Creation</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
          Turn Your Stories into <span className="text-primary">Webtoons</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create consistent characters, write your scenario, and let Nano Banana generate professional-quality webtoon cuts in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-black font-bold hover:bg-primary/90 transition-all hover:scale-105"
          >
            Start Creating <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/characters"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-secondary text-white font-medium hover:bg-secondary/80 transition-all"
          >
            Manage Characters
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl pt-12">
        {[
          {
            icon: <Paintbrush className="w-8 h-8 text-primary" />,
            title: "Consistent Characters",
            desc: "Upload reference images and maintain character identity across every panel.",
          },
          {
            icon: <Zap className="w-8 h-8 text-primary" />,
            title: "Instant Generation",
            desc: "Transform text scripts into visual storytelling with our advanced AI engine.",
          },
          {
            icon: <Sparkles className="w-8 h-8 text-primary" />,
            title: "Style Control",
            desc: "Choose from various art styles or train your own for a unique look.",
          },
        ].map((feature, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-colors text-left">
            <div className="mb-4 p-3 rounded-xl bg-primary/10 w-fit">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
