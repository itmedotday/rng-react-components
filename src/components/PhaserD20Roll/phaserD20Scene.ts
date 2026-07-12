/** Logical (internal) canvas resolution; CSS scales the canvas responsively. */
export const SCENE_SIZE = 512;

const CENTER = SCENE_SIZE / 2;
const HEX_R = 176;
/** Central face triangle vertices sit this far toward the center from the hexagon's. */
const FACE_SCALE = 0.58;
const SPIN_TURNS = 3;
const TWO_PI = Math.PI * 2;

const BODY_FILL = 0x4c1d95;
const FACE_FILL = 0x6d28d9;
const EDGE_COLOR = 0x8b5cf6;
const CRIT_COLOR = 0xf5c542;
const FUMBLE_COLOR = 0xef4444;

export type PhaserNamespace = typeof import('phaser');

export interface D20Scene extends Phaser.Scene {
  /** Animate a roll that settles on the given value (1-20). */
  rollToValue(value: number, duration: number, onComplete: () => void): void;
}

/** Pointy-top hexagon vertex angles, starting at 12 o'clock. */
function hexAngle(i: number): number {
  return -Math.PI / 2 + (i * Math.PI) / 3;
}

/**
 * Builds the scene class lazily so `phaser` itself can stay a dynamic import
 * (Phaser touches browser globals and would break SSR if imported eagerly).
 */
export function createD20Scene(
  P: PhaserNamespace,
  onReady?: () => void,
): D20Scene {
  class DieScene extends P.Scene implements D20Scene {
    private die!: Phaser.GameObjects.Container;
    private valueText!: Phaser.GameObjects.Text;
    private glow!: Phaser.GameObjects.Arc;
    private rollCounter: Phaser.Tweens.Tween | null = null;
    private cycleTimer: Phaser.Time.TimerEvent | null = null;

    constructor() {
      super('d20-roll');
    }

    create(): void {
      this.glow = this.add
        .circle(CENTER, CENTER, HEX_R + 26, CRIT_COLOR, 1)
        .setAlpha(0);
      this.die = this.buildDie();
      onReady?.();
    }

    rollToValue(value: number, duration: number, onComplete: () => void): void {
      this.rollCounter?.remove();
      this.cycleTimer?.remove();
      this.tweens.killTweensOf(this.glow);
      this.tweens.killTweensOf(this.die);
      this.glow.setAlpha(0);
      this.die.setPosition(CENTER, CENTER).setScale(1).setRotation(0);

      this.cycleTimer = this.time.addEvent({
        delay: 50,
        loop: true,
        callback: () => {
          this.valueText.setText(String(Math.floor(Math.random() * 20) + 1));
        },
      });

      this.rollCounter = this.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        ease: 'Cubic.easeOut',
        onUpdate: (tween) => {
          const t = tween.getValue() ?? 0;
          // Ends on a whole number of turns so the die settles upright.
          this.die.setRotation(t * SPIN_TURNS * TWO_PI);
          this.die.setScale(1 + 0.18 * Math.sin(Math.PI * t));
        },
        onComplete: () => {
          this.rollCounter = null;
          this.cycleTimer?.remove();
          this.cycleTimer = null;
          this.die.setRotation(0).setScale(1);
          this.valueText.setText(String(value));
          this.playFlourish(value);
          onComplete();
        },
      });
    }

    /** Decorative crit/fumble flash; runs after the roll has already resolved. */
    private playFlourish(value: number): void {
      if (value !== 20 && value !== 1) return;
      this.glow.setFillStyle(value === 20 ? CRIT_COLOR : FUMBLE_COLOR, 0.35);
      this.tweens.add({
        targets: this.glow,
        alpha: { from: 0.9, to: 0 },
        duration: 700,
        ease: 'Cubic.easeOut',
      });
      if (value === 20) {
        this.tweens.add({
          targets: this.die,
          scale: { from: 1.2, to: 1 },
          duration: 450,
          ease: 'Back.easeOut',
        });
      } else {
        this.tweens.add({
          targets: this.die,
          x: CENTER + 12,
          duration: 50,
          yoyo: true,
          repeat: 3,
          ease: 'Sine.easeInOut',
          onComplete: () => this.die.setX(CENTER),
        });
      }
    }

    private buildDie(): Phaser.GameObjects.Container {
      const hex = Array.from({ length: 6 }, (_, i) => ({
        x: HEX_R * Math.cos(hexAngle(i)),
        y: HEX_R * Math.sin(hexAngle(i)),
      }));
      // Central face: upright triangle on alternating hexagon vertices.
      const face = [0, 2, 4].map((i) => ({
        x: hex[i].x * FACE_SCALE,
        y: hex[i].y * FACE_SCALE,
      }));

      const g = this.add.graphics();
      g.fillStyle(BODY_FILL, 1);
      g.fillPoints(hex, true);
      g.lineStyle(5, EDGE_COLOR, 1);
      g.strokePoints(hex, true);

      // Facet edges from each face corner to its nearest silhouette vertices.
      g.lineStyle(3, EDGE_COLOR, 0.65);
      [0, 2, 4].forEach((hexIndex, faceIndex) => {
        const corner = face[faceIndex];
        for (const neighbor of [
          hex[hexIndex],
          hex[(hexIndex + 1) % 6],
          hex[(hexIndex + 5) % 6],
        ]) {
          g.beginPath();
          g.moveTo(corner.x, corner.y);
          g.lineTo(neighbor.x, neighbor.y);
          g.strokePath();
        }
      });

      g.fillStyle(FACE_FILL, 1);
      g.fillPoints(face, true);
      g.lineStyle(3, EDGE_COLOR, 1);
      g.strokePoints(face, true);

      this.valueText = this.add
        .text(0, 8, '20', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '92px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5);

      return this.add.container(CENTER, CENTER, [g, this.valueText]);
    }
  }

  return new DieScene();
}
