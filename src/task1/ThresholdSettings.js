/**
 * Per image threshold table required by the brief.
 *
 * thresholds[i] = [colourSpace, c1, c2, c3], colourSpace 0 for RGB and 1 for
 * HSB. The other three are the threshold values of that colour space:
 *
 *   RGB (0): c1, c2, c3 are the minimum red, green and blue of a background
 *            pixel.
 *   HSB (1): c1 is the hue tolerance around the backdrop hue sampled at the
 *            top corners, c2 the maximum saturation, c3 the minimum
 *            brightness.
 *
 * Both colour spaces were measured on all eight images. RGB is used where the
 * backdrop is a clean white cut out, since one limit per channel separates it.
 * HSB is used on image 1, whose wall is dim and tinted, and on images 2 and 7,
 * where the subject wears white: there the saturation limit keeps the garment
 * while the brightness limit still drops the wall, which RGB cannot do.
 */
class ThresholdSettings {
    /**
     * Saturation below which hue is unstable, so the hue test is skipped.
     * @return {number} Saturation limit, 0 to 100.
     */
    static get NEUTRAL_SATURATION() {
        return 5;
    }

    /**
     * @return {Array<string>} Paths of the eight provided images.
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
     * The table, one row per image, in the same order as FILES.
     * @return {Array<Array<number>>} thresholds[i] = [colourSpace, c1, c2, c3].
     */
    static get TABLE() {
        return [
            [1, 60, 12, 70],      // 1.jpg - dim warm grey wall.
            [1, 60, 6, 94],       // 2.jpg - white wall, white shirt.
            [0, 200, 200, 200],   // 3.jpg - light grey wall with a gradient.
            [0, 240, 240, 240],   // 4.jpg - white cut out.
            [0, 238, 238, 238],   // 5.jpg - white backdrop.
            [0, 238, 238, 238],   // 6.jpg - white backdrop.
            [1, 60, 6, 97],       // 7.jpg - white wall, white shirt.
            [1, 60, 8, 90]        // 8.jpg - warm off white wall.
        ];
    }

    /**
     * @param {number} index - Image index.
     * @return {Array<number>} The [colourSpace, c1, c2, c3] row.
     */
    static settingFor(index) {
        return ThresholdSettings.TABLE[index];
    }

    /**
     * @param {number} index - Image index.
     * @return {string} The row written out for the HUD.
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
