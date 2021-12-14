"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var check_avif_feature_1 = require("../helpers/check-avif-feature");
var check_webp_feature_1 = require("../helpers/check-webp-feature");
var Image = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(Image, _super);
    function Image(props) {
        var _this = _super.call(this, props) || this;
        _this.resultUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        _this.resizeCheckTimeout = 0;
        _this.sourceUrl = "";
        _this.extensionsRegexp = /\.\w+$/u;
        _this.controlPoints = [160, 320, 640, 1280, 1920];
        _this.lastOptimalSize = -1;
        _this.checks = 0;
        _this.windowResizeHandler = function () { return _this.onWindowResize(); };
        return _this;
    }
    Image.prototype.componentDidMount = function () {
        this.shouldComponentUpdate(this.props);
        window.addEventListener("resize", this.windowResizeHandler);
    };
    Image.prototype.shouldComponentUpdate = function (props) {
        var _this = this;
        if (this.sourceUrl !== props.src) {
            this.sourceUrl = props.src;
            this.checks = 0;
            requestAnimationFrame(function () { return _this.checkImage(); });
            return true;
        }
        return false;
    };
    Image.prototype.componentWillUnmount = function () {
        window.removeEventListener("resize", this.windowResizeHandler);
    };
    Image.prototype.render = function () {
        var _this = this;
        return ((0, jsx_runtime_1.jsx)("img", { alt: this.props.alt, className: this.props.className, onLoad: function () { return requestAnimationFrame(function () { return _this.checkImage(); }); }, ref: function (elem) {
                var _a, _b;
                _this.thisComponent = elem;
                (_b = (_a = _this.props).setRef) === null || _b === void 0 ? void 0 : _b.call(_a, elem);
            }, src: this.resultUrl }, void 0));
    };
    // eslint-disable-next-line max-statements, complexity, max-lines-per-function
    Image.prototype.checkImage = function (isResize) {
        var _a;
        if (isResize === void 0) { isResize = false; }
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var result, result, containerSize, element, indexOptimalSize, sourceUrl, url, match, format, resultUrl;
            return (0, tslib_1.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.thisComponent) {
                            return [2 /*return*/];
                        }
                        if (this.checks > 1) {
                            return [2 /*return*/];
                        }
                        if (!(Image.isAvif === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, check_avif_feature_1.checkAvifFeature)()];
                    case 1:
                        result = _b.sent();
                        // !!! Eslint alert it's true, upgrade algorithm later
                        // eslint-disable-next-line require-atomic-updates
                        Image.isAvif = result;
                        this.checkImage();
                        return [2 /*return*/];
                    case 2:
                        if (!(!Image.isAvif && Image.isWebP === null)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, check_webp_feature_1.checkWebpFeature)()];
                    case 3:
                        result = _b.sent();
                        // eslint-disable-next-line require-atomic-updates
                        Image.isWebP = result;
                        this.checkImage();
                        return [2 /*return*/];
                    case 4:
                        // Checks +1 after check webp support
                        this.checks += 1;
                        containerSize = 0;
                        element = this.thisComponent;
                        while (containerSize < 2 && Boolean(element)) {
                            containerSize = element.getBoundingClientRect().width ||
                                Number.parseFloat(getComputedStyle(element).width) || 0;
                            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                            element = element.parentElement;
                        }
                        containerSize *= window.devicePixelRatio;
                        indexOptimalSize = this.controlPoints
                            .findIndex(function (width) { return containerSize <= width; });
                        if (indexOptimalSize < 0) { // If bigger then maximum size or NaN
                            indexOptimalSize = this.controlPoints.length - 1;
                        }
                        indexOptimalSize += (_a = this.props.offset) !== null && _a !== void 0 ? _a : 0;
                        if (indexOptimalSize < 0) {
                            indexOptimalSize = 0;
                        }
                        else if (indexOptimalSize >= this.controlPoints.length) {
                            indexOptimalSize = this.controlPoints.length - 1;
                        }
                        if (!isResize && this.lastOptimalSize >= 0 && this.lastOptimalSize !== indexOptimalSize) {
                            // eslint-disable-next-line no-console
                            console.warn("New image size", this.controlPoints[this.lastOptimalSize], this.controlPoints[indexOptimalSize], this.sourceUrl);
                        }
                        this.lastOptimalSize = indexOptimalSize;
                        sourceUrl = new URL(this.sourceUrl, location.origin);
                        url = new URL("/optimizer/optimize", location.origin);
                        url.searchParams.set("src", sourceUrl.toString());
                        url.searchParams.set("size", String(this.controlPoints[indexOptimalSize]));
                        if (typeof this.props.quality === "number") {
                            url.searchParams.set("quality", String(this.props.quality));
                        }
                        match = this.extensionsRegexp.exec(sourceUrl.pathname);
                        format = "";
                        if (Image.isAvif) {
                            format = "avif";
                        }
                        else if (Image.isWebP === true) {
                            format = "webp";
                        }
                        else {
                            format = String(match === null || match === void 0 ? void 0 : match[0])
                                .replace(".", "")
                                .replace("jpg", "jpeg");
                        }
                        url.searchParams.set("format", format);
                        resultUrl = url.toString();
                        if (this.resultUrl !== resultUrl) {
                            this.resultUrl = resultUrl;
                            this.thisComponent.src = this.resultUrl;
                            if (process.env.NODE_ENV !== "production" && Image.isShowDiagnostic) {
                                // eslint-disable-next-line no-console
                                console.log([
                                    "🏄 Image optimization:",
                                    "Container size ".concat(containerSize, "px,"),
                                    "optimal size ".concat(this.controlPoints[indexOptimalSize], ","),
                                    "image ".concat(this.sourceUrl)
                                ].join(" "));
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Image.prototype.onWindowResize = function () {
        var _this = this;
        if (this.resizeCheckTimeout) {
            clearTimeout(this.resizeCheckTimeout);
        }
        this.resizeCheckTimeout = window.setTimeout(function () {
            _this.checks = 0;
            _this.checkImage(true);
        }, 500);
    };
    Image.isShowDiagnostic = false;
    Image.isAvif = null;
    Image.isWebP = null;
    return Image;
}(react_1.default.Component));
exports.Image = Image;
//# sourceMappingURL=Image.js.map