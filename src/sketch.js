/**
 * COMMENTARY (497 words).
 *
 * 1. WALKTHROUGH
 *    The app opens on a prompt: key 1 loads Task 1, key 2 loads Task 2.
 *    Task 1 then follows c, l and s. Key c opens the carousel, key l scales
 *    every provided image down and cuts its background out, and key s starts
 *    the animation. Removal walks the thresholds table, where each row is
 *    [colourSpace, c1, c2, c3]: 0 selects RGB and c1 to c3 are the per channel
 *    minimums of a background pixel, 1 selects HSB and c1 to c3 are the hue
 *    tolerance, the maximum saturation and the minimum brightness. The
 *    featured cut out then fades in, zooms in and fades out, then fades in,
 *    zooms out and fades out, travelling left to right, while the backdrop
 *    scrolls left to right and the caption travels right to left. Every
 *    position and size is a number handed to image(), so translate() is never
 *    called. The eight cut outs also scroll below as a row of cards.
 *    Task 2 follows p, i, g, e, t, n and d, and the arrow keys change pair.
 *    Both frames are converted to greyscale with the luma weights, run through
 *    two Sobel passes, thresholded by a slider, reduced to a centroid, and
 *    compared with dx = Cx2 - Cx1 and dy = Cy2 - Cy1. Each axis is judged
 *    against a small dead zone, which yields the eight directions and the
 *    large arrow. Four extra pairs were built from the provided images so that
 *    every direction is demonstrated, each scored on screen.
 *
 * 2. PROBLEMS
 *    Two problems mattered. A threshold cannot tell a white shirt from a white
 *    wall, so images 2 and 7 lost the garment under RGB; moving those rows to
 *    HSB and judging saturation instead of lightness recovered it. Images 1
 *    and 3 then failed the opposite way, because their walls are dim and
 *    uneven, so any threshold loose enough to clear the wall also ate skin.
 *    Per image rows fixed that, which is why the brief asks for a table.
 *
 * 3. TARGET
 *    The project met its target; every listed requirement is implemented.
 *    With more time I would scale the Task 2 dead zone to the image size
 *    rather than fixing it at four pixels, and move the cut outs off the main
 *    loop so that key l does not block the sketch.
 *
 * 4. EXTENSION
 *    The extension is connected component background refinement, in
 *    MaskRefiner. After thresholding, a flood fill from the border keeps only
 *    the backdrop pixels actually joined to the border, so backdrop coloured
 *    pixels trapped inside the subject are handed back; foreground blobs below
 *    a size limit are deleted, the background grows by one pixel to bite off
 *    the compression halo, and the mask is blurred to feather the edge. It is
 *    unique because it replaces the question "is this pixel the colour of the
 *    backdrop?" with "is this pixel joined to the backdrop?", a question about
 *    shape that no threshold can answer, and it is what makes the eight cut
 *    outs come out without residual background.
 */

const CANVAS_W = 1280;
const CANVAS_H = 720;

// Task 1 stage panel, measured from below the header.
const STAGE_TOP = 86;
const STAGE_HEIGHT = 384;

// Task 2 frame panels, which need more room for their labels.
const FRAME_TOP = 112;

/** @type {AppController} */
let appController;

/** @type {Array<p5.Image>} The eight provided images of Task 1. */
let sourceImages = [];
/** @type {Array<Array<p5.Image>>} One [frameA, frameB] entry per Task 2 pair. */
let pairImages = [];
/** @type {p5.Image} Backdrop scrolling behind the featured subject. */
let backdropImage;

/**
 * Loads every image before setup runs, so no draw call ever meets a half
 * loaded file (week 12).
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

    backdropImage = loadImage("assets/backgrounds/carousel-background.png");
}

/**
 * @return {void}
 */
function setup() {
    createCanvas(CANVAS_W, CANVAS_H);
    // Required before any direct pixel work, so that one pixel of the image is
    // one pixel of the array on high density screens (week 13).
    pixelDensity(1);
    imageMode(CORNER);

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
