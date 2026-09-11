/**
 * Task 2. Steps through the pipeline the brief lists, keyed by p for the
 * panorama screen, i to load a pair, g for greyscale, e for the edge filter,
 * t for the threshold, n for the centroid and d for the arrow, and draws both
 * frames beside the direction panel.
 */
class PanoramaScreen extends Screen {
    /**
     * The eight pairs. The first four are provided, the last four were built
     * from the provided images to cover the missing directions.
     * @return {Array<object>} File stem and expected direction of each pair.
     */
    static get PAIRS() {
        return [
            { label: "Pair 1 (provided)", file: "pair1", expected: "RIGHT" },
            { label: "Pair 2 (provided)", file: "pair2", expected: "LEFT" },
            {
                label: "Pair 3 (provided)",
                file: "pair3",
                expected: "DOWN-RIGHT"
            },
            { label: "Pair 4 (provided)", file: "pair4", expected: "UP-LEFT" },
            { label: "Pair 5 (built)", file: "pair5", expected: "UP" },
            { label: "Pair 6 (built)", file: "pair6", expected: "DOWN" },
            { label: "Pair 7 (built)", file: "pair7", expected: "UP-RIGHT" },
            { label: "Pair 8 (built)", file: "pair8", expected: "DOWN-LEFT" }
        ];
    }

    /**
     * The steps the user drives, in the order they have to be pressed. Each
     * entry is [key, short name, stage it reaches], and the stage names match
     * the list passed to the base class, so the strip on screen and the rule
     * that blocks a skipped key cannot drift apart.
     * @return {Array<Array<string>>} One entry per step.
     */
    static get PIPELINE() {
        return [
            ["I", "pairs", "pairs"],
            ["G", "grey", "grey"],
            ["E", "edges", "edges"],
            ["T", "thresh", "threshold"],
            ["N", "centroid", "centroid"],
            ["D", "arrow", "arrow"],
            ["F", "flow", "flow"]
        ];
    }

    /**
     * @param {Array<Array<p5.Image>>} pairImages - One [frameA, frameB] entry
     *     per pair, in the order of PAIRS.
     * @param {number} panelTop - Top of the frame panels.
     */
    constructor(pairImages, panelTop) {
        super("TASK 2 - PANORAMA MOTION GUIDE", [
            "idle", "panorama", "pairs", "grey", "edges", "threshold",
            "centroid", "arrow", "flow"
        ]);

        this.pairImages = pairImages;
        this.panelTop = panelTop;

        this.panelWidth = 340;
        this.panelHeight = 238;
        this.columnX = [40, 400];
        this.rowGap = 282;

        /** @type {number} Top of the readout, below the processed row. */
        this.readoutTop = panelTop + this.rowGap + this.panelHeight + 14;
        /** @type {number} Column the accuracy check is written in. */
        this.checkX = 430;
        /** @type {number} Left edge of the direction panel. */
        this.directionX = 790;
        /** @type {number} Margin kept at the right of the canvas. */
        this.rightMargin = 40;

        /** @type {Array<FramePair>} One entry per pair, filled on the i key. */
        this.pairs = [];
        /** @type {number} Index of the pair being examined. */
        this.pairIndex = 0;

        /** @type {MotionEstimator|null} Classifies a measured shift. */
        this.estimator = null;
        /** @type {BlockFlowEstimator} Second estimator, the extension. */
        this.flowEstimator = new BlockFlowEstimator(0.25, 8, 28, 25);
        /** @type {ArrowOverlay} The large direction arrow. */
        this.arrow = new ArrowOverlay(300, 34, 100, 82);

        /** @type {p5.Element} Interactive control over the edge threshold. */
        this.thresholdSlider = createSlider(0, 255, 100);
        // Sits in the gap between the two readout lines, clear of both.
        this.thresholdSlider.position(this.columnX[0], this.readoutTop + 22);
        this.thresholdSlider.style("width", "300px");
        this.thresholdSlider.hide();
    }

    /**
     * Shows the slider again when the screen is reopened.
     * @return {void}
     */
    enter() {
        this.updateSliderVisibility();
    }

    /**
     * Hides the slider while Task 1 is on screen, since it is a DOM element
     * and would float above the canvas.
     * @return {void}
     */
    exit() {
        this.thresholdSlider.hide();
    }

    /**
     * Slider is visible only from the threshold stage onwards.
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
     * @param {string} pressedKey - Key character, lower cased.
     * @param {number} pressedCode - p5 key code.
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
            "d": "arrow",
            "f": "flow"
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
     * Wraps every preloaded pair in a FramePair.
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

        // A dead zone of one hundredth of the frame keeps the rule the same
        // whatever size the pairs are.
        this.estimator = new MotionEstimator(
            0.01, this.pairs[0].frameA.width, this.pairs[0].frameA.height
        );
    }

    /**
     * @return {FramePair|null} Pair on screen.
     */
    currentPair() {
        if (this.pairs.length === 0) return null;
        return this.pairs[this.pairIndex];
    }

    /**
     * Brings the current pair up to the stage reached, which also picks up a
     * new slider value or a change of pair.
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
        if (reached >= this.stages.indexOf("flow")) {
            pair.buildFlow(this.flowEstimator, this.estimator);
        }
    }

    /**
     * Draws the frame panels, the processed panels and the direction panel.
     * @return {void}
     */
    draw() {
        if (this.currentStage() === "idle") {
            this.drawNotice("Press P to open the panorama screen", height / 2);
            return;
        }

        this.drawPipeline();
        const pair = this.currentPair();
        if (!pair) {
            this.drawPanelFrame(this.columnX[0], this.panelTop, "FRAME A");
            this.drawPanelFrame(this.columnX[1], this.panelTop, "FRAME B");
            this.drawNotice(
                "Press I to load a pair of images",
                this.panelTop + this.panelHeight / 2
            );
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
     * Draws the ordered list of steps above the panels, outside every box, so
     * the keys still to press stay on screen after a step has been taken. A
     * step already reached is green, the one that may be pressed now is boxed,
     * and the rest are dim. The step that may be pressed now is worked out
     * from the same stage index that blocks a skipped key, so a dim step is
     * one the app will refuse.
     * @return {void}
     */
    drawPipeline() {
        push();
        noStroke();
        textSize(12);
        textAlign(LEFT, TOP);

        const y = 80;
        let x = this.columnX[0];

        fill(130);
        const intro = "ORDER, each step unlocks the next";
        text(intro, x, y);
        x += textWidth(intro) + 18;

        for (const step of PanoramaScreen.PIPELINE) {
            const label = "[" + step[0] + "] " + step[1];
            const labelWidth = textWidth(label);
            const stage = this.stages.indexOf(step[2]);

            if (stage <= this.stageIndex) {
                fill(120, 220, 140);
                text(label, x, y);
            } else if (stage === this.stageIndex + 1) {
                fill(48, 104, 176);
                rect(x - 5, y - 3, labelWidth + 10, 19, 4);
                fill(255);
                text(label, x, y);
            } else {
                fill(105);
                text(label, x, y);
            }
            x += labelWidth + 16;
        }
        pop();
    }

    /**
     * Draws one original frame in the top row.
     * @param {FramePair} pair - Pair on screen.
     * @param {number} slot - 0 for Frame A, 1 for Frame B.
     * @return {void}
     */
    drawFramePanel(pair, slot) {
        const x = this.columnX[slot];
        const label = slot === 0 ? "FRAME A" : "FRAME B";
        this.drawPanelFrame(x, this.panelTop, label);
        image(
            pair.frame(slot),
            x, this.panelTop, this.panelWidth, this.panelHeight
        );
        if (slot === 1 && pair.flow) this.drawFlowVectors(pair, x);
    }

    /**
     * Draws the block matching vectors over Frame B, one line per matched
     * block, so the measurement behind the second estimate is visible.
     * @param {FramePair} pair - Pair on screen.
     * @param {number} x - Left edge of the panel.
     * @return {void}
     */
    drawFlowVectors(pair, x) {
        const scaleX = this.panelWidth / pair.frameA.width;
        const scaleY = this.panelHeight / pair.frameA.height;

        push();
        stroke(255, 210, 60);
        strokeWeight(1.5);
        for (const vector of pair.flow.vectors) {
            const startX = x + vector.x * scaleX;
            const startY = this.panelTop + vector.y * scaleY;
            line(
                startX,
                startY,
                startX + vector.dx * scaleX,
                startY + vector.dy * scaleY
            );
        }
        noStroke();
        fill(255, 210, 60);
        textSize(11);
        textAlign(LEFT, TOP);
        text(
            pair.flow.matched + "/" + pair.flow.total + " blocks matched in " +
            Math.round(pair.flow.millis) + " ms",
            x + 4,
            this.panelTop + 4
        );
        pop();
    }

    /**
     * Draws the latest processed image for one frame, plus the centroid
     * marker once it exists.
     * @param {FramePair} pair - Pair on screen.
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
            fill(130);
            textAlign(CENTER, CENTER);
            textSize(14);
            text(
                "nothing computed yet",
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
     * Picks the image the processed row shows at the current stage.
     * @param {FramePair} pair - Pair on screen.
     * @param {number} slot - 0 for Frame A, 1 for Frame B.
     * @return {p5.Image|null} Image to draw, or null when none exists.
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
     * @return {string} Label for the processed row.
     */
    processedLabel() {
        if (this.stageIndex >= this.stages.indexOf("threshold")) {
            return "THRESHOLDED EDGES";
        }
        if (this.stageIndex >= this.stages.indexOf("edges")) {
            return "EDGE OUTPUT";
        }
        if (this.stageIndex >= this.stages.indexOf("grey")) return "GREYSCALE";
        return "PROCESSED";
    }

    /**
     * Draws the centroid over the processed frame, converting from image
     * coordinates to panel coordinates.
     * @param {number} x - Left edge of the panel.
     * @param {number} y - Top edge of the panel.
     * @param {p5.Image} shown - Image drawn in the panel.
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
     * Draws the direction panel with the arrow overlay.
     * @param {FramePair|null} pair - Pair on screen, if one is loaded.
     * @return {void}
     */
    drawDirectionPanel(pair) {
        const x = this.directionX;
        const y = this.panelTop;
        const w = width - x - this.rightMargin;
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
        // At the foot of the panel, clear of a vertical arrow.
        text(pair.motion.label, centreX, y + h - 62);

        textStyle(NORMAL);
        textSize(14);
        fill(160);
        let agreement = "press F for the second estimate";
        if (pair.flowMotion) {
            agreement = pair.flowMotion.label === pair.motion.label
                ? "block flow agrees"
                : "block flow says " + pair.flowMotion.label;
        }
        text(
            pair.motion.angle + " degrees, shift " +
            pair.motion.distance.toFixed(1) + " px, " + agreement,
            centreX, y + h - 26
        );
        pop();
    }

    /**
     * Draws the pair name, the centroids, the shift and the check against the
     * direction the pair was built to show.
     * @param {FramePair} pair - Pair on screen.
     * @return {void}
     */
    drawReadout(pair) {
        const y = this.readoutTop;

        push();
        noStroke();
        fill(200);
        textAlign(LEFT, TOP);
        textSize(14);
        text(
            pair.label + "   [<] [>] change pair   edge threshold " +
            this.thresholdSlider.value(),
            this.columnX[0], y
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
        // Below the slider that sits between the two lines.
        fill(170);
        text(readout, this.columnX[0], y + 52);

        if (pair.motion) {
            const correct = pair.motion.label === pair.expected;
            fill(correct ? color(120, 220, 140) : color(240, 130, 130));
            text(
                "expected " + pair.expected + "   centroid " +
                pair.motion.label + (correct ? "   match" : "   mismatch"),
                this.checkX, y
            );
        }
        if (pair.flowMotion) {
            const flowCorrect = pair.flowMotion.label === pair.expected;
            fill(flowCorrect ? color(120, 220, 140) : color(240, 130, 130));
            text(
                "block flow " + pair.flowMotion.label +
                "   dx " + pair.flowMotion.dx.toFixed(1) +
                "   dy " + pair.flowMotion.dy.toFixed(1) +
                (flowCorrect ? "   match" : "   mismatch"),
                this.checkX, y + 23
            );
        }
        pop();
    }

    /**
     * Draws an empty panel with its label.
     * @param {number} x - Left edge of the panel.
     * @param {number} y - Top edge of the panel.
     * @param {string} label - Caption above the panel.
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
     * @param {string} message - Prompt to show.
     * @param {number} y - Height the prompt is centred on.
     * @return {void}
     */
    drawNotice(message, y) {
        push();
        noStroke();
        fill(210);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(message, width / 2, y);
        pop();
    }

    /**
     * @return {string} Keys available now, for the header.
     */
    hint() {
        if (this.currentStage() === "idle") return "[P] panorama screen";
        if (this.pairs.length === 0) return "[P] panorama  [I] load pairs";
        return "[I] pairs  [G] grey  [E] edges  [T] threshold  " +
            "[N] centroid  [D] arrow  [F] block flow";
    }
}
