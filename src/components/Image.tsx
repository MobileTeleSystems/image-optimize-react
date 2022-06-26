import React from "react";
import {checkAvifFeature} from "../helpers/check-avif-feature";
import {checkWebpFeature} from "../helpers/check-webp-feature";

export interface IImageOptions {
    src: string;
    alt: string;
    offset?: number;
    quality?: number;
    className?: string;
    setRef?: (elem: HTMLImageElement | null) => void;
}

export class Image<P extends IImageOptions> extends React.Component<P> {

    public static isShowDiagnostic: boolean = false;

    public static isAvif: boolean | null = null;

    public static isWebP: boolean | null = null;

    public static controlPoints: number[] = [160, 320, 640, 1280, 1920];


    /**
     * Change for local development.
     *
     * The server microservice will not be able to make a request to your localhost.
     * Therefore, when developing locally, you must specify a production or development server origin.
     *
     * Example:
     * https://tb.mts.ru
     *
     */
    public static imgOrigin: string = location.origin;

    public resultUrl: string = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    public resizeCheckTimeout: number = 0;

    public thisComponent: HTMLImageElement | null = null;

    protected sourceUrl: string = "";

    protected readonly extensionsRegexp: RegExp = /\.\w+$/u;

    protected readonly windowResizeHandler: EventListenerOrEventListenerObject;

    protected lastOptimalSize: number = 0;

    /**
     * Serves to prevent recursion when resizing images to determine the optimal size.
     * This recursion can be caught with poor layout that does not take into account the scaling of images.
     */
    protected checks: number = 0;

    public constructor (props: P) {
        super(props);

        this.windowResizeHandler = (): void => this.onWindowResize();
    }

    public componentDidMount (): void {
        this.shouldComponentUpdate(this.props);
        window.addEventListener("resize", this.windowResizeHandler);
    }

    public shouldComponentUpdate (props: P): boolean {
        if (this.sourceUrl !== props.src) {
            this.sourceUrl = props.src;
            this.checks = 0;
            requestAnimationFrame(() => this.checkImage());
            return true;
        }
        return false;
    }

    public componentWillUnmount (): void {
        window.removeEventListener("resize", this.windowResizeHandler);
    }

    public render (): JSX.Element {
        return (
            <img
                alt={this.props.alt}
                className={this.props.className}
                onLoad={(): number => requestAnimationFrame(() => this.checkImage())}
                ref={(elem: HTMLImageElement | null): void => {
                    this.thisComponent = elem;
                    this.props.setRef?.(elem);
                }}
                src={this.resultUrl}
            />
        );
    }

    protected async checkImage (isResize: boolean = false): Promise<void> {
        if (this.checks > 1) {
            return;
        }

        const isCheckProcess = await this.checkSupportFormat();
        if (isCheckProcess) {
            return;
        }

        // Checks +1 after check webp support
        this.checks += 1;

        this.processImage(isResize);
    }

    protected processImage (isResize: boolean): void {
        const containerSize = this.getContainerSize();
        const optimalSize = this.getOptimalSize(containerSize);
        this.showWarningOnResize(isResize, optimalSize);
        const url = this.makeResultUrl(optimalSize);
        this.applyResultUrl(url);
        this.showResultInLog(containerSize, optimalSize);
    }

    protected onWindowResize (): void {
        if (this.resizeCheckTimeout) {
            clearTimeout(this.resizeCheckTimeout);
        }

        this.resizeCheckTimeout = window.setTimeout(() => {
            this.checks = 0;
            this.checkImage(true);
        }, 500);
    }

    protected getContainerSize (): number {
        let containerSize: number = 0;

        let element: HTMLElement | null = this.thisComponent;

        while (containerSize < 2 && element) {
            containerSize = element.getBoundingClientRect().width ||
                Number.parseFloat(getComputedStyle(element).width) || 0;
            element = element.parentElement;
        }

        return containerSize * window.devicePixelRatio;
    }

    protected getOptimalSize (containerSize: number): number {
        let index: number = Image.controlPoints
            .findIndex((width: number) => containerSize <= width);

        // If bigger then maximum size or NaN
        if (index < 0) {
            index = Image.controlPoints.length - 1;
        }

        // Make manual more or less size
        index += this.props.offset ?? 0;

        // If offset make out of boundary
        if (index < 0) {
            index = 0;
        } else if (index >= Image.controlPoints.length) {
            index = Image.controlPoints.length - 1;
        }

        return Image.controlPoints[index];
    }

    protected makeResultUrl (optimalSize: number): URL {
        const sourceUrl = new URL(this.sourceUrl, Image.imgOrigin);

        const url = new URL("/optimizer/optimize", location.origin);
        url.searchParams.set("src", sourceUrl.toString());
        url.searchParams.set("size", String(optimalSize));

        if (typeof this.props.quality === "number") {
            url.searchParams.set("quality", String(this.props.quality));
        }

        const format = this.extractImageFormat(sourceUrl.pathname);
        url.searchParams.set("format", format);

        return url;
    }

    protected extractImageFormat (path: string): string {
        let format = "";

        const match: RegExpExecArray | null = this.extensionsRegexp.exec(path);

        if (Image.isAvif === true) {
            format = "avif";
        } else if (Image.isWebP === true) {
            format = "webp";
        } else {
            format = String(match?.[0])
                .replace(".", "")
                .replace("jpg", "jpeg");
        }

        return format;
    }

    protected applyResultUrl (url: URL): void {
        const resultUrl = url.toString();
        if (this.resultUrl !== resultUrl && this.thisComponent) {
            this.resultUrl = resultUrl;
            this.thisComponent.src = this.resultUrl;
        }
    }

    /**
     * This function should motivate the developer to make a layout that does not cause resizing.
     *
     * @param {boolean} isResize
     * @param {number} optimalSize
     */
    protected showWarningOnResize (isResize: boolean, optimalSize: number): void {
        if (
            !isResize &&
            this.lastOptimalSize >= 0 &&
            this.lastOptimalSize !== optimalSize
        ) {
            // eslint-disable-next-line no-console
            console.warn(
                "New image size",
                this.lastOptimalSize,
                optimalSize,
                this.sourceUrl
            );
        }
        this.lastOptimalSize = optimalSize;
    }

    protected showResultInLog (containerSize: number, optimalSize: number): void {
        if (process.env.NODE_ENV !== "production" && Image.isShowDiagnostic) {
            // eslint-disable-next-line no-console
            console.log([
                "🏄 Image optimization:",
                `Container size ${containerSize}px,`,
                `optimal size ${optimalSize},`,
                `image ${this.sourceUrl}`
            ].join(" "));
        }
    }

    protected async checkSupportFormat (): Promise<boolean> {
        if (Image.isAvif === null) {
            const result: boolean = await checkAvifFeature();
            // !!! Eslint alert it's true, upgrade algorithm later
            // eslint-disable-next-line require-atomic-updates
            Image.isAvif = result;
            this.checkImage();
            return true;
        } else if (Image.isWebP === null) {
            const result: boolean = await checkWebpFeature();
            // eslint-disable-next-line require-atomic-updates
            Image.isWebP = result;
            this.checkImage();
            return true;
        }

        return false;
    }

}
