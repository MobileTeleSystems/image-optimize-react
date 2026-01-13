# @mts-pjsc/image-optimize

[![npm version](https://img.shields.io/npm/v/@mts-pjsc/image-optimize.svg?style=flat)](https://www.npmjs.com/package/@mts-pjsc/image-optimize)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

A React component for automatic image optimization. Works in conjunction with the [Image Optimizer](https://github.com/MobileTeleSystems/image-optimize) microservice.

## Overview

This library provides a drop-in replacement for the standard `<img>` element that automatically optimizes images based on the user's device, screen size, and browser capabilities. The component communicates with a backend optimization service to deliver the most efficient image format and size.

## Features

- **Responsive resizing** — automatically selects optimal image dimensions based on container size and device pixel ratio
- **Modern format support** — converts images to WebP or AVIF when supported by the browser
- **Quality control** — configurable compression quality for fine-tuned optimization
- **Lazy evaluation** — determines optimal size after component mount for accurate container measurement
- **Resize handling** — recalculates optimal image size on window resize with debouncing
- **Next.js compatible** — includes "use client" directive for React Server Components support
- **Zero configuration** — works out of the box with sensible defaults

## Prerequisites

The [Image Optimizer](https://github.com/MobileTeleSystems/image-optimize) microservice must be deployed and accessible at the `/optimizer` path on your server.

## Installation

```bash
npm install @mts-pjsc/image-optimize
```

## Requirements

- React 16.0.0 or higher

## Basic Usage

Replace standard `<img>` elements with the `Image` component:

```tsx
import { Image } from "@mts-pjsc/image-optimize";

function App() {
    return (
        <Image
            src="/images/hero-banner.png"
            alt="Hero banner"
        />
    );
}
```

## API Reference

### Image Component

The `Image` component accepts all standard `<img>` attributes plus the following:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Required. Image source URL |
| `alt` | `string` | — | Required. Alternative text for accessibility |
| `offset` | `number` | `0` | Adjust the selected size breakpoint (-1 for smaller, +1 for larger) |
| `quality` | `number` | — | Compression quality (0-100). Uses server default if not specified |
| `setRef` | `(elem: HTMLImageElement \| null) => void` | — | Callback to receive the underlying img element reference |

### Static Configuration

Configure global behavior through static properties:

```tsx
import { Image } from "@mts-pjsc/image-optimize";

// Skip optimization and use original URLs (useful for local development)
Image.isUseSourceUrl = process.env.NODE_ENV !== "production";

// Override image origin for CORS or microfrontend scenarios
Image.imgOrigin = "https://cdn.example.com";

// Custom breakpoints for responsive sizing (default: [160, 320, 640, 1280, 1920])
Image.controlPoints = [320, 640, 1024, 1440, 2560];

// Enable diagnostic logging in development
Image.isShowDiagnostic = true;
```

## Examples

### With Quality Control

```tsx
<Image
    src="/images/photo.jpg"
    alt="High quality photo"
    quality={85}
/>
```

### With Size Offset

```tsx
// Request a larger size than calculated (useful for hero images)
<Image
    src="/images/banner.png"
    alt="Banner"
    offset={1}
/>
```

### With Ref Callback

```tsx
<Image
    src="/images/chart.png"
    alt="Chart"
    setRef={(elem) => {
        if (elem) {
            elem.decode().then(() => console.log("Image decoded"));
        }
    }}
/>
```

### Development Configuration

```tsx
// In your app initialization
import { Image } from "@mts-pjsc/image-optimize";

if (process.env.NODE_ENV !== "production") {
    Image.isUseSourceUrl = true;
    Image.isShowDiagnostic = true;
}
```

## How It Works

1. The component mounts and measures the container width
2. Based on container size and device pixel ratio, it selects an optimal size from the control points
3. Browser capabilities are detected (AVIF > WebP > original format)
4. A request URL is constructed: `/optimizer/optimize?src=...&size=...&format=...`
5. The optimized image is loaded and displayed
6. On window resize, the process repeats with debouncing to prevent excessive requests

## Helper Functions

The library also exports utility functions for format detection:

```tsx
import { checkWebpFeature, checkAvifFeature } from "@mts-pjsc/image-optimize";

const supportsWebP = await checkWebpFeature();
const supportsAvif = await checkAvifFeature();
```

## License

Apache-2.0

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Related Projects

- [Image Optimizer](https://github.com/MobileTeleSystems/image-optimize) — Backend microservice for image optimization
