export const BASE_PATH = '/app/calendar';

export function getAssetPath(path: string): string {
    // If path already starts with base path, return as is
    if (path.startsWith(BASE_PATH)) return path;

    // Clean leading slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_PATH}${cleanPath}`;
}
