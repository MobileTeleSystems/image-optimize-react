
export const checkWebpFeature = (): Promise<boolean> => new Promise<boolean>((resolve: (result: boolean) => void) => {
    const kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////" +
            "AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    const img = new Image();
    img.onload = (): void => {
        const result = (img.width > 0) && (img.height > 0);
        resolve(result);
    };
    img.onerror = (): void => {
        resolve(false);
    };
    img.src = `data:image/webp;base64,${kTestImages.lossless}`;
});
