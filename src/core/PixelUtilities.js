/** Pixel helpers shared by both tasks. */
class PixelUtilities {
    /**
     * Converts a 2D coordinate into an index in the RGBA array (week 13).
     * @param {number} x - Column of the pixel.
     * @param {number} y - Row of the pixel.
     * @param {number} imageWidth - Image width in pixels.
     * @return {number} Index of the red channel of that pixel.
     */
    static pixelIndex(x, y, imageWidth) {
        return (x + y * imageWidth) * 4;
    }

    /**
     * Grey level from the luma weights (week 15).
     * @param {number} red - Red channel, 0 to 255.
     * @param {number} green - Green channel, 0 to 255.
     * @param {number} blue - Blue channel, 0 to 255.
     * @return {number} Grey level, 0 to 255.
     */
    static luma(red, green, blue) {
        return red * 0.299 + green * 0.587 + blue * 0.114;
    }

    /**
     * Converts RGB to HSB without a p5 colour object per pixel (week 13).
     * @param {number} red - Red channel, 0 to 255.
     * @param {number} green - Green channel, 0 to 255.
     * @param {number} blue - Blue channel, 0 to 255.
     * @return {Array<number>} [hue 0-360, saturation 0-100, brightness 0-100].
     */
    static rgbToHsb(red, green, blue) {
        const high = Math.max(red, green, blue);
        const low = Math.min(red, green, blue);
        const delta = high - low;

        const brightness = (high / 255) * 100;
        const saturation = high === 0 ? 0 : (delta / high) * 100;

        let hue = 0;
        if (delta > 0) {
            if (high === red) {
                hue = 60 * (((green - blue) / delta) % 6);
            } else if (high === green) {
                hue = 60 * ((blue - red) / delta + 2);
            } else {
                hue = 60 * ((red - green) / delta + 4);
            }
        }
        if (hue < 0) hue += 360;

        return [hue, saturation, brightness];
    }

    /**
     * Distance between two hues, wrapping at 360.
     * @param {number} hueA - First hue in degrees.
     * @param {number} hueB - Second hue in degrees.
     * @return {number} Distance in degrees, 0 to 180.
     */
    static hueDistance(hueA, hueB) {
        const raw = Math.abs(hueA - hueB) % 360;
        return raw > 180 ? 360 - raw : raw;
    }

    /**
     * Scaled copy of an image. The original is not changed.
     * @param {p5.Image} source - Image to copy.
     * @param {number} maxWidth - Width limit in pixels.
     * @param {number} maxHeight - Height limit in pixels.
     * @return {p5.Image} The scaled copy.
     */
    static scaledCopy(source, maxWidth, maxHeight) {
        const factor = Math.min(
            1,
            maxWidth / source.width,
            maxHeight / source.height
        );
        const w = Math.max(1, Math.round(source.width * factor));
        const h = Math.max(1, Math.round(source.height * factor));

        const copyImage = createImage(w, h);
        copyImage.copy(
            source,
            0, 0, source.width, source.height,
            0, 0, w, h
        );
        return copyImage;
    }
}
