/**
 * Routes keys between the two tasks. Key 1 selects Task 1, key 2 selects
 * Task 2, any other key goes to the screen on show.
 */
class AppController {
    /**
     * @param {CarouselScreen} carouselScreen - Task 1 screen.
     * @param {PanoramaScreen} panoramaScreen - Task 2 screen.
     */
    constructor(carouselScreen, panoramaScreen) {
        /** @type {object} Screens keyed by the number that selects them. */
        this.screens = { "1": carouselScreen, "2": panoramaScreen };
        /** @type {Screen|null} Screen on show. */
        this.activeScreen = null;
        /** @type {boolean} True while the key list is on screen. */
        this.showingHelp = false;
    }

    /**
     * Every key the app accepts, grouped by where it applies.
     * @return {Array<Array<string>>} Rows of [key, meaning].
     */
    static get HELP_KEYS() {
        return [
            ["1", "load Task 1, the streaming carousel"],
            ["2", "load Task 2, the panorama motion guide"],
            ["H", "show or hide this list"],
            ["", ""],
            ["Task 1", ""],
            ["C", "open the carousel"],
            ["L", "load the images and remove their backgrounds"],
            ["S", "start the animation"],
            ["V", "compare the two colour spaces on the featured image"],
            ["< >", "change the featured image"],
            ["", ""],
            ["Task 2", ""],
            ["P", "open the panorama screen"],
            ["I", "load the pairs of images"],
            ["G", "convert both frames to greyscale"],
            ["E", "apply the edge filter"],
            ["T", "threshold the edges, with the slider below"],
            ["N", "compute the centroid of each frame"],
            ["D", "show the direction arrow"],
            ["F", "add the block matching estimate"],
            ["< >", "change the pair"]
        ];
    }

    /**
     * Puts one task on screen and tells the outgoing screen it is leaving.
     * @param {string} taskKey - "1" or "2".
     * @return {void}
     */
    selectTask(taskKey) {
        const next = this.screens[taskKey];
        if (!next || next === this.activeScreen) return;

        if (this.activeScreen) this.activeScreen.exit();
        this.activeScreen = next;
        this.activeScreen.enter();
    }

    /**
     * Sends a key press to the task switcher or to the active screen.
     * @param {string} pressedKey - Key character.
     * @param {number} pressedCode - p5 key code.
     * @return {void}
     */
    handleKey(pressedKey, pressedCode) {
        if (pressedKey === "1" || pressedKey === "2") {
            this.selectTask(pressedKey);
            return;
        }
        if (pressedKey.toLowerCase() === "h") {
            this.showingHelp = !this.showingHelp;
            return;
        }
        if (this.activeScreen) {
            this.activeScreen.handleKey(pressedKey.toLowerCase(), pressedCode);
        }
    }

    /**
     * Advances the active screen.
     * @return {void}
     */
    update() {
        if (this.activeScreen) this.activeScreen.update();
    }

    /**
     * Draws the header and the active screen, or the prompt when no task
     * has been selected.
     * @return {void}
     */
    draw() {
        background(16, 18, 24);
        this.drawHeader();

        if (!this.activeScreen) {
            push();
            noStroke();
            fill(210);
            textAlign(CENTER, CENTER);
            textSize(22);
            text(
                "Press 1 for the streaming carousel, 2 for the panorama guide",
                width / 2,
                height / 2
            );
            pop();
            return;
        }

        this.activeScreen.draw();
        if (this.showingHelp) this.drawHelp();
    }

    /**
     * Draws the key list over the canvas.
     * @return {void}
     */
    drawHelp() {
        push();
        noStroke();
        fill(10, 12, 18, 235);
        rect(0, 0, width, height);

        fill(235);
        textAlign(CENTER, TOP);
        textSize(22);
        textStyle(BOLD);
        text("KEYS", width / 2, 60);

        textStyle(NORMAL);
        textSize(15);
        const left = width / 2 - 220;
        let y = 110;
        for (const row of AppController.HELP_KEYS) {
            if (row[0] === "") {
                y += 14;
                continue;
            }
            if (row[1] === "") {
                fill(120, 190, 255);
                textAlign(LEFT, TOP);
                text(row[0], left, y);
            } else {
                fill(190);
                textAlign(RIGHT, TOP);
                text(row[0], left + 60, y);
                fill(225);
                textAlign(LEFT, TOP);
                text(row[1], left + 80, y);
            }
            y += 24;
        }
        pop();
    }

    /**
     * Draws the title bar with the task name and the keys available now.
     * @return {void}
     */
    drawHeader() {
        push();
        noStroke();
        fill(28, 32, 42);
        rect(0, 0, width, 76);

        fill(235);
        textAlign(LEFT, CENTER);
        textSize(19);
        textStyle(BOLD);
        text(
            this.activeScreen
                ? this.activeScreen.title
                : "CM2030 - IMAGE PROCESSING APPLICATIONS",
            24, 26
        );

        fill(150);
        textSize(14);
        textStyle(NORMAL);
        text(
            "[1] task 1   [2] task 2   [H] keys" +
            (this.activeScreen ? "   " + this.activeScreen.hint() : ""),
            24, 54
        );
        pop();
    }
}
