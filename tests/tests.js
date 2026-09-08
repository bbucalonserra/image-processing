/**
 * Checks the image processing functions against values worked out by hand.
 * The page needs no p5 canvas: every function under test works on plain
 * arrays, and the two that read an image are given a stub with the same
 * shape p5 provides.
 */
class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Records one check.
     * @param {string} name - What is being checked.
     * @param {boolean} condition - Result of the check.
     * @param {string} detail - Value seen, shown when the check fails.
     * @return {void}
     */
    check(name, condition, detail) {
        if (condition) this.passed++;
        else this.failed++;

        const line = document.createElement("p");
        line.className = condition ? "pass" : "fail";
        line.textContent = (condition ? "PASS  " : "FAIL  ") + name +
            (condition ? "" : "   got " + detail);
        document.body.appendChild(line);
    }

    /**
     * Records a check on a number with a tolerance.
     * @param {string} name - What is being checked.
     * @param {number} actual - Value produced.
     * @param {number} expected - Value wanted.
     * @param {number} tolerance - Allowed difference.
     * @return {void}
     */
    checkClose(name, actual, expected, tolerance) {
        this.check(
            name,
            Math.abs(actual - expected) <= tolerance,
            actual + " instead of " + expected
        );
    }

    /**
     * Prints the totals.
     * @return {void}
     */
    summarise() {
        const line = document.createElement("h2");
        line.textContent = this.passed + " passed, " + this.failed + " failed";
        line.className = this.failed === 0 ? "pass" : "fail";
        document.body.insertBefore(line, document.body.firstChild);
    }
}

/**
 * Builds a stub with the fields the image reading code uses.
 * @param {number} w - Width in pixels.
 * @param {number} h - Height in pixels.
 * @param {function} valueAt - Receives x and y, returns a grey level.
 * @return {object} An object shaped like a p5.Image.
 */
function stubImage(w, h, valueAt) {
    const pixels = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const value = valueAt(x, y);
            const index = (x + y * w) * 4;
            pixels[index] = value;
            pixels[index + 1] = value;
            pixels[index + 2] = value;
            pixels[index + 3] = 255;
        }
    }
    return { width: w, height: h, pixels: pixels, loadPixels() {} };
}

/**
 * Runs every check.
 * @return {void}
 */
function runTests() {
    const t = new TestRunner();

    // Pixel index, the 2D to 1D conversion of week 13.
    const first = PixelUtilities.pixelIndex(0, 0, 10);
    const second = PixelUtilities.pixelIndex(1, 0, 10);
    const nextRow = PixelUtilities.pixelIndex(0, 1, 10);
    t.check("pixelIndex first pixel", first === 0, first);
    t.check("pixelIndex second pixel of a row", second === 4, second);
    t.check("pixelIndex second row", nextRow === 40, nextRow);

    // Luma weights.
    t.checkClose(
        "luma of white", PixelUtilities.luma(255, 255, 255), 255, 0.001
    );
    t.checkClose("luma of black", PixelUtilities.luma(0, 0, 0), 0, 0.001);
    t.check("luma weights green above red",
        PixelUtilities.luma(0, 255, 0) > PixelUtilities.luma(255, 0, 0),
        PixelUtilities.luma(0, 255, 0));

    // RGB to HSB.
    const red = PixelUtilities.rgbToHsb(255, 0, 0);
    t.checkClose("red hue", red[0], 0, 0.001);
    t.checkClose("red saturation", red[1], 100, 0.001);
    t.checkClose("red brightness", red[2], 100, 0.001);

    const green = PixelUtilities.rgbToHsb(0, 255, 0);
    t.checkClose("green hue", green[0], 120, 0.001);

    const blue = PixelUtilities.rgbToHsb(0, 0, 255);
    t.checkClose("blue hue", blue[0], 240, 0.001);

    const white = PixelUtilities.rgbToHsb(255, 255, 255);
    t.checkClose("white saturation", white[1], 0, 0.001);
    t.checkClose("white brightness", white[2], 100, 0.001);

    const grey = PixelUtilities.rgbToHsb(128, 128, 128);
    t.checkClose("mid grey saturation", grey[1], 0, 0.001);
    t.checkClose("mid grey brightness", grey[2], 50.2, 0.2);

    // Hue distance wraps at 360.
    t.checkClose("hue distance across zero",
        PixelUtilities.hueDistance(350, 10), 20, 0.001);
    t.checkClose("hue distance opposite",
        PixelUtilities.hueDistance(0, 180), 180, 0.001);
    t.checkClose("hue distance never above 180",
        PixelUtilities.hueDistance(10, 350), 20, 0.001);

    // Direction classification, including the dead zone.
    const motion = new MotionEstimator(0.01, 500, 350);
    t.check("shift right", motion.classify(80, 0).label === "RIGHT",
        motion.classify(80, 0).label);
    t.check("shift left", motion.classify(-90, 0).label === "LEFT",
        motion.classify(-90, 0).label);
    t.check("shift up", motion.classify(0, -90).label === "UP",
        motion.classify(0, -90).label);
    t.check("shift down", motion.classify(0, 90).label === "DOWN",
        motion.classify(0, 90).label);
    t.check("shift up and left", motion.classify(-75, -75).label === "UP-LEFT",
        motion.classify(-75, -75).label);
    t.check("shift down and right",
        motion.classify(75, 75).label === "DOWN-RIGHT",
        motion.classify(75, 75).label);
    t.check("shift up and right",
        motion.classify(75, -80).label === "UP-RIGHT",
        motion.classify(75, -80).label);
    t.check("shift down and left",
        motion.classify(-80, 80).label === "DOWN-LEFT",
        motion.classify(-80, 80).label);
    t.check("shift inside the dead zone",
        motion.classify(1, 1).label === "NONE", motion.classify(1, 1).label);
    t.check("arrow angle matches the label",
        motion.classify(0, -90).angle === 270, motion.classify(0, -90).angle);

    // Centroid, the method the brief sets out.
    const twoDots = stubImage(10, 10, (x, y) => {
        if (x === 2 && y === 2) return 255;
        if (x === 6 && y === 8) return 255;
        return 0;
    });
    const centroid = CentroidAnalyser.compute(twoDots);
    t.checkClose("centroid x of two pixels", centroid.x, 4, 0.001);
    t.checkClose("centroid y of two pixels", centroid.y, 5, 0.001);
    t.check("centroid counts the pixels", centroid.count === 2, centroid.count);
    const empty = CentroidAnalyser.compute(stubImage(4, 4, () => 0));
    t.check("centroid of an empty image is null", empty === null, "not null");

    // Sobel responds to the edge that matches its asymmetry.
    const verticalEdge = stubImage(9, 9, (x) => (x < 4 ? 0 : 255));
    const gx = ConvolutionFilter.convolve(
        verticalEdge, ConvolutionFilter.SOBEL_X
    );
    const gy = ConvolutionFilter.convolve(
        verticalEdge, ConvolutionFilter.SOBEL_Y
    );
    t.checkClose("vertical edge gives the full x response",
        Math.abs(gx[4 + 4 * 9]), 1020, 0.001);
    t.checkClose("vertical edge gives no y response",
        Math.abs(gy[4 + 4 * 9]), 0, 0.001);
    t.checkClose("flat area gives no response",
        Math.abs(gx[1 + 1 * 9]), 0, 0.001);

    // The refiner keeps backdrop joined to the border and returns the rest.
    const refiner = new MaskRefiner(4, 0, 0);
    const size = 9;
    const mask = new Uint8Array(size * size);
    for (let i = 0; i < mask.length; i++) mask[i] = 1;
    // A solid subject in the middle, with one backdrop coloured pixel inside.
    for (let y = 2; y <= 6; y++) {
        for (let x = 2; x <= 6; x++) mask[x + y * size] = 0;
    }
    mask[4 + 4 * size] = 1;
    const connected = refiner.keepBorderConnected(mask, size, size);
    t.check("border backdrop is kept",
        connected[0] === 1, connected[0]);
    t.check("backdrop enclosed by the subject is returned to the subject",
        connected[4 + 4 * size] === 0, connected[4 + 4 * size]);

    // Small foreground blobs are dropped.
    const speckled = new Uint8Array(size * size);
    for (let i = 0; i < speckled.length; i++) speckled[i] = 1;
    speckled[0] = 0;
    const cleaned = refiner.removeSmallIslands(speckled, size, size);
    t.check("a single stray pixel is removed", cleaned[0] === 1, cleaned[0]);

    // Alpha conversion.
    const alpha = refiner.toAlpha(Uint8Array.from([1, 0, 1, 0]));
    t.check("background becomes transparent", alpha[0] === 0, alpha[0]);
    t.check("subject becomes opaque", alpha[1] === 255, alpha[1]);

    // Median used to aggregate the block matches.
    const flow = new BlockFlowEstimator(0.25, 8, 28, 25);
    t.checkClose("median of an odd list", flow.median([3, 1, 2]), 2, 0.001);
    t.checkClose(
        "median of an even list", flow.median([4, 1, 2, 3]), 2.5, 0.001
    );
    t.checkClose("median of an empty list", flow.median([]), 0, 0.001);

    // The threshold table follows the shape the brief asks for.
    t.check("the table holds eight rows",
        ThresholdSettings.TABLE.length === 8, ThresholdSettings.TABLE.length);
    t.check("every row holds four values",
        ThresholdSettings.TABLE.every((row) => row.length === 4), "not four");
    t.check("every colour space is 0 or 1",
        ThresholdSettings.TABLE.every((row) => row[0] === 0 || row[0] === 1),
        "not 0 or 1");
    t.check("both colour spaces are used",
        ThresholdSettings.TABLE.some((row) => row[0] === 0) &&
        ThresholdSettings.TABLE.some((row) => row[0] === 1), "only one used");
    t.check("an alternative row exists for every image",
        ThresholdSettings.ALTERNATIVES.length === 8,
        ThresholdSettings.ALTERNATIVES.length);
    t.check("the alternative always uses the other colour space",
        ThresholdSettings.TABLE.every(
            (row, i) => row[0] !== ThresholdSettings.ALTERNATIVES[i][0]
        ), "same space on both sides");

    t.summarise();
}

window.addEventListener("load", runTests);
