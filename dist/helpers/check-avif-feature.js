"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvifFeature = void 0;
var checkAvifFeature = function () { return new Promise(function (resolve) {
    var img = new Image();
    img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        resolve(result);
    };
    img.onerror = function () {
        resolve(false);
    };
    // eslint-disable-next-line max-len
    img.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
}); };
exports.checkAvifFeature = checkAvifFeature;
//# sourceMappingURL=check-avif-feature.js.map