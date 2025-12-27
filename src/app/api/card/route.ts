import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import { selectCarForDate } from '@/lib/car-selector';
import { generateBaseImage } from '@/lib/openai-image';
import { compositeCard } from '@/lib/image-compositor';
import { getDailyCard, saveDailyCard, DailyCardMeta } from '@/lib/storage';

// Simple in-memory lock to prevent double generation across simultaneous requests for SAME date
const generationLocks = new Set<string>();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    if (!dateParam || !dayjs(dateParam).isValid()) {
        return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
    }

    // Ensure format YYYY-MM-DD
    const date = dayjs(dateParam).format('YYYY-MM-DD');

    // 1. Check if already exists
    const existing = await getDailyCard(date);
    if (existing) {
        return NextResponse.json({
            ...existing,
            imageUrl: `/data/images/${date}.png`,
        });
    }

    // 2. Check lock
    if (generationLocks.has(date)) {
        return NextResponse.json({ status: 'generating' }, { status: 202 });
    }

    generationLocks.add(date);

    try {
        console.log(`Starting generation for ${date}...`);

        // 3. Select Car
        const { car, color, isHolo } = await selectCarForDate(date);

        // 4. Generate Base Image
        // Check if we have a "pending" or fallback? No, we wait. 
        // This might timeout standard Vercel functions (10s/60s). For local it's fine.
        const baseImage = await generateBaseImage(
            car.maker,
            car.model,
            color,
            car.category,
            car.usage
        );

        // 5. Composite
        const finalImage = await compositeCard(
            baseImage,
            date,
            car.maker,
            car.model,
            car.usage,
            isHolo
        );

        // 6. Save
        const fileName = `${date}.png`;
        const publicDir = path.join(process.cwd(), 'public/data/images');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const filePath = path.join(publicDir, fileName);
        await fs.promises.writeFile(filePath, finalImage);

        const meta: DailyCardMeta = {
            ...car,
            date,
            selected_color: color,
            is_holo: isHolo,
            image_path: filePath,
            created_at: new Date().toISOString(),
        };

        await saveDailyCard(date, meta);

        return NextResponse.json({
            ...meta,
            imageUrl: `/data/images/${fileName}`,
        });

    } catch (error) {
        console.error('Error generating card:', error);
        return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
    } finally {
        generationLocks.delete(date);
    }
}
