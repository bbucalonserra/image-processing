/** Base class for a task screen. */
class Screen {
    /**
     * @param {string} title - Name shown in the header.
     * @param {Array<string>} stages - Stage names in order. Index 0 is idle.
     */
    constructor(title, stages) {
        this.title = title;
        /** @type {Array<string>} Stages this screen steps through. */
        this.stages = stages;
        /** @type {number} Index of the stage reached. */
        this.stageIndex = 0;
    }

    /**
     * @return {string} Name of the stage reached.
     */
    currentStage() {
        return this.stages[this.stageIndex];
    }

    /**
     * Moves to a stage. A jump of more than one step forward is refused, which
     * enforces the key order the brief sets out. Going back is allowed.
     * @param {string} stage - Requested stage name.
     * @return {boolean} Whether the stage was entered.
     */
    requestStage(stage) {
        const target = this.stages.indexOf(stage);
        if (target < 0 || target > this.stageIndex + 1) return false;
        this.stageIndex = target;
        return true;
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
     * Handles a key press sent to this screen.
     * @param {string} pressedKey - Key character, lower cased.
     * @param {number} pressedCode - p5 key code.
     * @return {void}
     */
    handleKey(pressedKey, pressedCode) {}

    /**
     * Advances per frame state.
     * @return {void}
     */
    update() {}

    /**
     * Renders the screen.
     * @return {void}
     */
    draw() {}

    /**
     * @return {string} Keys available now, for the header.
     */
    hint() {
        return "";
    }
}
