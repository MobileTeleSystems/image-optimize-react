# React component for using optimized images in the browser.

Works in conjunction with the [Image Optimizer](https://github.com/MobileTeleSystems/image-optimize).

Optimizing images helps reduce image weight and increases website loading speed, which is very important for both users and search engines. For these purposes, we have created a microservice that perfectly copes with this task.

Features:
- Resize images for the user's screen size,
- Image compressions to reduce traffic,
- Converting images to modern formats such as webp and avif,
- Works with dynamically content, compression occurs on the fly,
- High compression speed, an average picture is processed in just 200 ms,
- Includes exporter of metrics for Prometheus,
- Supports basic authorization for multiple domains and endpoints,
- Supports security restrictions for allowed addresses.

### Before use
[The optimization microservice](https://github.com/MobileTeleSystems/image-optimize) must be deployed on the server along the path `/optimizer`. React component will use it.

### Instalation
Run script:
```
npm i @mts-pjsc/image-optimize
```

### Using

Just replace the \<img\> element with the Image component from the package. The component is fully compatible with the \<img\> element. Next, the component will do all the magic on its own.

Sample:
```typescript
import {Image} from "@mts-pjsc/image-optimize";

<Image
    alt="Sample of work Image Optimizer"
    src="/static/landing/images-getmeback/phone-fon.png"
/>
```
