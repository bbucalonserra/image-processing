/**
 * Class running Task 1. It owns the four stages the brief asks for, keyed by
 * c to open the carousel, l to load and process the images, and s to start the
 * animation, and it draws the stage panel and the scrolling row of cards.
 */
class CarouselScreen extends Screen {
    /**
     * @param {Array<p5.Image>} sourceImages - The eight provided images.
     * @param {p5.Image} backdrop - Image used behind the featured subject.
     * @param {number} panelTop - Height at which the stage panel begins.
     * @param {number} panelHeight - Height of the stage panel in pixels.
     */
    constructor(sourceImages, backdrop, panelTop, panelHeight) {
        super("TASK 1 - STREAMING CAROUSEL", [
            "idle", "carousel", "loaded", "running"
        ]);

        this.sourceImages = sourceImages;
        this.panelTop = panelTop;
        this.panelHeight = panelHeight;

        /** @type {BackgroundRemover} Threshold based cut out. */
        this.remover = new BackgroundRemover(new MaskRefiner(60, 1, 1));
        /** @type {Carousel} The scrolling row of processed entries. */
        this.carousel = new Carousel(190, 18, 26);
        /** @type {AnimationCycle} Fade and zoom timing of the featured entry. */
        this.cycle = new AnimationCycle(5200, 0.72, 1.15, 0.25);
        /** @type {ScrollingBackground} Backdrop travelling left to right. */
        this.background = new ScrollingBackground(backdrop, 34);
        /** @type {CaptionBanner} Caption travelling right to left. */
        this.caption = new CaptionBanner(30, color(255, 214, 120), 230);

        /** @type {boolean} True while the load notice is on screen. */
        this.pendingLoad = false;
        this.noticeFrames = 0;
        /** @type {number} Time the last load took, in milliseconds. */
        this.loadMillis = 0;
    }

    /**
     * Handles the c, l and s keys of Task 1.
     * @param {string} pressedKey - The key character, already lower cased.
     * @param {number} pressedCode - The p5 key code.
     * @return {void}
     */
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
        }
    }

    /**
     * Processes every provided image through its own threshold row, exactly as
     * the brief describes: walk the settings array, read the colour space and
     * the three values, and cut the background out with them.
     * @return {void}
     */
    loadItems() {
        const startedAt = millis();
        const items = [];

        for (let i = 0; i < this.sourceImages.length; i++) {
            const scaled = PixelUtilities.scaledCopy(
                this.sourceImages[i], 400, 480
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

    /**
     * Advances the load, the scrolling row and the animation sequence.
     * @return {void}
     */
    update() {
        // The notice is given one frame on screen before the processing runs,
        // because the loop is blocked while the pixels are being worked on.
        if (this.pendingLoad) {
            if (this.noticeFrames > 0) {
                this.loadItems();
                this.pendingLoad = false;
            }
            this.noticeFrames++;
            return;
        }

        if (this.stageIndex >= this.stages.indexOf("loaded")) {
            this.carousel.update();
        }
        if (this.currentStage() === "running" && this.cycle.update()) {
            this.carousel.advanceFeatured();
        }
    }

    /**
     * Draws the stage panel, then the scrolling row of cards.
     * @return {void}
     */
    draw() {
        this.drawPanel();
        this.carousel.draw(
            0,
            this.panelTop + this.panelHeight + 16,
            width,
            height - (this.panelTop + this.panelHeight + 16)
        );
    }

    /**
     * Draws the featured area: the moving backdrop, the animated subject and
     * the animated caption, or the prompt for the stage still to be reached.
     * @return {void}
     */
    drawPanel() {
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
        const progress = running ? this.cycle.progress() : 0.5;
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

    /**
     * Draws the cut out subject travelling left to right while it fades and
     * zooms. The position and the size are worked out as numbers and handed to
     * image(), so the sketch never calls translate().
     * @param {CarouselItem} item - The featured entry.
     * @param {number} progress - Position in the stage, 0 to 1.
     * @param {number} alphaValue - Opacity for this frame, 0 to 255.
     * @param {number} scaleFactor - Zoom for this frame.
     * @return {void}
     */
    drawSubject(item, progress, alphaValue, scaleFactor) {
        const drawH = (this.panelHeight - 90) * scaleFactor;
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

    /**
     * Draws a prompt in the middle of the stage panel.
     * @param {string} message - The prompt to show.
     * @return {void}
     */
    drawNotice(message) {
        push();
        noStroke();
        fill(210);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(message, width / 2, this.panelTop + 34);
        pop();
    }

    /**
     * Draws the threshold row and animation phase of the featured entry.
     * @param {CarouselItem} item - The featured entry.
     * @return {void}
     */
    drawStatus(item) {
        push();
        noStroke();
        fill(180);
        textAlign(LEFT, TOP);
        textSize(13);
        text(
            "Featured " + (this.carousel.featuredIndex + 1) + "/8   " +
            item.settingLabel + "   phase: " + this.cycle.phaseName() +
            "   processed in " + Math.round(this.loadMillis) + " ms",
            18,
            this.panelTop + 10
        );
        pop();
    }

    /**
     * @return {string} One line of guidance for the header.
     */
    hint() {
        if (this.currentStage() === "idle") return "[C] carousel";
        if (!this.carousel.isLoaded()) return "[C] carousel  [L] load images";
        return "[C] carousel  [L] load images  [S] start animation";
    }
}
