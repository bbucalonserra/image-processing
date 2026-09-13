/** Threshold table, thresholds[i] = [colourSpace, c1, c2, c3]. */
class ThresholdSettings {
    /** Saturation below which the hue test is skipped. */
    static get NEUTRAL_SATURATION() {
        return 5;
    }

    /** Paths of the eight provided images. */
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

    /** One caption per image. */
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

    /** The chosen row per image. RGB holds minimums, HSB holds limits. */
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

    /** The best row in the colour space not chosen, one per image. */
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

    /** The [colourSpace, c1, c2, c3] row. */
    static settingFor(index) {
        return ThresholdSettings.TABLE[index];
    }

    /** The row of the colour space not chosen. */
    static alternativeFor(index) {
        return ThresholdSettings.ALTERNATIVES[index];
    }

    /** The chosen row written out for the HUD. */
    static describe(index) {
        return ThresholdSettings.describeRow(ThresholdSettings.TABLE[index]);
    }

    /** The row written out for the HUD. */
    static describeRow(row) {
        if (row[0] === 1) {
            return "HSB  hue +/-" + row[1] + "  sat <= " + row[2] +
                "  bri >= " + row[3];
        }
        return "RGB  r >= " + row[1] + "  g >= " + row[2] + "  b >= " + row[3];
    }
}
