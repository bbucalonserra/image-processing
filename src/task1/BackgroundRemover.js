/** Removes the backdrop from a provided image. */
class BackgroundRemover {
    /**
     * @param {MaskRefiner} refiner - Applied to the raw mask.
     */
    constructor(refiner) {
        this.refiner = refiner;
    }

    /**
     * Cuts the background out using the stored row: read the colour space,
     * threshold in it, refine the mask, write the result as an alpha channel.
     * @param {p5.Image} source - The provided image.
     * @param {Array<number>} setting - The [colourSpace, c1, c2, c3] row.
     * @return {p5.Image} Copy whose background pixels are transparent.
     */
    removeBackground(source, setting) {
        const w = source.width;
        const h = source.height;

        source.loadPixels();
        const mask = setting[0] === 1
            ? this.maskByHsb(source, setting)
            : this.maskByRgb(source, setting);

        const alpha = this.refiner.refine(mask, w, h);

        const output = createImage(w, h);
        output.loadPixels();
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const index = PixelUtilities.pixelIndex(x, y, w);
                output.pixels[index] = source.pixels[index];
                output.pixels[index + 1] = source.pixels[index + 1];
                output.pixels[index + 2] = source.pixels[index + 2];
                output.pixels[index + 3] = alpha[x + y * w];
            }
        }
        output.updatePixels();
        return output;
    }

    /**
     * Background when all three channels are above their own minimum.
     * @param {p5.Image} source - Image with its pixels loaded.
     * @param {Array<number>} setting - The [0, minRed, minGreen, minBlue] row.
     * @return {Uint8Array} 1 where the pixel is background.
     */
    maskByRgb(source, setting) {
        const w = source.width;
        const h = source.height;
        const mask = new Uint8Array(w * h);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const index = PixelUtilities.pixelIndex(x, y, w);
                const isBackground =
                    source.pixels[index] >= setting[1] &&
                    source.pixels[index + 1] >= setting[2] &&
                    source.pixels[index + 2] >= setting[3];
                mask[x + y * w] = isBackground ? 1 : 0;
            }
        }
        return mask;
    }

    /**
     * Background when the hue is near the backdrop hue, the saturation is low
     * and the brightness is high. Separating colour from lightness is what
     * keeps a white shirt while dropping a white wall (week 13).
     * @param {p5.Image} source - Image with its pixels loaded.
     * @param {Array<number>} setting - The [1, hueRange, maxSat, minBri] row.
     * @return {Uint8Array} 1 where the pixel is background.
     */
    maskByHsb(source, setting) {
        const w = source.width;
        const h = source.height;
        const mask = new Uint8Array(w * h);
        const backdropHue = this.sampleBackdropHue(source);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const index = PixelUtilities.pixelIndex(x, y, w);
                const hsb = PixelUtilities.rgbToHsb(
                    source.pixels[index],
                    source.pixels[index + 1],
                    source.pixels[index + 2]
                );

                // Hue only votes once the pixel carries enough colour.
                const hueGap = PixelUtilities.hueDistance(hsb[0], backdropHue);
                const hueAgrees =
                    hsb[1] <= ThresholdSettings.NEUTRAL_SATURATION ||
                    hueGap <= setting[1];

                const isBackground =
                    hueAgrees && hsb[1] <= setting[2] && hsb[2] >= setting[3];
                mask[x + y * w] = isBackground ? 1 : 0;
            }
        }
        return mask;
    }

    /**
     * Backdrop hue taken from the two top corners, the only regions free of
     * the subject in all eight images.
     * @param {p5.Image} source - Image with its pixels loaded.
     * @return {number} Mean backdrop hue in degrees.
     */
    sampleBackdropHue(source) {
        const w = source.width;
        const h = source.height;
        const blockW = Math.max(1, Math.floor(w * 0.06));
        const blockH = Math.max(1, Math.floor(h * 0.06));

        // Averaged as unit vectors so hues either side of 0 do not cancel.
        let sumX = 0;
        let sumY = 0;
        let counted = 0;

        for (let y = 0; y < blockH; y++) {
            for (let x = 0; x < w; x++) {
                if (x >= blockW && x < w - blockW) continue;
                const index = PixelUtilities.pixelIndex(x, y, w);
                const hsb = PixelUtilities.rgbToHsb(
                    source.pixels[index],
                    source.pixels[index + 1],
                    source.pixels[index + 2]
                );
                if (hsb[1] <= ThresholdSettings.NEUTRAL_SATURATION) continue;
                sumX += Math.cos(radians(hsb[0]));
                sumY += Math.sin(radians(hsb[0]));
                counted++;
            }
        }

        if (counted === 0) return 0;
        const hue = degrees(Math.atan2(sumY / counted, sumX / counted));
        return hue < 0 ? hue + 360 : hue;
    }
}
