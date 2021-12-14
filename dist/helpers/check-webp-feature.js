"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWebpFeature = void 0;
var checkWebpFeature = function () { return new Promise(function (resolve) {
    var kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////" +
            "AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    var img = new Image();
    img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        resolve(result);
    };
    img.onerror = function () {
        resolve(false);
    };
    img.src = "data:image/webp;base64,".concat(kTestImages.lossless);
}); };
exports.checkWebpFeature = checkWebpFeature;
//# sourceMappingURL=check-webp-feature.js.map