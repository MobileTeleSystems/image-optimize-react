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

    public resultUrl: string = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    public resizeCheckTimeout: number = 0;

    public thisComponent!: HTMLImageElement | null;

    private sourceUrl: string = "";

    private readonly extensionsRegexp: RegExp = /\.\w+$/u;

    private readonly controlPoints: number[] = [160, 320, 640, 1280, 1920];

    private readonly windowResizeHandler: EventListenerOrEventListenerObject;

    private lastOptimalSize: number = -1;

    private checks: number = 0;

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

    // eslint-disable-next-line max-statements, complexity, max-lines-per-function
    private async checkImage (isResize: boolean = false): Promise<void> {
        if (!this.thisComponent) {
            return;
        }

        if (this.checks > 1) {
            return;
        }

        if (Image.isAvif === null) {
            const result: boolean = await checkAvifFeature();
            // !!! Eslint alert it's true, upgrade algorithm later
            // eslint-disable-next-line require-atomic-updates
            Image.isAvif = result;
            this.checkImage();
            return;
        }

        if (!Image.isAvif && Image.isWebP === null) {
            const result: boolean = await checkWebpFeature();
            // eslint-disable-next-line require-atomic-updates
            Image.isWebP = result;
            this.checkImage();
            return;
        }

        // Checks +1 after check webp support
        this.checks += 1;

        // Find optimal size
        let containerSize: number = 0;
        let element: HTMLElement | null = this.thisComponent;
        while (containerSize < 2 && Boolean(element)) {
            containerSize = element.getBoundingClientRect().width ||
                Number.parseFloat(getComputedStyle(element).width) || 0;
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            element = element.parentElement as HTMLElement;
        }

        containerSize *= window.devicePixelRatio;
        let indexOptimalSize: number = this.controlPoints
            .findIndex((width: number) => containerSize <= width);

        if (indexOptimalSize < 0) { // If bigger then maximum size or NaN
            indexOptimalSize = this.controlPoints.length - 1;
        }

        indexOptimalSize += this.props.offset ?? 0;
        if (indexOptimalSize < 0) {
            indexOptimalSize = 0;
        } else if (indexOptimalSize >= this.controlPoints.length) {
            indexOptimalSize = this.controlPoints.length - 1;
        }

        if (!isResize && this.lastOptimalSize >= 0 && this.lastOptimalSize !== indexOptimalSize) {
            // eslint-disable-next-line no-console
            console.warn("New image size", this.controlPoints[this.lastOptimalSize], this.controlPoints[indexOptimalSize], this.sourceUrl);
        }
        this.lastOptimalSize = indexOptimalSize;

        // Make correct source url
        const sourceUrl = new URL(this.sourceUrl, location.origin);

        // Make result url
        const url = new URL("/optimizer/optimize", location.origin);
        url.searchParams.set("src", sourceUrl.toString());
        url.searchParams.set("size", String(this.controlPoints[indexOptimalSize]));

        if (typeof this.props.quality === "number") {
            url.searchParams.set("quality", String(this.props.quality));
        }

        const match: RegExpExecArray | null = this.extensionsRegexp.exec(sourceUrl.pathname);
        let format = "";
        if (Image.isAvif) {
            format = "avif";
        } else if (Image.isWebP === true) {
            format = "webp";
        } else {
            format = String(match?.[0])
                .replace(".", "")
                .replace("jpg", "jpeg");
        }
        url.searchParams.set("format", format);

        // Apply result url
        const resultUrl = url.toString();
        if (this.resultUrl !== resultUrl) {
            this.resultUrl = resultUrl;
            this.thisComponent.src = this.resultUrl;
            if (process.env.NODE_ENV !== "production" && Image.isShowDiagnostic) {
                // eslint-disable-next-line no-console
                console.log([
                    "🏄 Image optimization:",
                    `Container size ${containerSize}px,`,
                    `optimal size ${this.controlPoints[indexOptimalSize]},`,
                    `image ${this.sourceUrl}`
                ].join(" "));
            }
        }
    }

    private onWindowResize (): void {
        if (this.resizeCheckTimeout) {
            clearTimeout(this.resizeCheckTimeout);
        }

        this.resizeCheckTimeout = window.setTimeout(() => {
            this.checks = 0;
            this.checkImage(true);
        }, 500);
    }

}
