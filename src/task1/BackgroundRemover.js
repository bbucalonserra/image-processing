/** Removes the backdrop from a provided image. */
class BackgroundRemover {
    /** Takes the refiner applied to the threshold mask. */
    constructor(refiner) {
        this.refiner = refiner;
    }

    /** Cuts the background out with the stored row and writes the alpha. */
    removeBackground(source, setting) {
        return this.removeBackgroundWithCounts(source, setting).image;
    }

    /** Same work, and also counts backdrop left and subject given back. */
    removeBackgroundWithCounts(source, setting) {
        const w = source.width;
        const h = source.height;

        source.loadPixels();
        const mask = setting[0] === 1
            ? this.maskByHsb(source, setting)
            : this.maskByRgb(source, setting);

        const refined = this.refiner.refineWithCounts(mask, w, h);
        const alpha = refined.alpha;

        // The two top corners hold no subject in any of the eight images.
        const blockW = Math.max(1, Math.floor(w * 0.06));
        const blockH = Math.max(1, Math.floor(h * 0.06));
        let backdropLeft = 0;
        for (let y = 0; y < blockH; y++) {
            for (let x = 0; x < w; x++) {
                if (x >= blockW && x < w - blockW) continue;
                if (mask[x + y * w] === 0) backdropLeft++;
            }
        }

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
        return {
            image: output,
            backdropLeft: backdropLeft,
            reclaimed: refined.reclaimed
        };
    }

    /** Background when all three channels are above their own minimum. */
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

    /** Background when hue, saturation and brightness all pass (week 13). */
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

                // Hue only counts once the saturation is over the limit.
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

    /** Backdrop hue taken from the two top corners. */
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
