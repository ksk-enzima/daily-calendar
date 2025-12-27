import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-build',
});

export async function generateBaseImage(
    maker: string,
    model: string,
    color: string,
    category: string,
    usage: string | undefined
): Promise<Buffer> {
    // Construct Prompt
    // "realistic car, no logos, no text, vertical poster, high quality"
    // Plus specific car details.

    let carDescription = `${maker} ${model}, ${color}`;
    if (usage) {
        carDescription += `, ${usage}`;
    }

    const prompt = `
    A high quality, realistic photo of a ${carDescription}.
    The car is the main subject, centered, facing slightly towards the viewer (3/4 view).
    Background should be simple and scenic (e.g. road, city, or nature) but not distracting.
    Vertical aspect ratio.
    NO text, NO watermarks, NO brand logos if possible (or minimal).
    Photorealistic, 8k resolution, highly detailed.
  `.trim();

    // For DALL-E 3, we can specify 'portrait' size if supported, or standard square and crop.
    // standard model 'dall-e-3' supports '1024x1792' which is vertical.

    console.log(`Generating image with prompt: ${prompt}`);

    try {
        // Check for MOCK mode via env
        if (process.env.MOCK_OPENAI === 'true') {
            throw new Error('MOCK_MODE_TRIGGERED');
        }

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1792",
            response_format: "b64_json",
            quality: "standard", // "hd" is more expensive, standard is fine for this
        });

        // Fix for type safety
        const b64 = response.data?.[0]?.b64_json;
        if (!b64) throw new Error('No image data returned');

        return Buffer.from(b64, 'base64');

    } catch (error: any) {
        // If mock mode or dev fallback
        if (process.env.MOCK_OPENAI === 'true' || (process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY)) {
            console.warn(`Falling back to mock image (Error: ${error.message || error})`);
            return Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                'base64'
            );
        }

        console.error('OpenAI Image Generation Error:', error);
        throw error;
    }
}
