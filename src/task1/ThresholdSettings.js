/**
 * Class holding the per image threshold table required by the brief.
 *
 * Every entry follows thresholds[i] = [colourSpace, c1, c2, c3], where
 * colourSpace is 0 for RGB and 1 for HSB. The three remaining values are the
 * threshold values of the chosen colour space:
 *
 *   RGB (0): c1, c2, c3 are the minimum red, green and blue a pixel needs in
 *            order to be treated as background.
 *   HSB (1): c1 is the largest allowed hue distance from the background hue
 *            sampled at the top corners, c2 is the largest allowed saturation
 *            and c3 is the smallest allowed brightness.
 *
 * Both colour spaces were tried on all eight images. RGB wins where the
 * backdrop is a clean white cut out, because a single limit per channel is
 * enough. HSB wins where the backdrop is a dim or tinted grey (image 1), or
 * where the subject wears white or off white clothing (images 2 and 7): there
 * the saturation gate keeps the garment while the brightness gate still drops
 * the backdrop, which an RGB limit cannot separate.
 */
class ThresholdSettings {
    /**
     * Saturation below which the hue of a pixel is unstable, so the hue test
     * is skipped and only saturation and brightness decide.
     * @return {number} Saturation limit, 0 to 100.
     */
    static get NEUTRAL_SATURATION() {
        return 5;
    }

    /**
     * The eight source files, in carousel order.
     * @return {Array<string>} Relative paths of the provided images.
     */
    static get FILES() {
        return [
            "assets/task1/1.jpg",
            "assets/task1/2.jpg",
            "assets/task1/3.jpg",
            "assets/task1/4.jpg",
            "assets/task1/5.jpg",
            "assets/task1/6.jpg",
            "assets/task1/7.jpg",
            "assets/task1/8.jpg"
        ];
    }

    /**
     * Caption shown next to each image in the carousel.
     * @return {Array<string>} One caption per image.
     */
    static get CAPTIONS() {
        return [
            "EPISODE 1 - THE POINTER",
            "EPISODE 2 - STRIPES AND CURLS",
            "EPISODE 3 - THE PROFILE",
            "EPISODE 4 - THE SUIT",
            "EPISODE 5 - CLOSE UP",
            "EPISODE 6 - FOLDED ARMS",
            "EPISODE 7 - THE FLAT CAP",
            "EPISODE 8 - THE LONG HAIR"
        ];
    }

    /**
     * The threshold table itself, one row per image and in the same order as
     * FILES. Values were found by testing both colour spaces on every image.
     * @return {Array<Array<number>>} thresholds[i] = [colourSpace, c1, c2, c3].
     */
    static get TABLE() {
        return [
            [1, 60, 12, 70],      // 1.jpg - dim warm grey studio wall.
            [1, 60, 6, 96],       // 2.jpg - white wall behind a white shirt.
            [0, 200, 200, 200],   // 3.jpg - light grey wall with a gradient.
            [0, 240, 240, 240],   // 4.jpg - pure white cut out.
            [0, 238, 238, 238],   // 5.jpg - pure white studio backdrop.
            [0, 238, 238, 238],   // 6.jpg - pure white studio backdrop.
            [1, 60, 6, 97],       // 7.jpg - white wall behind a white shirt.
            [1, 60, 8, 90]        // 8.jpg - warm off white wall.
        ];
    }

    /**
     * @param {number} index - Image index.
     * @return {Array<number>} The [colourSpace, c1, c2, c3] row for that image.
     */
    static settingFor(index) {
        return ThresholdSettings.TABLE[index];
    }

    /**
     * @param {number} index - Image index.
     * @return {string} Readable summary of the row, used by the on screen HUD.
     */
    static describe(index) {
        const row = ThresholdSettings.TABLE[index];
        if (row[0] === 1) {
            return "HSB  hue +/-" + row[1] + "  sat <= " + row[2] +
                "  bri >= " + row[3];
        }
        return "RGB  r >= " + row[1] + "  g >= " + row[2] + "  b >= " + row[3];
    }
}
