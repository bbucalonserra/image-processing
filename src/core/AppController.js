/**
 * Class routing the application between the two tasks. Key 1 loads Task 1 and
 * key 2 loads Task 2, as the brief requires, and every other key is passed to
 * whichever screen is on show.
 */
class AppController {
    /**
     * @param {CarouselScreen} carouselScreen - The Task 1 screen.
     * @param {PanoramaScreen} panoramaScreen - The Task 2 screen.
     */
    constructor(carouselScreen, panoramaScreen) {
        /** @type {object} The screens, keyed by the number that selects them. */
        this.screens = { "1": carouselScreen, "2": panoramaScreen };
        /** @type {Screen|null} The screen currently on show. */
        this.activeScreen = null;
    }

    /**
     * Brings one task on screen, telling the outgoing screen it is leaving so
     * it can put away anything that lives outside the canvas.
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
     * Routes a key press to the task switcher or to the active screen.
     * @param {string} pressedKey - The raw key character.
     * @param {number} pressedCode - The p5 key code.
     * @return {void}
     */
    handleKey(pressedKey, pressedCode) {
        if (pressedKey === "1" || pressedKey === "2") {
            this.selectTask(pressedKey);
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
     * Draws the header and the active screen, or the opening prompt when no
     * task has been chosen yet.
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
    }

    /**
     * Draws the title bar holding the task name and the keys it accepts.
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
            "[1] task 1   [2] task 2" +
            (this.activeScreen ? "   " + this.activeScreen.hint() : ""),
            24, 54
        );
        pop();
    }
}
