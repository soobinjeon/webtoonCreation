"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Upload, X, User, Loader2, Pencil, Trash2 } from "lucide-react";

interface Character {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
}

export default function CharactersPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            const res = await fetch("/api/characters");
            const data = await res.json();
            setCharacters(data);
        } catch (error) {
            console.error("Failed to fetch characters", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setUploadPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData({ name: "", description: "" });
        setSelectedFile(null);
        setUploadPreview(null);
        setIsAdding(false);
        setIsEditing(null);
    };

    const openEditModal = (char: Character) => {
        setFormData({ name: char.name, description: char.description });
        setUploadPreview(char.imageUrl);
        setIsEditing(char);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this character?")) return;
        try {
            const res = await fetch(`/api/characters/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchCharacters();
            }
        } catch (error) {
            console.error("Failed to delete character", error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) return;
        setIsSubmitting(true);

        try {
            let imageUrl = isEditing ? isEditing.imageUrl : null;

            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append("file", selectedFile);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData,
                });
                const uploadResult = await uploadRes.json();
                if (uploadResult.success) {
                    imageUrl = uploadResult.url;
                }
            }

            const url = isEditing ? `/api/characters/${isEditing.id}` : "/api/characters";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    imageUrl,
                }),
            });

            if (res.ok) {
                await fetchCharacters();
                resetForm();
            }
        } catch (error) {
            console.error("Failed to save character", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Character Assets</h1>
                    <p className="text-muted-foreground">Manage your characters and their reference images.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsAdding(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Add Character
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {characters.map((char) => (
                        <div key={char.id} className="group relative bg-card border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 transition-all">
                            <div className="aspect-square bg-secondary flex items-center justify-center relative">
                                {char.imageUrl ? (
                                    <Image src={char.imageUrl} alt={char.name} className="object-cover" fill />
                                ) : (
                                    <User className="w-16 h-16 text-muted-foreground/50" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => openEditModal(char)}
                                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(char.id)}
                                        className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white">{char.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{char.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">{isEditing ? "Edit Character" : "New Character"}</h2>
                            <button onClick={resetForm} className="text-muted-foreground hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g. Sarah Connor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-secondary border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                    placeholder="Physical traits, personality..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Reference Image</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 cursor-pointer bg-secondary border border-white/10 rounded-lg px-4 py-2 text-center hover:bg-white/5 transition-colors">
                                        <span className="text-sm text-muted-foreground">Choose File</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    {uploadPreview && (
                                        <div className="w-10 h-10 relative rounded-lg overflow-hidden border border-white/10">
                                            <Image src={uploadPreview} alt="Preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Save Changes" : "Create Character")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
