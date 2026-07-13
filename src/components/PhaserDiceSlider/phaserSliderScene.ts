/** Logical (internal) canvas resolution; CSS scales the canvas responsively. */
export const SCENE_WIDTH = 640;
export const SCENE_HEIGHT = 200;

const TRACK_PAD = 48;
const TRACK_Y = 132;
const TRACK_H = 14;
const TRACK_W = SCENE_WIDTH - TRACK_PAD * 2;
const BADGE_W = 104;
const BADGE_H = 48;
const BADGE_Y = TRACK_Y - 58;

const PANEL_FILL = 0x18181b;
const PANEL_STROKE = 0x3f3f46;
const LOSS_COLOR = 0xe11d48;
const WIN_COLOR = 0x10b981;
const THUMB_COLOR = 0x6366f1;

export type PhaserNamespace = typeof import('phaser');

export interface DiceSliderScene extends Phaser.Scene {
  /** Instantly redraw the win/loss zones and thumb for a new target. */
  setTarget(target: number, isRollOver: boolean): void;
  /** Slide the outcome badge to the rolled value. */
  rollToOutcome(
    outcome: number,
    isWin: boolean,
    duration: number,
    onComplete: () => void,
  ): void;
}

function xForValue(value: number): number {
  return TRACK_PAD + (value / 100) * TRACK_W;
}

/**
 * Builds the scene class lazily so `phaser` itself can stay a dynamic import
 * (Phaser touches browser globals and would break SSR if imported eagerly).
 */
export function createDiceSliderScene(
  P: PhaserNamespace,
  onReady?: () => void,
): DiceSliderScene {
  class SliderScene extends P.Scene implements DiceSliderScene {
    private zones!: Phaser.GameObjects.Graphics;
    private thumb!: Phaser.GameObjects.Container;
    private badge!: Phaser.GameObjects.Container;
    private badgeText!: Phaser.GameObjects.Text;
    private rollCounter: Phaser.Tweens.Tween | null = null;
    private cycleTimer: Phaser.Time.TimerEvent | null = null;
    private target = 50;
    private isRollOver = true;
    private previousOutcome: number | null = null;

    constructor() {
      super('dice-slider');
    }

    create(): void {
      this.drawPanel();
      this.zones = this.add.graphics();
      this.thumb = this.buildThumb();
      this.badge = this.buildBadge();
      this.redraw();
      onReady?.();
    }

    setTarget(target: number, isRollOver: boolean): void {
      this.target = target;
      this.isRollOver = isRollOver;
      this.redraw();
    }

    rollToOutcome(
      outcome: number,
      isWin: boolean,
      duration: number,
      onComplete: () => void,
    ): void {
      this.rollCounter?.remove();
      this.cycleTimer?.remove();
      this.tweens.killTweensOf(this.badge);

      const startX = xForValue(this.previousOutcome ?? 50);
      const endX = xForValue(outcome);
      this.badge.setAlpha(1).setScale(1).setX(startX);
      this.badgeText.setColor('#f4f4f5');

      this.cycleTimer = this.time.addEvent({
        delay: 30,
        loop: true,
        callback: () => {
          this.badgeText.setText((Math.random() * 100).toFixed(2));
        },
      });

      this.rollCounter = this.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        ease: 'Back.easeOut',
        onUpdate: (tween) => {
          const t = tween.getValue() ?? 0;
          const x = startX + (endX - startX) * t;
          // Back easing overshoots; keep the badge on the track.
          this.badge.setX(Math.max(TRACK_PAD, Math.min(TRACK_PAD + TRACK_W, x)));
        },
        onComplete: () => {
          this.rollCounter = null;
          this.cycleTimer?.remove();
          this.cycleTimer = null;
          this.badge.setX(endX);
          this.badgeText.setText(outcome.toFixed(2));
          this.badgeText.setColor(isWin ? '#34d399' : '#fb7185');
          this.previousOutcome = outcome;
          this.tweens.add({
            targets: this.badge,
            scale: { from: 1.15, to: 1 },
            duration: 250,
            ease: 'Back.easeOut',
          });
          onComplete();
        },
      });
    }

    private redraw(): void {
      const splitX = xForValue(this.target);
      const y = TRACK_Y - TRACK_H / 2;
      const r = TRACK_H / 2;
      const leftColor = this.isRollOver ? LOSS_COLOR : WIN_COLOR;
      const rightColor = this.isRollOver ? WIN_COLOR : LOSS_COLOR;

      this.zones.clear();
      this.zones.fillStyle(leftColor, 1);
      this.zones.fillRoundedRect(TRACK_PAD, y, TRACK_W, TRACK_H, r);
      const rightW = TRACK_PAD + TRACK_W - splitX;
      if (rightW > 1) {
        this.zones.fillStyle(rightColor, 1);
        this.zones.fillRoundedRect(splitX, y, rightW, TRACK_H, {
          tl: 0,
          bl: 0,
          tr: Math.min(r, rightW / 2),
          br: Math.min(r, rightW / 2),
        });
      }

      this.thumb.setX(splitX);
    }

    private drawPanel(): void {
      const g = this.add.graphics();
      g.fillStyle(PANEL_FILL, 0.9);
      g.fillRoundedRect(8, 8, SCENE_WIDTH - 16, SCENE_HEIGHT - 16, 24);
      g.lineStyle(2, PANEL_STROKE, 1);
      g.strokeRoundedRect(8, 8, SCENE_WIDTH - 16, SCENE_HEIGHT - 16, 24);
      // Recessed groove behind the colored track.
      g.fillStyle(0x09090b, 1);
      g.fillRoundedRect(
        TRACK_PAD - 10,
        TRACK_Y - TRACK_H / 2 - 10,
        TRACK_W + 20,
        TRACK_H + 20,
        (TRACK_H + 20) / 2,
      );

      for (const tick of [0, 25, 50, 75, 100]) {
        this.add
          .text(xForValue(tick), TRACK_Y + 28, String(tick), {
            fontFamily: 'monospace',
            fontSize: '15px',
            fontStyle: 'bold',
            color: '#71717a',
          })
          .setOrigin(0.5, 0);
      }
    }

    private buildThumb(): Phaser.GameObjects.Container {
      const g = this.add.graphics();
      g.fillStyle(THUMB_COLOR, 1);
      g.fillRoundedRect(-14, -19, 28, 38, 8);
      g.lineStyle(2, 0xc7d2fe, 0.9);
      g.strokeRoundedRect(-14, -19, 28, 38, 8);
      g.lineStyle(2, 0x312e81, 1);
      for (const dx of [-5, 0, 5]) {
        g.beginPath();
        g.moveTo(dx, -8);
        g.lineTo(dx, 8);
        g.strokePath();
      }
      return this.add.container(xForValue(this.target), TRACK_Y, [g]).setDepth(5);
    }

    private buildBadge(): Phaser.GameObjects.Container {
      const g = this.add.graphics();
      g.fillStyle(0x27272a, 1);
      g.fillRoundedRect(-BADGE_W / 2, -BADGE_H / 2, BADGE_W, BADGE_H, 12);
      g.lineStyle(2, 0x52525b, 1);
      g.strokeRoundedRect(-BADGE_W / 2, -BADGE_H / 2, BADGE_W, BADGE_H, 12);
      // Pointer nub toward the track.
      g.fillStyle(0x27272a, 1);
      g.fillTriangle(-8, BADGE_H / 2 - 1, 8, BADGE_H / 2 - 1, 0, BADGE_H / 2 + 9);

      this.badgeText = this.add
        .text(0, 0, '50.00', {
          fontFamily: 'monospace',
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#f4f4f5',
        })
        .setOrigin(0.5);

      return this.add
        .container(xForValue(50), BADGE_Y, [g, this.badgeText])
        .setDepth(10)
        .setAlpha(0);
    }
  }

  return new SliderScene();
}
