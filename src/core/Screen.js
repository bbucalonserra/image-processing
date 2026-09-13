/** Base class for a task screen. */
class Screen {
    /** Takes the header title and the stage names, in order. */
    constructor(title, stages) {
        this.title = title;
        /** @type {Array<string>} Stages this screen steps through. */
        this.stages = stages;
        /** @type {number} Index of the stage reached. */
        this.stageIndex = 0;
    }

    /** Name of the stage reached. */
    currentStage() {
        return this.stages[this.stageIndex];
    }

    /** Moves to a stage. Skipping forward is refused, going back is not. */
    requestStage(stage) {
        const target = this.stages.indexOf(stage);
        if (target < 0 || target > this.stageIndex + 1) return false;
        this.stageIndex = target;
        return true;
    }

    /** Called when the screen becomes visible. */
    enter() {}

    /** Called when another screen takes over. */
    exit() {}

    /** Handles a key press sent to this screen. */
    handleKey(pressedKey, pressedCode) {}

    /** Advances per frame state. */
    update() {}

    /** Renders the screen. */
    draw() {}

    /** Keys available now, for the header. */
    hint() {
        return "";
    }
}
