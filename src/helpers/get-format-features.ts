
import {checkAvifFeature} from "./check-avif-feature";
import {checkWebpFeature} from "./check-webp-feature";

// eslint-disable-next-line @typescript-eslint/no-type-alias
type FormatType = "avif" | "webp" | null;

const promisesPool: ((value: FormatType) => void)[] = [];

const resolvePromises = (format: FormatType): void => {
    promisesPool.forEach((resolve) => resolve(format));
};

const checkFormats = async (): Promise<void> => {
    const isAvif = await checkAvifFeature();
    if (isAvif) {
        resolvePromises("avif");
        return;
    }

    const isWebp = await checkWebpFeature();
    if (isWebp) {
        resolvePromises("webp");
        return;
    }

    resolvePromises(null);
};

export const getFormatFeatures = (): Promise<FormatType> => {
    if (promisesPool.length === 0) {
        checkFormats();
    }

    return new Promise((resolve) => {
        promisesPool.push(resolve);
    });
};
