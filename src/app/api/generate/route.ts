import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const dynamic = 'force-dynamic';

async function generateImageWithGemini(prompt: string, imageParts: any[] = []): Promise<{ url: string | null, error?: string }> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return { url: null, error: "No API Key" };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`;

    try {
        const contents = [{
            parts: [
                { text: prompt },
                ...imageParts
            ]
        }];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 seconds timeout

        const requestBody = JSON.stringify({
            contents,
            tools: [{ googleSearch: {} }],
            generationConfig: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: "2K"
                }
            }
        });

        console.log("Gemini API Request URL:", url);
        console.log("Gemini API Request Body:", JSON.stringify(JSON.parse(requestBody), null, 2)); // Pretty print

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
            },
            body: requestBody,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        console.log("Gemini API Response Status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini Image API Error Body:", errorText);
            return { url: null, error: `${response.status} ${response.statusText}: ${errorText}` };
        }

        const data = await response.json();
        console.log("Gemini API Response Data:", JSON.stringify(data, null, 2));

        // Check for inlineData (base64)
        const part = data.candidates?.[0]?.content?.parts?.[0];
        const base64Image = part?.inlineData?.data;
        const textOutput = part?.text;

        if (!base64Image) {
            console.error("No image data in response", JSON.stringify(data).substring(0, 500));
            return { url: null, error: "No image data. Model generated text instead: " + (textOutput ? textOutput.substring(0, 100) + "..." : "Unknown") };
        }

        // Save image to public/uploads
        const buffer = Buffer.from(base64Image, "base64");
        const fileName = `${uuidv4()}.png`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        return { url: `/uploads/${fileName}` };

    } catch (error) {
        console.error("Gemini image generation failed:", error);
        return { url: null, error: String(error) };
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { scenario, characterIds, model: selectedModel } = body;

        let imageUrl = "";
        let debugError = "";
        let finalPrompt = scenario;

        let imageParts: any[] = [];

        // 1. Fetch Character Info if selected
        if (characterIds && Array.isArray(characterIds) && characterIds.length > 0) {
            const characters = await prisma.character.findMany({
                where: { id: { in: characterIds } },
            });

            if (characters.length > 0) {
                const charDescriptions = characters.map(c => `Name: ${c.name}\nDescription: ${c.description}`).join("\n\n");
                finalPrompt = `Characters involved:\n${charDescriptions}\n\nScene Description:\n${scenario}`;
                console.log("Using Characters:", characters.map(c => c.name).join(", "));

                // Prepare image parts for all characters
                for (const character of characters) {
                    if (character.imageUrl) {
                        try {
                            const filename = character.imageUrl.split('/').pop();
                            if (filename) {
                                const filePath = path.join(process.cwd(), "public", "uploads", filename);
                                if (fs.existsSync(filePath)) {
                                    const imageBuffer = fs.readFileSync(filePath);
                                    const base64Image = imageBuffer.toString("base64");
                                    imageParts.push({
                                        inlineData: {
                                            mimeType: "image/png",
                                            data: base64Image
                                        }
                                    });
                                }
                            }
                        } catch (e) {
                            console.error("Failed to load character image for", character.name, e);
                        }
                    }
                }
                if (imageParts.length > 0) {
                    console.log(`Added ${imageParts.length} character reference images`);
                }
            }
        }

        // Direct Image Generation (Gemini 3 Pro Image or Mock)
        // User requested to skip text refinement and use scenario directly
        if (selectedModel === "nano-banana" || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            // Try Gemini Image first if key exists
            const { url, error } = await generateImageWithGemini(finalPrompt, imageParts);
            if (url) {
                imageUrl = url;
            } else {
                // Fallback to Mock if Gemini fails
                console.log("Falling back to mock image", error);
                debugError = error || "Unknown error";
                await new Promise((resolve) => setTimeout(resolve, 1000));
                imageUrl = `https://placehold.co/1024x1024/facc15/18181b/png?text=${encodeURIComponent("Fallback: " + scenario.slice(0, 20))}`;
            }
        } else {
            // Default Mock Generation
            await new Promise((resolve) => setTimeout(resolve, 1000));
            imageUrl = `https://placehold.co/1024x1024/18181b/facc15/png?text=${encodeURIComponent("Webtoon: " + scenario.slice(0, 20))}`;
        }

        // 3. Save to DB
        const primaryCharacterId = (characterIds && characterIds.length > 0) ? characterIds[0] : undefined;

        const savedScenario = await prisma.scenario.create({
            data: {
                content: scenario,
                characterId: primaryCharacterId,
            },
        });

        await prisma.generation.create({
            data: {
                imageUrl,
                scenarioId: savedScenario.id,
            },
        });

        return NextResponse.json({
            success: true,
            imageUrl,
            refinedPrompt: finalPrompt,
            debugError
        });

    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json({ success: false, error: "Generation failed" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const generations = await prisma.generation.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                scenario: true,
            },
            take: 10,
        });
        return NextResponse.json(generations);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
