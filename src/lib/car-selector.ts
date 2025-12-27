import { CAR_DATABASE } from '@/data/cars';
import { Car, CarCategory } from './types';
import { getMetaStore } from './storage';
import dayjs from 'dayjs';

interface SelectionCriteria {
    date: string; // YYYY-MM-DD
}

export async function selectCarForDate(date: string): Promise<{ car: Car; color: string; isHolo: boolean }> {
    const store = await getMetaStore();
    const year = dayjs(date).year();

    // 1. Get history for this year to avoid duplicates
    const usedCarIdsThisYear = new Set<string>();
    Object.values(store).forEach((meta) => {
        if (dayjs(meta.date).year() === year) {
            usedCarIdsThisYear.add(meta.id);
        }
    });

    // 2. Define Category Weights
    // JP Passenger: 60%, Special: 30%, Luxury: 10%
    const rand = Math.random();
    let targetCategory: CarCategory = 'jp_passenger';
    if (rand < 0.1) targetCategory = 'luxury';
    else if (rand < 0.4) targetCategory = 'special';

    // 3. Filter candidates
    let candidates = CAR_DATABASE.filter((c) => c.category === targetCategory);

    // Exclude used cars if possible
    const unusedCandidates = candidates.filter((c) => !usedCarIdsThisYear.has(c.id));
    if (unusedCandidates.length > 0) {
        candidates = unusedCandidates;
    } else {
        // If all used (unlikely given database size vs year), fallback to full list
        // Ideally we would relax the category constraint too, but for simplicity we assume DB is large enough
        console.warn(`Category ${targetCategory} exhausted for year ${year}, reusing cars.`);
    }

    if (candidates.length === 0) {
        // Fallback to ANY car
        candidates = CAR_DATABASE;
    }

    // 4. Pick random car
    const car = candidates[Math.floor(Math.random() * candidates.length)];

    // 5. Pick random color
    const color = car.allowed_colors[Math.floor(Math.random() * car.allowed_colors.length)];

    // 6. Determine Holo (High price or just random luck for luxury?)
    // Requirement: > 10,000,000 yen (approx) -> Holo (20% of high value)
    // Or just simpler: any car > 10M is ALWAYS Holo?
    // User said: "Contain 20% high value cars... that day becomes Holo"
    // So if we picked a high value car, it IS Holo.
    const isHighValue = car.price_yen_estimate >= 10000000;
    const isHolo = isHighValue;

    return { car, color, isHolo };
}
