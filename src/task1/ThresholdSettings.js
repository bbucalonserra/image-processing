/**
 * Per image threshold table, thresholds[i] = [colourSpace, c1, c2, c3],
 * colourSpace 0 for RGB and 1 for HSB.
 */
class ThresholdSettings {
    /**
     * Saturation below which the hue test is skipped.
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
     * The table, one row per image, in the order of FILES. RGB rows hold the
     * minimum red, green and blue of a background pixel. HSB rows hold the
     * hue tolerance around the backdrop hue, the maximum saturation and the
     * minimum brightness. Both spaces were measured on every image and the
     * row kept is the one with fewer mistakes.
     * @return {Array<Array<number>>} thresholds[i] = [colourSpace, c1, c2, c3].
     */
    static get TABLE() {
        return [
            [1, 60, 12, 70],      // 1.jpg - dim warm grey wall.
            [0, 238, 238, 238],   // 2.jpg - white wall, white shirt.
            [1, 60, 10, 72],      // 3.jpg - light grey wall with a gradient.
            [0, 240, 240, 240],   // 4.jpg - white cut out.
            [0, 238, 238, 238],   // 5.jpg - white backdrop.
            [0, 238, 238, 238],   // 6.jpg - white backdrop.
            [1, 60, 6, 97],       // 7.jpg - white wall, white shirt.
            [1, 60, 8, 90]        // 8.jpg - warm off white wall.
        ];
    }

    /**
     * The row with fewer mistakes in the colour space not chosen, one per
     * image, kept so the comparison can be shown.
     * @return {Array<Array<number>>} Same format as TABLE.
     */
    static get ALTERNATIVES() {
        return [
            [0, 190, 190, 190],   // 1.jpg - best RGB attempt.
            [1, 60, 6, 94],       // 2.jpg - best HSB attempt.
            [0, 200, 200, 200],   // 3.jpg - best RGB attempt.
            [1, 60, 6, 98],       // 4.jpg - best HSB attempt.
            [1, 60, 6, 98],       // 5.jpg - best HSB attempt.
            [1, 60, 6, 98],       // 6.jpg - best HSB attempt.
            [0, 238, 238, 238],   // 7.jpg - best RGB attempt.
            [0, 215, 215, 215]    // 8.jpg - best RGB attempt.
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
     * @return {Array<number>} The row of the colour space not chosen.
     */
    static alternativeFor(index) {
        return ThresholdSettings.ALTERNATIVES[index];
    }

    /**
     * @param {number} index - Image index.
     * @return {string} The chosen row written out for the HUD.
     */
    static describe(index) {
        return ThresholdSettings.describeRow(ThresholdSettings.TABLE[index]);
    }

    /**
     * @param {Array<number>} row - A [colourSpace, c1, c2, c3] row.
     * @return {string} The row written out for the HUD.
     */
    static describeRow(row) {
        if (row[0] === 1) {
            return "HSB  hue +/-" + row[1] + "  sat <= " + row[2] +
                "  bri >= " + row[3];
        }
        return "RGB  r >= " + row[1] + "  g >= " + row[2] + "  b >= " + row[3];
    }
}
