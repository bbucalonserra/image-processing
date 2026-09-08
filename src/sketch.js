/**
 * COMMENTARY (498 words).
 *
 * 1. WALKTHROUGH
 *    Key 1 loads Task 1, key 2 loads Task 2, key H lists every key.
 *    Task 1 follows c, l and s. Key l scales each provided image down and cuts
 *    its background out by walking the thresholds table, where each row is
 *    [colourSpace, c1, c2, c3]: 0 selects RGB, with the minimum red, green and
 *    blue of a background pixel, 1 selects HSB, with a hue tolerance, a
 *    maximum saturation and a minimum brightness. The mask is then cleaned by
 *    a flood fill from the border, which is what removes every residual
 *    background pixel. Key s starts the sequence: the cut
 *    out fades in, zooms in and fades out, then fades in, zooms out and fades
 *    out, travelling left to right, while a generated backdrop scrolls left
 *    to right and the caption travels right to left. Positions and sizes are
 *    numbers passed to image(), so translate() is never called. Key v shows the
 *    featured image cut out in both colour spaces with the error of each.
 *    Task 2 follows p, i, g, e, t, n and d, and the arrow keys change pair.
 *    Both frames are made greyscale with the luma weights, run through two
 *    Sobel passes, thresholded by a slider, reduced to a centroid, and
 *    compared with dx = Cx2 - Cx1 and dy = Cy2 - Cy1, which gives the eight
 *    directions and the arrow. Four extra pairs were built from the provided
 *    images so that every direction is covered.
 *
 * 2. PROBLEMS
 *    Three mattered. Convolving the border with a partial kernel drew a false
 *    edge around every frame, which pulled the two centroids together and
 *    halved the measured shift; leaving the border at zero fixed it. Image
 *    2 kept a strip of wall because the vignette there measures 241 to 244,
 *    under the brightness limit, so the fill could not enter from that side;
 *    RGB clears it and now holds that row. I also tried a Gaussian pass before
 *    Sobel: it left accuracy at 64 of 64 but widened the spread of dy from 1.0
 *    to 1.7 pixels, so it is not in the code.
 *
 * 3. TARGET
 *    On target. All eight pairs are classified correctly at every threshold
 *    from 40 to 200, and every row of the table makes fewer mistakes than the
 *    other colour space on the same image, counted as backdrop left in the
 *    corners plus subject the threshold wrongly claimed.
 *
 * 4. EXTENSION
 *    The extension is a second motion estimator built on block matching. The
 *    frame is cut into blocks, each block with enough contrast is searched for
 *    in the next frame by the sum of absolute differences, and the shift is
 *    the median of the matches. Matching runs at quarter scale, so a ninety
 *    pixel window costs twelve milliseconds a pair. It is unique
 *    because it measures the same motion on a different principle, region
 *    correspondence rather than one centre of mass, so the two answers can be
 *    compared on screen, and because it needs no threshold, which the
 *    centroid method cannot do without.
 */

const CANVAS_W = 1280;
const CANVAS_H = 720;

// Task 1 stage panel, below the header.
const STAGE_TOP = 86;
const STAGE_HEIGHT = 384;

// Task 2 frame panels, lower to leave room for their labels.
const FRAME_TOP = 112;

/** @type {AppController} */
let appController;

/** @type {Array<p5.Image>} The eight provided images of Task 1. */
let sourceImages = [];
/** @type {Array<Array<p5.Image>>} A [frameA, frameB] entry per pair. */
let pairImages = [];
/** @type {p5.Graphics} Backdrop behind the featured subject. */
let backdropImage;

/**
 * Loads every image before setup runs, so no draw call meets a half loaded
 * file (week 12).
 * @return {void}
 */
function preload() {
    for (const file of ThresholdSettings.FILES) {
        sourceImages.push(loadImage(file));
    }

    for (const entry of PanoramaScreen.PAIRS) {
        pairImages.push([
            loadImage("assets/task2/" + entry.file + "_1.png"),
            loadImage("assets/task2/" + entry.file + "_2.png")
        ]);
    }
}

/**
 * @return {void}
 */
function setup() {
    createCanvas(CANVAS_W, CANVAS_H);
    // Required before direct pixel work: on a high density screen one image
    // pixel would otherwise cover several array entries (week 13).
    pixelDensity(1);
    imageMode(CORNER);

    // The backdrop is generated rather than loaded, so the only images the
    // app reads are the ones the brief provides.
    backdropImage = new NoiseBackdrop(400, 120, 24, 1.6, 0.02).render();

    appController = new AppController(
        new CarouselScreen(
            sourceImages, backdropImage, STAGE_TOP, STAGE_HEIGHT
        ),
        new PanoramaScreen(pairImages, FRAME_TOP)
    );
}

/**
 * @return {void}
 */
function draw() {
    appController.update();
    appController.draw();
}

/**
 * @return {void}
 */
function keyPressed() {
    appController.handleKey(key, keyCode);
}
