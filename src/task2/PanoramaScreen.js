/**
 * Class running Task 2. It steps through the pipeline the brief lists, keyed
 * by p for the panorama screen, i to load a pair, g for greyscale, e for the
 * edge filter, t for the threshold, n for the centroid and d for the arrow
 * overlay, and it draws both frames beside the direction panel.
 */
class PanoramaScreen extends Screen {
    /**
     * The eight pairs on offer. The first four are the provided ones, the last
     * four were built from the provided images to cover the directions the
     * provided set leaves out.
     * @return {Array<object>} File paths and expected direction of each pair.
     */
    static get PAIRS() {
        return [
            { label: "Pair 1 (provided)", file: "pair1", expected: "RIGHT" },
            { label: "Pair 2 (provided)", file: "pair2", expected: "LEFT" },
            { label: "Pair 3 (provided)", file: "pair3", expected: "DOWN-RIGHT" },
            { label: "Pair 4 (provided)", file: "pair4", expected: "UP-LEFT" },
            { label: "Pair 5 (built)", file: "pair5", expected: "UP" },
            { label: "Pair 6 (built)", file: "pair6", expected: "DOWN" },
            { label: "Pair 7 (built)", file: "pair7", expected: "UP-RIGHT" },
            { label: "Pair 8 (built)", file: "pair8", expected: "DOWN-LEFT" }
        ];
    }

    /**
     * @param {Array<Array<p5.Image>>} pairImages - One [frameA, frameB] entry
     *     per pair, in the same order as PAIRS.
     * @param {number} panelTop - Height at which the frame panels begin.
     */
    constructor(pairImages, panelTop) {
        super("TASK 2 - PANORAMA MOTION GUIDE", [
            "idle", "panorama", "pairs", "grey", "edges", "threshold",
            "centroid", "arrow"
        ]);

        this.pairImages = pairImages;
        this.panelTop = panelTop;

        this.panelWidth = 340;
        this.panelHeight = 238;
        this.columnX = [40, 400];
        this.rowGap = 282;

        /** @type {Array<FramePair>} One entry per pair, filled on the i key. */
        this.pairs = [];
        /** @type {number} Index of the pair being examined. */
        this.pairIndex = 0;

        /** @type {MotionEstimator} Turns two centroids into a direction. */
        this.estimator = new MotionEstimator(4);
        /** @type {ArrowOverlay} The large direction arrow. */
        this.arrow = new ArrowOverlay(300, 34, 100, 82);

        /** @type {p5.Element} Interactive control over the edge threshold. */
        this.thresholdSlider = createSlider(0, 255, 100);
        this.thresholdSlider.position(40, this.panelTop + this.rowGap + 268);
        this.thresholdSlider.style("width", "300px");
        this.thresholdSlider.hide();
    }

    /**
     * Shows the slider again when the screen is reopened past the threshold.
     * @return {void}
     */
    enter() {
        this.updateSliderVisibility();
    }

    /**
     * Hides the slider while Task 1 is on screen, since it is a DOM element
     * and would otherwise float above the other task.
     * @return {void}
     */
    exit() {
        this.thresholdSlider.hide();
    }

    /**
     * Shows the slider only once the threshold stage has been reached.
     * @return {void}
     */
    updateSliderVisibility() {
        if (this.stageIndex >= this.stages.indexOf("threshold")) {
            this.thresholdSlider.show();
        } else {
            this.thresholdSlider.hide();
        }
    }

    /**
     * Handles the pipeline keys and the arrow keys that change pair.
     * @param {string} pressedKey - The key character, already lower cased.
     * @param {number} pressedCode - The p5 key code.
     * @return {void}
     */
    handleKey(pressedKey, pressedCode) {
        const stageByKey = {
            "p": "panorama",
            "i": "pairs",
            "g": "grey",
            "e": "edges",
            "t": "threshold",
            "n": "centroid",
            "d": "arrow"
        };

        if (pressedKey === "i" && this.pairs.length === 0) {
            if (this.requestStage("pairs")) this.loadPairs();
            this.updateSliderVisibility();
            return;
        }

        if (stageByKey[pressedKey]) {
            this.requestStage(stageByKey[pressedKey]);
            this.updateSliderVisibility();
            return;
        }

        if (this.pairs.length === 0) return;
        if (pressedCode === RIGHT_ARROW) {
            this.pairIndex = (this.pairIndex + 1) % this.pairs.length;
        } else if (pressedCode === LEFT_ARROW) {
            this.pairIndex =
                (this.pairIndex + this.pairs.length - 1) % this.pairs.length;
        }
    }

    /**
     * Wraps every preloaded pair in a FramePair, ready for processing.
     * @return {void}
     */
    loadPairs() {
        this.pairs = PanoramaScreen.PAIRS.map((entry, index) => new FramePair(
            entry.label,
            this.pairImages[index][0],
            this.pairImages[index][1],
            entry.expected
        ));
        this.pairIndex = 0;
    }

    /**
     * @return {FramePair|null} The pair currently on screen.
     */
    currentPair() {
        if (this.pairs.length === 0) return null;
        return this.pairs[this.pairIndex];
    }

    /**
     * Brings the current pair up to the stage that has been reached, which
     * also picks up a new slider value or a change of pair.
     * @return {void}
     */
    update() {
        const pair = this.currentPair();
        if (!pair) return;

        const threshold = this.thresholdSlider.value();
        const reached = this.stageIndex;

        if (reached >= this.stages.indexOf("grey")) pair.buildGrey();
        if (reached >= this.stages.indexOf("edges")) pair.buildEdges();
        if (reached >= this.stages.indexOf("threshold")) {
            pair.buildBinary(threshold);
        }
        if (reached >= this.stages.indexOf("centroid")) {
            pair.buildCentroids(threshold);
        }
        if (reached >= this.stages.indexOf("arrow")) {
            pair.buildMotion(threshold, this.estimator);
        }
    }

    /**
     * Draws the frame panels, the processed panels and the direction panel.
     * @return {void}
     */
    draw() {
        if (this.currentStage() === "idle") {
            this.drawNotice("Press P to open the panorama screen");
            return;
        }

        const pair = this.currentPair();
        if (!pair) {
            this.drawPanelFrame(this.columnX[0], this.panelTop, "FRAME A");
            this.drawPanelFrame(this.columnX[1], this.panelTop, "FRAME B");
            this.drawNotice("Press I to load a pair of images");
            this.drawDirectionPanel(null);
            return;
        }

        for (let slot = 0; slot < 2; slot++) {
            this.drawFramePanel(pair, slot);
            this.drawProcessedPanel(pair, slot);
        }
        this.drawDirectionPanel(pair);
        this.drawReadout(pair);
    }

    /**
     * Draws one original frame in the top row.
     * @param {FramePair} pair - The pair on screen.
     * @param {number} slot - 0 for Frame A, 1 for Frame B.
     * @return {void}
     */
    drawFramePanel(pair, slot) {
        const x = this.columnX[slot];
        this.drawPanelFrame(x, this.panelTop, slot === 0 ? "FRAME A" : "FRAME B");
        image(pair.frame(slot), x, this.panelTop, this.panelWidth, this.panelHeight);
    }

    /**
     * Draws the most advanced processed image available for one frame, plus
     * the centroid marker once it has been computed.
     * @param {FramePair} pair - The pair on screen.
     * @param {number} slot - 0 for Frame A, 1 for Frame B.
     * @return {void}
     */
    drawProcessedPanel(pair, slot) {
        const x = this.columnX[slot];
        const y = this.panelTop + this.rowGap;

        const shown = this.processedImage(pair, slot);
        this.drawPanelFrame(x, y, this.processedLabel());

        if (!shown) {
            push();
            noStroke();
            fill(150);
            textAlign(CENTER, CENTER);
            textSize(14);
            text(
                "Press G, E, T, N then D",
                x + this.panelWidth / 2,
                y + this.panelHeight / 2
            );
            pop();
            return;
        }

        image(shown, x, y, this.panelWidth, this.panelHeight);

        const centroid = pair.centroids[slot];
        if (centroid) this.drawCentroidMarker(x, y, shown, centroid);
    }

    /**
     * Picks the image to show in the processed row for the current stage.
     * @param {FramePair} pair - The pair on screen.
     * @param {number} slot - 0 for Frame A, 1 for Frame B.
     * @return {p5.Image|null} The image to draw, or null when none exists yet.
     */
    processedImage(pair, slot) {
        if (this.stageIndex >= this.stages.indexOf("threshold")) {
            return pair.binary[slot];
        }
        if (this.stageIndex >= this.stages.indexOf("edges")) {
            return pair.edges[slot];
        }
        if (this.stageIndex >= this.stages.indexOf("grey")) {
            return pair.grey[slot];
        }
        return null;
    }

    /**
     * @return {string} Label describing what the processed row is showing.
     */
    processedLabel() {
        if (this.stageIndex >= this.stages.indexOf("threshold")) {
            return "THRESHOLDED EDGES";
        }
        if (this.stageIndex >= this.stages.indexOf("edges")) return "EDGE OUTPUT";
        if (this.stageIndex >= this.stages.indexOf("grey")) return "GREYSCALE";
        return "PROCESSED";
    }

    /**
     * Draws the centroid over the processed frame, converting from image
     * coordinates to the coordinates the panel is drawn at.
     * @param {number} x - Left edge of the panel.
     * @param {number} y - Top edge of the panel.
     * @param {p5.Image} shown - The image drawn in the panel.
     * @param {object} centroid - {x, y, count} of the frame.
     * @return {void}
     */
    drawCentroidMarker(x, y, shown, centroid) {
        const markerX = x + (centroid.x / shown.width) * this.panelWidth;
        const markerY = y + (centroid.y / shown.height) * this.panelHeight;

        push();
        stroke(255, 90, 90);
        strokeWeight(2);
        line(markerX - 14, markerY, markerX + 14, markerY);
        line(markerX, markerY - 14, markerX, markerY + 14);
        noFill();
        circle(markerX, markerY, 22);
        pop();
    }

    /**
     * Draws the direction panel holding the large arrow overlay.
     * @param {FramePair|null} pair - The pair on screen, if one is loaded.
     * @return {void}
     */
    drawDirectionPanel(pair) {
        const x = 790;
        const y = this.panelTop;
        const w = width - x - 40;
        const h = this.panelHeight + this.rowGap - 44;

        push();
        noStroke();
        fill(24, 28, 36);
        rect(x, y, w, h, 10);
        fill(150);
        textSize(13);
        textAlign(LEFT, TOP);
        text("MOTION GUIDE", x + 14, y + 12);
        pop();

        const centreX = x + w / 2;
        const centreY = y + h / 2;
        const reachedArrow = this.stageIndex >= this.stages.indexOf("arrow");

        if (!pair || !pair.motion || !reachedArrow) {
            push();
            noStroke();
            fill(120);
            textAlign(CENTER, CENTER);
            textSize(18);
            text("Press D for the direction arrow", centreX, centreY);
            pop();
            return;
        }

        if (pair.motion.label === "NONE") {
            this.arrow.drawStill(centreX, centreY, color(200, 200, 90));
        } else {
            this.arrow.draw(
                centreX, centreY, pair.motion.angle, color(90, 200, 255)
            );
        }

        push();
        noStroke();
        fill(240);
        textAlign(CENTER, CENTER);
        textSize(34);
        textStyle(BOLD);
        // Parked at the foot of the panel so a vertical arrow cannot sit on it.
        text(pair.motion.label, centreX, y + h - 40);
        pop();
    }

    /**
     * Draws the pair name, the two centroids, the shift and the check against
     * the direction the pair was built to show.
     * @param {FramePair} pair - The pair on screen.
     * @return {void}
     */
    drawReadout(pair) {
        const y = this.panelTop + this.rowGap + this.panelHeight + 14;

        push();
        noStroke();
        fill(200);
        textAlign(LEFT, TOP);
        textSize(14);
        text(
            pair.label + "   [<] [>] change pair   edge threshold " +
            this.thresholdSlider.value(),
            40, y
        );

        let readout = "Centroids not computed yet, press N";
        if (pair.centroids[0] && pair.centroids[1]) {
            readout =
                "A (" + pair.centroids[0].x.toFixed(1) + ", " +
                pair.centroids[0].y.toFixed(1) + ")   B (" +
                pair.centroids[1].x.toFixed(1) + ", " +
                pair.centroids[1].y.toFixed(1) + ")";
        }
        if (pair.motion) {
            readout += "   dx " + pair.motion.dx.toFixed(1) +
                "   dy " + pair.motion.dy.toFixed(1) +
                "   shift " + pair.motion.distance.toFixed(1) + " px";
        }
        fill(170);
        text(readout, 40, y + 46);

        if (pair.motion) {
            const correct = pair.motion.label === pair.expected;
            fill(correct ? color(120, 220, 140) : color(240, 130, 130));
            text(
                "expected " + pair.expected + "   detected " +
                pair.motion.label + (correct ? "   match" : "   mismatch"),
                430, y
            );
        }
        pop();
    }

    /**
     * Draws an empty panel with its label.
     * @param {number} x - Left edge of the panel.
     * @param {number} y - Top edge of the panel.
     * @param {string} label - Caption drawn above the panel.
     * @return {void}
     */
    drawPanelFrame(x, y, label) {
        push();
        noStroke();
        fill(24, 28, 36);
        rect(x, y, this.panelWidth, this.panelHeight);
        fill(150);
        textSize(12);
        textAlign(LEFT, BOTTOM);
        text(label, x, y - 6);
        pop();
    }

    /**
     * Draws a prompt across the frame area.
     * @param {string} message - The prompt to show.
     * @return {void}
     */
    drawNotice(message) {
        push();
        noStroke();
        fill(210);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(message, width / 2, this.panelTop + this.panelHeight / 2 + 140);
        pop();
    }

    /**
     * @return {string} One line of guidance for the header.
     */
    hint() {
        if (this.currentStage() === "idle") return "[P] panorama screen";
        if (this.pairs.length === 0) return "[P] panorama  [I] load pairs";
        return "[I] pairs  [G] grey  [E] edges  [T] threshold  " +
            "[N] centroid  [D] arrow";
    }
}
