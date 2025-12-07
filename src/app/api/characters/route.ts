import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const characters = await prisma.character.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(characters);
    } catch (error) {
        console.error("Failed to fetch characters:", error);
        return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, imageUrl } = body;

        const character = await prisma.character.create({
            data: {
                name,
                description,
                imageUrl,
            },
        });

        return NextResponse.json(character);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create character" }, { status: 500 });
    }
}
