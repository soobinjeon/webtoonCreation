"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Wand2, Loader2, History, Layout, Sparkles, RefreshCw, Image as ImageIcon, User } from "lucide-react";

interface Generation {
    id: string;
    imageUrl: string;
    scenario: {
        content: string;
    };
}

interface Character {
    id: string;
    name: string;
    imageUrl: string | null;
}

export default function StudioPage() {
    const [scenario, setScenario] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [history, setHistory] = useState<Generation[]>([]);
    const [selectedModel, setSelectedModel] = useState("default");
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

    useEffect(() => {
        fetchHistory();
        fetchCharacters();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/generate");
            const data = await res.json();
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const fetchCharacters = async () => {
        try {
            const res = await fetch("/api/characters");
            const data = await res.json();
            if (Array.isArray(data)) {
                setCharacters(data);
            }
        } catch (error) {
            console.error("Failed to fetch characters", error);
        }
    };

    const toggleCharacter = (id: string) => {
        setSelectedCharacterIds(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!scenario) return;
        setIsGenerating(true);
        setResultImage(null);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario,
                    model: selectedModel,
                    characterIds: selectedCharacterIds
                }),
            });
            const data = await res.json();
            if (data.success) {
                setResultImage(data.imageUrl);
                fetchHistory(); // Refresh history
            }
        } catch (error) {
            console.error("Failed to generate", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
            {/* Left Panel: Input */}
            <div className="lg:w-1/3 flex flex-col gap-6">
                <div className="bg-card border border-white/10 rounded-xl p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Wand2 className="w-6 h-6" />
                        <h2 className="text-xl font-bold text-white">Scenario Input</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground font-medium">AI Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary appearance-none"
                        >
                            <option value="default">Standard Webtoon (Fast)</option>
                            <option value="nano-banana">Nano Banana Pro (High Quality)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground font-medium">Characters (Select Multiple)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {characters.map((char) => {
                                const isSelected = selectedCharacterIds.includes(char.id);
                                return (
                                    <button
                                        key={char.id}
                                        onClick={() => toggleCharacter(char.id)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${isSelected ? "border-primary ring-2 ring-primary/50" : "border-white/10 hover:border-white/30"
                                            }`}
                                        title={char.name}
                                    >
                                        {char.imageUrl ? (
                                            <Image src={char.imageUrl} alt={char.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                                                <User className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedCharacterIds.length === 0 && (
                            <p className="text-xs text-muted-foreground">No characters selected.</p>
                        )}
                        {selectedCharacterIds.length > 0 && (
                            <p className="text-xs text-primary">{selectedCharacterIds.length} character(s) selected.</p>
                        )}
                    </div>

                    <textarea
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        className="flex-1 w-full bg-secondary border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary resize-none"
                        placeholder="Describe the scene, characters, and action..."
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !scenario}
                        className="w-full py-4 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6" /> Generate Webtoon Cut
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Panel: Result & History */}
            <div className="lg:w-2/3 flex flex-col gap-6">
                {/* Main Result */}
                <div className="flex-1 bg-card border border-white/10 rounded-xl p-6 flex flex-col relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />

                    {resultImage ? (
                        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-4">
                            <Image
                                src={resultImage}
                                alt="Generated Result"
                                fill
                                className="object-contain rounded-lg shadow-2xl"
                                unoptimized
                            />
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                <button
                                    onClick={handleGenerate}
                                    className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
                                    title="Regenerate"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Layout className="w-16 h-16 opacity-20" />
                            <p>Your generated webtoon cut will appear here</p>
                        </div>
                    )}
                </div>

                {/* History Strip */}
                <div className="h-48 bg-card border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <History className="w-4 h-4" />
                        <span>Recent Generations</span>
                    </div>
                    <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {history.map((item) => (
                            <div key={item.id} className="min-w-[160px] relative rounded-lg overflow-hidden border border-white/10 group cursor-pointer" onClick={() => setResultImage(item.imageUrl)}>
                                <Image src={item.imageUrl} alt="History" fill className="object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                    <p className="text-xs text-white text-center line-clamp-3">{item.scenario.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
