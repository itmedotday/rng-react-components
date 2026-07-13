import type { CoinSide } from '../CoinFlip/types';

/** Logical (internal) canvas resolution; CSS scales the canvas responsively. */
export const SCENE_SIZE = 512;

const CENTER = SCENE_SIZE / 2;
const COIN_R = 150;
const HOP_HEIGHT = 90;
/** Even so the starting face returns face-up; an extra half turn is added when the target differs. */
const BASE_HALF_TURNS = 6;

const ORANGE_FILL = 0xf59e0b;
const ORANGE_RIM = 0xb45309;
const BLUE_FILL = 0x3b82f6;
const BLUE_RIM = 0x1d4ed8;

export type PhaserNamespace = typeof import('phaser');

export interface CoinFlipScene extends Phaser.Scene {
  /** Animate a toss that lands showing the given side. */
  flipToSide(side: CoinSide, duration: number, onComplete: () => void): void;
}

function otherSide(side: CoinSide): CoinSide {
  return side === 'orange' ? 'blue' : 'orange';
}

/**
 * Builds the scene class lazily so `phaser` itself can stay a dynamic import
 * (Phaser touches browser globals and would break SSR if imported eagerly).
 */
export function createCoinFlipScene(
  P: PhaserNamespace,
  onReady?: () => void,
): CoinFlipScene {
  class CoinScene extends P.Scene implements CoinFlipScene {
    private coin!: Phaser.GameObjects.Container;
    private orangeFace!: Phaser.GameObjects.Container;
    private blueFace!: Phaser.GameObjects.Container;
    private shadow!: Phaser.GameObjects.Ellipse;
    private flipCounter: Phaser.Tweens.Tween | null = null;
    private currentSide: CoinSide = 'orange';

    constructor() {
      super('coin-flip');
    }

    create(): void {
      this.shadow = this.add.ellipse(
        CENTER,
        CENTER + COIN_R + 40,
        COIN_R * 1.7,
        44,
        0x000000,
        0.35,
      );
      this.orangeFace = this.buildFace(ORANGE_FILL, ORANGE_RIM, 'O');
      this.blueFace = this.buildFace(BLUE_FILL, BLUE_RIM, '◆');
      this.blueFace.setVisible(false);
      this.coin = this.add.container(CENTER, CENTER, [this.orangeFace, this.blueFace]);
      onReady?.();
    }

    flipToSide(side: CoinSide, duration: number, onComplete: () => void): void {
      this.flipCounter?.remove();
      const startSide = this.currentSide;
      // Full turns always run so repeat outcomes still animate; the extra half
      // turn makes the opposite face finish up when the outcome changes.
      const halfTurns = BASE_HALF_TURNS + (side === startSide ? 0 : 1);

      this.flipCounter = this.tweens.addCounter({
        from: 0,
        to: 1,
        duration,
        ease: 'Cubic.easeOut',
        onUpdate: (tween) => {
          const t = tween.getValue() ?? 0;
          const phase = t * halfTurns * Math.PI;
          this.coin.scaleX = Math.max(Math.abs(Math.cos(phase)), 0.02);
          const startFaceUp = Math.floor(phase / Math.PI) % 2 === 0;
          this.showFace(startFaceUp ? startSide : otherSide(startSide));

          const hop = Math.sin(Math.PI * t) * HOP_HEIGHT;
          this.coin.y = CENTER - hop;
          this.shadow.setScale(1 - (hop / HOP_HEIGHT) * 0.35);
          this.shadow.setAlpha(0.35 - (hop / HOP_HEIGHT) * 0.15);

          // Squash-bounce as the coin settles.
          this.coin.scaleY =
            t > 0.92 ? 1 - 0.12 * Math.sin(((t - 0.92) / 0.08) * Math.PI) : 1;
        },
        onComplete: () => {
          this.flipCounter = null;
          this.currentSide = side;
          this.showFace(side);
          this.coin.setScale(1, 1);
          this.coin.y = CENTER;
          this.shadow.setScale(1).setAlpha(0.35);
          onComplete();
        },
      });
    }

    private buildFace(
      fill: number,
      rim: number,
      glyph: string,
    ): Phaser.GameObjects.Container {
      const g = this.add.graphics();
      g.fillStyle(rim, 1);
      g.fillCircle(0, 0, COIN_R);
      g.fillStyle(fill, 1);
      g.fillCircle(0, 0, COIN_R - 14);
      g.lineStyle(4, 0xffffff, 0.25);
      g.strokeCircle(0, 0, COIN_R - 24);
      // Soft top-left sheen.
      g.fillStyle(0xffffff, 0.14);
      g.fillEllipse(-COIN_R * 0.35, -COIN_R * 0.4, COIN_R * 0.9, COIN_R * 0.55);

      const text = this.add
        .text(0, 0, glyph, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '148px',
          fontStyle: 'bold',
          color: '#ffffff',
        })
        .setOrigin(0.5);

      return this.add.container(0, 0, [g, text]);
    }

    private showFace(side: CoinSide): void {
      this.orangeFace.setVisible(side === 'orange');
      this.blueFace.setVisible(side === 'blue');
    }
  }

  return new CoinScene();
}
