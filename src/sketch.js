/**
 * COMMENTARY (486 words).
 *
 * 1. WALKTHROUGH
 *    Keys "1" and "2" load the tasks and "H" presents the key list; the header
 *    shows the keys available. In Task 1, "c" opens the empty carousel and "l"
 *    cuts the background of each image out by walking the thresholds table,
 *    where each row is [colourSpace, c1, c2, c3]: 0 selects RGB, with the
 *    minimum red, green and blue of a background pixel, and 1 selects HSB, with
 *    a hue tolerance, a maximum saturation and a minimum brightness. Key "s"
 *    starts the animation: fade in, zoom in, fade out, then fade in, zoom out
 *    and fade out, while the image goes from left to right. The background also
 *    moves left to right and the caption moves right to left. Size and position
 *    are passed to image() and textSize(), so translate() is never called. Key
 *    "v" presents the same image cut out in both colour spaces, side by side,
 *    with the error count of each. Task 2 follows "p", "i", "g", "e", "t", "n"
 *    and "d", and arrows change pair: luma to grey, two Sobel passes summed for
 *    edges, a threshold slider, the centroid as the sum of x and y divided by
 *    the count, then dx = Cx2 - Cx1 and dy = Cy2 - Cy1 give the direction and
 *    the arrow. Four extra pairs were built to cover the missing directions.
 *    The keys only work in order.
 *
 * 2. PROBLEMS
 *    The convolution processed the border pixels with a cut kernel. A Sobel
 *    kernel only works because its weights sum to zero, and in the cut kernel
 *    they no longer did. This resulted in a bright rectangle around each frame,
 *    pulling both centroids to the centre and reducing the reported
 *    displacement from 80 to 38.7. Leaving the border at zero corrected it.
 *
 * 3. TARGET
 *    All eight pairs are classified correctly across the whole slider, from 40
 *    to 255. Each row of the table matches or beats the alternative in the
 *    other colour space. Each threshold was selected by measuring image by
 *    image, which does not generalise to a new picture. A threshold derived
 *    from the histogram would remove the fixed table, but the table is a
 *    requirement of the coursework.
 *
 * 4. EXTENSION
 *    The extension is a second motion estimator by block matching, applied with
 *    the "f" key. The mask refinement of Task 1 meets the requirement of no
 *    residual pixels and is not an extension. The frame is cut into blocks, and
 *    each block with enough contrast is searched for in the next frame by the
 *    sum of absolute differences. The displacement is the median of the
 *    vectors. It runs at 1/4 scale, so a window of 90 pixels costs a few
 *    milliseconds. It is unique in principle: matching among regions rather
 *    than a centre of mass. Both are shown on screen, validating each other,
 *    and it needs no threshold: with the slider at zero the centroid reports
 *    NONE on all eight pairs, while block matching stays at 8 of 8, as it never
 *    uses the threshold.
 */

const CANVAS_W = 1280;
const CANVAS_H = 720;

// Task 1 stage panel, below the header.
const STAGE_TOP = 86;
const STAGE_HEIGHT = 384;

// Task 2 frame panels, below their labels.
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
 * Loads every image before setup runs (week 12).
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
    // One image pixel per array entry, whatever the screen density (week 13).
    pixelDensity(1);
    imageMode(CORNER);

    // The backdrop is generated, not loaded.
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
