import { RED_NUMBERS, WHEEL_SEQUENCE } from '../Roulette/rouletteMath';

/** Logical (internal) canvas resolution; CSS scales the canvas responsively. */
export const SCENE_SIZE = 512;

const CENTER = SCENE_SIZE / 2;
const POCKETS = WHEEL_SEQUENCE.length;
const STEP = (Math.PI * 2) / POCKETS;
const TWO_PI = Math.PI * 2;

const POCKET_OUTER_R = 216;
const POCKET_INNER_R = 132;
const TEXT_R = 182;
const BALL_ORBIT_R = 228;
const BALL_LANDED_R = 206;
const BALL_R = 8;

const WHEEL_REVS = 3;
const BALL_REVS = 6;

function pocketFill(n: number): number {
  if (n === 0) return 0x147b3a;
  return RED_NUMBERS.has(n) ? 0xc41e1e : 0x1a1a1a;
}

/** Pocket center angle on an unrotated wheel (radians, index 0 at 12 o'clock). */
function pocketLocalAngle(pocketIndex: number): number {
  return -Math.PI / 2 + pocketIndex * STEP;
}

export type PhaserNamespace = typeof import('phaser');

export interface RouletteWheelScene extends Phaser.Scene {
  /** Animate wheel + ball so the ball settles in the given pocket index. */
  spinToPocket(pocketIndex: number, duration: number, onComplete: () => void): void;
}

/**
 * Builds the scene class lazily so `phaser` itself can stay a dynamic import
 * (Phaser touches browser globals and would break SSR if imported eagerly).
 */
export function createRouletteWheelScene(
  P: PhaserNamespace,
  onReady?: () => void,
): RouletteWheelScene {
  class WheelScene extends P.Scene implements RouletteWheelScene {
    private wheel!: Phaser.GameObjects.Container;
    private ball!: Phaser.GameObjects.Arc;
    private ballShine!: Phaser.GameObjects.Arc;
    private spinCounter: Phaser.Tweens.Tween | null = null;
    private ballAngle = -Math.PI / 2;

    constructor() {
      super('roulette-wheel');
    }

    create(): void {
      this.drawStatics();
      this.wheel = this.buildWheel();
      this.ball = this.add
        .circle(0, 0, BALL_R, 0xf8fafc)
        .setStrokeStyle(1, 0xd1d5db)
        .setDepth(10);
      this.ballShine = this.add
        .circle(0, 0, BALL_R / 3, 0xffffff, 0.8)
        .setDepth(11);
      this.placeBall(this.ballAngle, BALL_LANDED_R);
      onReady?.();
    }

    spinToPocket(pocketIndex: number, duration: number, onComplete: () => void): void {
      this.spinCounter?.remove();

      const localPocket = pocketLocalAngle(pocketIndex);
      const startWheel = this.wheel.rotation;
      const startBall = this.ballAngle;

      // Wheel spins clockwise; the ball travels the opposite way and must
      // finish in the winning pocket in world space.
      const endWheel = startWheel + WHEEL_REVS * TWO_PI;
      let endBall = endWheel + localPocket;
      while (startBall - endBall < BALL_REVS * TWO_PI) {
        endBall -= TWO_PI;
      }

      this.spinCounter = this.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        ease: 'Cubic.easeOut',
        onUpdate: (tween) => {
          const t = tween.getValue() ?? 0;
          this.wheel.setRotation(startWheel + (endWheel - startWheel) * t);
          const lift = Math.min(1, t / 0.1);
          const drop = Math.max(0, (t - 0.8) / 0.2);
          const radius =
            BALL_LANDED_R +
            (BALL_ORBIT_R - BALL_LANDED_R) * lift -
            (BALL_ORBIT_R - BALL_LANDED_R) * drop;
          this.placeBall(startBall + (endBall - startBall) * t, radius);
        },
        onComplete: () => {
          this.spinCounter = null;
          this.wheel.setRotation(endWheel % TWO_PI);
          this.placeBall(endBall, BALL_LANDED_R);
          onComplete();
        },
      });
    }

    private placeBall(angle: number, radius: number): void {
      this.ballAngle = angle;
      const x = CENTER + radius * Math.cos(angle);
      const y = CENTER + radius * Math.sin(angle);
      this.ball.setPosition(x, y);
      this.ballShine.setPosition(x - 2, y - 2);
    }

    /** Bezel and ball track sit behind the wheel and never rotate. */
    private drawStatics(): void {
      const g = this.add.graphics();
      g.fillStyle(0x1a1005, 1);
      g.fillCircle(CENTER, CENTER, POCKET_OUTER_R + 36);
      g.lineStyle(4, 0x8a6a2a, 1);
      g.strokeCircle(CENTER, CENTER, POCKET_OUTER_R + 36);
      g.lineStyle(7, 0x3d2c00, 1);
      g.strokeCircle(CENTER, CENTER, POCKET_OUTER_R + 26);
      g.lineStyle(18, 0x2a2a2a, 1);
      g.strokeCircle(CENTER, CENTER, BALL_ORBIT_R + 2);
    }

    private buildWheel(): Phaser.GameObjects.Container {
      const wheel = this.add.container(CENTER, CENTER);

      const g = this.add.graphics();
      WHEEL_SEQUENCE.forEach((num, i) => {
        const mid = pocketLocalAngle(i);
        g.fillStyle(pocketFill(num), 1);
        g.beginPath();
        g.slice(0, 0, POCKET_OUTER_R, mid - STEP / 2, mid + STEP / 2, false);
        g.fillPath();
        g.lineStyle(1, 0x000000, 0.6);
        g.strokePath();
      });
      // Hub covers the slice tips so pockets read as a ring.
      g.fillStyle(0x0a0a0a, 1);
      g.fillCircle(0, 0, POCKET_INNER_R);
      g.lineStyle(2, 0x2a2a2a, 1);
      g.strokeCircle(0, 0, POCKET_INNER_R);
      for (const deg of [0, 90, 180, 270]) {
        const rad = (deg * Math.PI) / 180;
        g.lineStyle(9, 0xc9a227, 1);
        g.beginPath();
        g.moveTo(24 * Math.cos(rad), 24 * Math.sin(rad));
        g.lineTo(82 * Math.cos(rad), 82 * Math.sin(rad));
        g.strokePath();
      }
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(0, 0, 38);
      g.lineStyle(3, 0xc9a227, 1);
      g.strokeCircle(0, 0, 38);
      g.fillStyle(0xd4af37, 1);
      g.fillCircle(0, 0, 17);
      g.fillStyle(0xf5e6a3, 1);
      g.fillCircle(0, 0, 6);
      wheel.add(g);

      WHEEL_SEQUENCE.forEach((num, i) => {
        const mid = pocketLocalAngle(i);
        const label = this.add
          .text(TEXT_R * Math.cos(mid), TEXT_R * Math.sin(mid), String(num), {
            fontFamily: 'monospace',
            fontSize: num === 0 ? '20px' : '18px',
            fontStyle: 'bold',
            color: '#ffffff',
          })
          .setOrigin(0.5)
          .setRotation(mid + Math.PI / 2);
        wheel.add(label);
      });

      return wheel;
    }
  }

  return new WheelScene();
}
