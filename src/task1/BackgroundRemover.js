/** Class removing the studio backdrop from a provided image. */
class BackgroundRemover {
    /**
     * @param {MaskRefiner} refiner - Post processing applied to the raw mask.
     */
    constructor(refiner) {
        this.refiner = refiner;
    }

    /**
     * Produces a foreground only copy of an image using its stored threshold
     * row, as the brief asks: read the colour space from the row, threshold in
     * that space, then write the result into a fresh image with an alpha
     * channel.
     * @param {p5.Image} source - The provided image.
     * @param {Array<number>} setting - The [colourSpace, c1, c2, c3] row.
     * @return {p5.Image} A copy whose background pixels are transparent.
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
     * Marks a pixel as background when all three channels sit above their own
     * minimum, which suits the clean white cut outs.
     * @param {p5.Image} source - Image with its pixels already loaded.
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
     * Marks a pixel as background when its hue is close to the backdrop hue,
     * its saturation is low and its brightness is high. Splitting colour from
     * lightness this way is what keeps a white shirt while still dropping a
     * white wall, which an RGB limit cannot do (colour spaces, week 13).
     * @param {p5.Image} source - Image with its pixels already loaded.
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

                // Hue is unstable on near neutral pixels, so it only votes
                // once the pixel carries enough colour to be trusted.
                const hueAgrees =
                    hsb[1] <= ThresholdSettings.NEUTRAL_SATURATION ||
                    PixelUtilities.hueDistance(hsb[0], backdropHue) <= setting[1];

                const isBackground =
                    hueAgrees && hsb[1] <= setting[2] && hsb[2] >= setting[3];
                mask[x + y * w] = isBackground ? 1 : 0;
            }
        }
        return mask;
    }

    /**
     * Estimates the hue of the backdrop from the two top corners, which are
     * the only areas guaranteed to be free of the subject in all eight images.
     * @param {p5.Image} source - Image with its pixels already loaded.
     * @return {number} The average backdrop hue in degrees.
     */
    sampleBackdropHue(source) {
        const w = source.width;
        const h = source.height;
        const blockW = Math.max(1, Math.floor(w * 0.06));
        const blockH = Math.max(1, Math.floor(h * 0.06));

        // Hues are averaged as unit vectors so that values either side of
        // 0 degrees do not cancel each other out.
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
