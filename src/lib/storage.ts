import fs from 'fs';
import path from 'path';
import { Car } from './types';

const DATA_DIR = path.join(process.cwd(), 'public/data');
const META_FILE = path.join(DATA_DIR, 'meta.json');

export interface DailyCardMeta extends Car {
    date: string;
    selected_color: string;
    is_holo: boolean;
    image_path: string;
    created_at: string;
}

export type MetaStore = Record<string, DailyCardMeta>;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function getMetaStore(): Promise<MetaStore> {
    if (!fs.existsSync(META_FILE)) {
        return {};
    }
    try {
        const data = await fs.promises.readFile(META_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading meta store:', error);
        return {};
    }
}

export async function saveDailyCard(date: string, meta: DailyCardMeta): Promise<void> {
    const store = await getMetaStore();
    store[date] = meta;
    await fs.promises.writeFile(META_FILE, JSON.stringify(store, null, 2));
}

export async function getDailyCard(date: string): Promise<DailyCardMeta | null> {
    const store = await getMetaStore();
    return store[date] || null;
}
