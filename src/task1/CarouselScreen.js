/** Task 1. Keys c, l and s open, load and start the carousel. */
class CarouselScreen extends Screen {
    /** The eight images, the backdrop and the stage panel box. */
    constructor(sourceImages, backdrop, panelTop, panelHeight) {
        super("TASK 1 - STREAMING CAROUSEL", [
            "idle", "carousel", "loaded", "running"
        ]);

        this.sourceImages = sourceImages;
        this.panelTop = panelTop;
        this.panelHeight = panelHeight;

        /** @type {number} Width every image is reduced to. */
        this.workingWidth = 400;
        /** @type {number} Matching height limit, aspect ratio kept. */
        this.workingHeight = 480;

        /** @type {BackgroundRemover} Threshold based cut out. */
        this.remover = new BackgroundRemover(new MaskRefiner(60, 1, 1));
        /** @type {Carousel} The scrolling row of processed entries. */
        this.carousel = new Carousel(190, 18, 6);
        /** @type {AnimationCycle} Fade and zoom timing of the entry. */
        this.cycle = new AnimationCycle(5200, 0.72, 1.15, 0.25);
        /** @type {ScrollingBackground} Backdrop travelling left to right. */
        this.background = new ScrollingBackground(backdrop, 34);
        /** @type {CaptionBanner} Caption travelling right to left. */
        this.caption = new CaptionBanner(30, color(255, 214, 120), 230);

        /** @type {boolean} True while the colour space comparison is shown. */
        this.comparing = false;
        /** @type {object} Comparison results, cached by image index. */
        this.comparisons = {};

        /** @type {boolean} True while the load notice is on screen. */
        this.pendingLoad = false;
        this.noticeFrames = 0;
        /** @type {number} Time the last load took, in milliseconds. */
        this.loadMillis = 0;
    }

    /** Handles the c, l, s and v keys, and the arrows. */
    handleKey(pressedKey, pressedCode) {
        if (pressedKey === "c") {
            this.requestStage("carousel");
        } else if (pressedKey === "l") {
            if (this.requestStage("loaded")) {
                this.pendingLoad = true;
                this.noticeFrames = 0;
            }
        } else if (pressedKey === "s") {
            if (this.requestStage("running")) this.cycle.restart();
        } else if (pressedKey === "v") {
            if (this.carousel.isLoaded()) this.comparing = !this.comparing;
        } else if (pressedCode === RIGHT_ARROW) {
            this.carousel.advanceFeatured();
        } else if (pressedCode === LEFT_ARROW) {
            this.carousel.retreatFeatured();
        }
    }

    /** Processes the featured image with both rows and keeps the two. */
    buildComparison() {
        const index = this.carousel.featuredIndex;
        if (this.comparisons[index]) return this.comparisons[index];

        const scaled = PixelUtilities.scaledCopy(
            this.sourceImages[index], this.workingWidth, this.workingHeight
        );
        const chosenRow = ThresholdSettings.settingFor(index);
        const otherRow = ThresholdSettings.alternativeFor(index);

        this.comparisons[index] = {
            chosen: this.remover.removeBackgroundWithCounts(
                scaled, chosenRow
            ),
            chosenRow: chosenRow,
            alternative: this.remover.removeBackgroundWithCounts(
                scaled, otherRow
            ),
            alternativeRow: otherRow
        };
        return this.comparisons[index];
    }

    /** Processes every image through its own row of the thresholds table. */
    loadItems() {
        const startedAt = millis();
        const items = [];

        for (let i = 0; i < this.sourceImages.length; i++) {
            const scaled = PixelUtilities.scaledCopy(
                this.sourceImages[i], this.workingWidth, this.workingHeight
            );
            const foreground = this.remover.removeBackground(
                scaled, ThresholdSettings.settingFor(i)
            );
            items.push(new CarouselItem(
                foreground,
                ThresholdSettings.CAPTIONS[i],
                ThresholdSettings.describe(i)
            ));
        }

        this.carousel.setItems(items);
        this.loadMillis = millis() - startedAt;
    }

    /** Advances the load, the card row and the animation. */
    update() {
        // The notice gets one frame on screen before processing blocks.
        if (this.pendingLoad) {
            if (this.noticeFrames > 0) {
                this.loadItems();
                this.pendingLoad = false;
            }
            this.noticeFrames++;
            return;
        }

        if (this.stageIndex >= this.stages.indexOf("loaded")) {
            this.carousel.update(width);
        }
        if (this.currentStage() === "running") {
            this.background.update(this.panelHeight);
            if (this.cycle.update()) this.carousel.advanceFeatured();
        }
    }

    /** Draws the stage panel, then the row of cards. */
    draw() {
        this.drawPanel();
        this.carousel.draw(
            0,
            this.panelTop + this.panelHeight + 16,
            width,
            height - (this.panelTop + this.panelHeight + 16)
        );
    }

    /** Draws the backdrop, subject and caption, or the next prompt. */
    drawPanel() {
        if (this.comparing && this.carousel.isLoaded()) {
            this.drawComparison();
            return;
        }

        const running = this.currentStage() === "running";

        if (running) {
            this.background.draw(0, this.panelTop, width, this.panelHeight);
        } else {
            push();
            noStroke();
            fill(22, 26, 34);
            rect(0, this.panelTop, width, this.panelHeight);
            pop();
        }

        if (this.pendingLoad) {
            this.drawNotice("Processing 8 images, please wait");
            return;
        }
        if (this.currentStage() === "idle") {
            this.drawNotice("Press C to open the carousel");
            return;
        }
        if (!this.carousel.isLoaded()) {
            this.drawNotice("Press L to load and process the images");
            return;
        }

        const item = this.carousel.featuredItem();
        const progress = running ? this.cycle.easedProgress() : 0.5;
        const alphaValue = running ? this.cycle.alpha() : 255;
        const scaleFactor = running ? this.cycle.scaleFactor() : 1;

        this.drawSubject(item, progress, alphaValue, scaleFactor);
        this.caption.draw(
            item.caption,
            0,
            width,
            this.panelTop + this.panelHeight - 44,
            progress,
            alphaValue,
            running ? scaleFactor : 1
        );

        if (!running) this.drawNotice("Press S to start the animation");
        this.drawStatus(item);
    }

    /** Draws the subject moving left to right as it fades and zooms. */
    drawSubject(item, progress, alphaValue, scaleFactor) {
        // The margin keeps the subject inside the panel at full zoom.
        const drawH = (this.panelHeight - 110) * scaleFactor;
        const drawW = drawH * (item.foreground.width / item.foreground.height);
        const centreX = lerp(drawW * 0.6, width - drawW * 0.6, progress);
        const baseline = this.panelTop + this.panelHeight - 56;

        push();
        tint(255, alphaValue);
        image(
            item.foreground,
            centreX - drawW / 2,
            baseline - drawH,
            drawW,
            drawH
        );
        pop();
    }

    /** Draws the two cut outs side by side with their error counts. */
    drawComparison() {
        const result = this.buildComparison();
        const index = this.carousel.featuredIndex;

        push();
        noStroke();
        fill(22, 26, 34);
        rect(0, this.panelTop, width, this.panelHeight);

        fill(220);
        textAlign(CENTER, TOP);
        textSize(15);
        text(
            "COLOUR SPACE COMPARISON, image " + (index + 1) + " of 8" +
            "   [<] [>] change image   [V] back to the carousel",
            width / 2, this.panelTop + 8
        );
        pop();

        const top = this.panelTop + 52;
        const boxH = 244;
        this.drawComparisonSide(
            width * 0.27, top, boxH, "CHOSEN", result.chosenRow, result.chosen
        );
        this.drawComparisonSide(
            width * 0.73, top, boxH, "ALTERNATIVE",
            result.alternativeRow, result.alternative
        );

        const chosenScore =
            result.chosen.backdropLeft + result.chosen.reclaimed;
        const otherScore =
            result.alternative.backdropLeft + result.alternative.reclaimed;
        let verdict = "the two rows tie at " + chosenScore + " px of error";
        if (chosenScore < otherScore) {
            verdict = "the chosen row makes fewer mistakes, " + chosenScore +
                " px against " + otherScore;
        } else if (chosenScore > otherScore) {
            verdict = "the alternative makes fewer mistakes, " + otherScore +
                " px against " + chosenScore;
        }

        push();
        noStroke();
        fill(chosenScore <= otherScore
            ? color(120, 220, 140)
            : color(240, 130, 130));
        textAlign(CENTER, TOP);
        textSize(14);
        text(verdict, width / 2, this.panelTop + this.panelHeight - 26);
        pop();
    }

    /** Draws one side of the comparison, centred on a column. */
    drawComparisonSide(centreX, y, boxH, title, row, result) {
        const w = boxH * (result.image.width / result.image.height);
        const x = centreX - w / 2;

        push();
        noStroke();
        // A mid grey ground shows both leftover backdrop and holes.
        fill(120, 120, 130);
        rect(x, y, w, boxH);
        image(result.image, x, y, w, boxH);

        fill(200);
        textAlign(CENTER, BOTTOM);
        textSize(13);
        text(
            title + "   " + ThresholdSettings.describeRow(row),
            centreX, y - 6
        );
        textAlign(CENTER, TOP);
        text(
            "backdrop left " + result.backdropLeft + " px   " +
            "subject wrongly claimed " + result.reclaimed + " px",
            centreX, y + boxH + 8
        );
        pop();
    }

    /** Draws a prompt on the stage panel. */
    drawNotice(message) {
        push();
        noStroke();
        fill(210);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(message, width / 2, this.panelTop + 34);
        pop();
    }

    /** Draws the threshold row and animation phase of the featured entry. */
    drawStatus(item) {
        const phase = this.currentStage() === "running"
            ? this.cycle.phaseName()
            : "stopped";

        push();
        noStroke();
        fill(180);
        textAlign(LEFT, TOP);
        textSize(13);
        text(
            "Featured " + (this.carousel.featuredIndex + 1) + "/8   " +
            item.settingLabel + "   phase: " + phase +
            "   processed in " + Math.round(this.loadMillis) + " ms",
            18,
            this.panelTop + 10
        );
        pop();
    }

    /** Keys available now, for the header. */
    hint() {
        if (this.currentStage() === "idle") return "[C] carousel";
        if (!this.carousel.isLoaded()) return "[C] carousel  [L] load images";
        return "[C] carousel  [L] load images  [S] start animation  " +
            "[V] compare colour spaces  [<] [>] change image";
    }
}
