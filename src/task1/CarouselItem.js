/** One carousel entry and its card. */
class CarouselItem {
    /** Cut out image, its caption and its threshold row written out. */
    constructor(foreground, caption, settingLabel) {
        this.foreground = foreground;
        this.caption = caption;
        this.settingLabel = settingLabel;
    }

    /** Draws the card at the given size, dimmed by fade, 0 to 255. */
    draw(x, y, boxW, boxH, featured, fade) {
        push();
        noStroke();
        fill(featured ? color(38, 58, 92) : color(26, 30, 38));
        rect(x, y, boxW, boxH, 8);

        const inset = 10;
        const fitted = this.fitInside(boxW - inset * 2, boxH - inset * 2 - 26);
        image(
            this.foreground,
            x + (boxW - fitted.w) / 2,
            y + inset + (boxH - inset * 2 - 26 - fitted.h) / 2,
            fitted.w,
            fitted.h
        );

        fill(featured ? color(120, 190, 255) : color(150));
        // The label follows the card, 11 px at full width.
        textSize(boxW * 0.058);
        textAlign(CENTER, BOTTOM);
        text(this.settingLabel, x + boxW / 2, y + boxH - 8);

        if (featured) {
            noFill();
            stroke(120, 190, 255);
            strokeWeight(2);
            rect(x, y, boxW, boxH, 8);
        }

        // Cards away from the centre sit under the strip colour.
        noStroke();
        fill(18, 20, 26, 255 - fade);
        rect(x, y, boxW, boxH, 8);
        pop();
    }

    /** Size that fits a box, aspect ratio kept. */
    fitInside(boxW, boxH) {
        const factor = Math.min(
            boxW / this.foreground.width,
            boxH / this.foreground.height
        );
        return {
            w: this.foreground.width * factor,
            h: this.foreground.height * factor
        };
    }
}
