/** Base class for a task screen, defining the interface the app expects. */
class Screen {
    /**
     * @param {string} title - Name shown in the header.
     * @param {Array<string>} stages - Ordered stage names, first one is the
     *     idle stage the screen returns to when it is reset.
     */
    constructor(title, stages) {
        this.title = title;
        /** @type {Array<string>} The pipeline stages this screen steps through. */
        this.stages = stages;
        /** @type {number} Index of the stage currently reached. */
        this.stageIndex = 0;
    }

    /**
     * @return {string} Name of the stage currently reached.
     */
    currentStage() {
        return this.stages[this.stageIndex];
    }

    /**
     * Moves to a stage, refusing jumps that would skip a required step so the
     * keys have to be pressed in the order the brief asks for.
     * @param {string} stage - Name of the requested stage.
     * @return {boolean} Whether the stage was entered.
     */
    requestStage(stage) {
        const target = this.stages.indexOf(stage);
        if (target < 0 || target > this.stageIndex + 1) return false;
        this.stageIndex = target;
        return true;
    }

    /**
     * Returns the screen to its idle stage.
     * @return {void}
     */
    reset() {
        this.stageIndex = 0;
    }

    /**
     * Called when the screen becomes visible.
     * @return {void}
     */
    enter() {}

    /**
     * Called when another screen takes over.
     * @return {void}
     */
    exit() {}

    /**
     * Handles a key press addressed to this screen.
     * @param {string} pressedKey - The key character, already lower cased.
     * @param {number} pressedCode - The p5 key code.
     * @return {void}
     */
    handleKey(pressedKey, pressedCode) {}

    /**
     * Advances any per frame state.
     * @return {void}
     */
    update() {}

    /**
     * Renders the screen.
     * @return {void}
     */
    draw() {}

    /**
     * @return {string} One line of guidance for the header.
     */
    hint() {
        return "";
    }
}
