import type { CardRank, CardSuit } from '../TwentyOne/types';

/** Logical (internal) canvas resolution; CSS scales the canvas responsively. */
export const SCENE_WIDTH = 480;
export const SCENE_HEIGHT = 340;

const CARD_W = 60;
const CARD_H = 84;
const FAN_X = 34;
const DEALER_Y = 82;
const PLAYER_Y = 248;
const SHOE_X = SCENE_WIDTH - 46;
const SHOE_Y = 38;
const DEAL_MS = 240;
const FLIP_MS = 90;
const SHIFT_MS = 160;

const RED_SUITS = new Set<CardSuit>(['♥', '♦']);

export interface CardView {
  rank: CardRank;
  suit: CardSuit;
  faceUp: boolean;
}

export interface TableState {
  dealer: CardView[];
  hands: CardView[][];
  activeHand: number;
}

export type PhaserNamespace = typeof import('phaser');

export interface TwentyOneTableScene extends Phaser.Scene {
  /**
   * Reconcile the rendered table with the given state: new cards deal in from
   * the shoe, face changes flip, and a shrinking state clears the table.
   */
  syncTable(state: TableState, opts?: { instant?: boolean }): void;
}

interface CardSprite {
  view: CardView;
  container: Phaser.GameObjects.Container;
}

function sameCard(a: CardView, b: CardView): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

/**
 * Builds the scene class lazily so `phaser` itself can stay a dynamic import
 * (Phaser touches browser globals and would break SSR if imported eagerly).
 */
export function createTwentyOneTableScene(
  P: PhaserNamespace,
  onReady?: () => void,
): TwentyOneTableScene {
  class TableScene extends P.Scene implements TwentyOneTableScene {
    private dealerSprites: CardSprite[] = [];
    private handSprites: CardSprite[][] = [];
    private activeMarker!: Phaser.GameObjects.Rectangle;

    constructor() {
      super('twentyone-table');
    }

    create(): void {
      this.drawFelt();
      this.activeMarker = this.add
        .rectangle(SCENE_WIDTH / 2, PLAYER_Y + CARD_H / 2 + 14, 120, 5, 0xf5c542)
        .setDepth(1)
        .setVisible(false);
      onReady?.();
    }

    syncTable(state: TableState, opts?: { instant?: boolean }): void {
      const instant = opts?.instant ?? false;

      if (this.stateShrank(state)) {
        this.clearSprites();
      }
      while (this.handSprites.length < state.hands.length) {
        this.handSprites.push([]);
      }

      const handCount = state.hands.length;
      this.syncRow(this.dealerSprites, state.dealer, instant, (i, count) =>
        this.dealerSlot(i, count),
      );
      state.hands.forEach((hand, h) => {
        this.syncRow(this.handSprites[h], hand, instant, (i, count) =>
          this.playerSlot(h, i, count, handCount),
        );
      });

      this.activeMarker
        .setVisible(handCount > 1)
        .setX(this.handCenterX(state.activeHand, handCount));
    }

    /** A shrinking row means a fresh deal is starting; rebuild from scratch. */
    private stateShrank(state: TableState): boolean {
      if (state.dealer.length < this.dealerSprites.length) return true;
      if (state.hands.length < this.handSprites.length) return true;
      return this.handSprites.some(
        (sprites, h) => (state.hands[h]?.length ?? 0) < sprites.length,
      );
    }

    private clearSprites(): void {
      for (const sprite of [...this.dealerSprites, ...this.handSprites.flat()]) {
        this.tweens.killTweensOf(sprite.container);
        sprite.container.destroy();
      }
      this.dealerSprites = [];
      this.handSprites = [];
    }

    private syncRow(
      sprites: CardSprite[],
      views: CardView[],
      instant: boolean,
      slot: (index: number, count: number) => { x: number; y: number },
    ): void {
      // Reposition retained cards first (slots move as the row grows).
      sprites.forEach((sprite, i) => {
        const view = views[i];
        const { x, y } = slot(i, views.length);
        if (!sameCard(sprite.view, view)) {
          // Wholesale replacement (e.g. settle rewrites hands); swap in place.
          this.tweens.killTweensOf(sprite.container);
          sprite.container.destroy();
          sprite.container = this.buildCard(view, x, y).setDepth(2 + i);
          sprite.view = view;
          return;
        }
        if (sprite.view.faceUp !== view.faceUp) {
          this.flipCard(sprite, view, instant);
        }
        if (sprite.container.x !== x || sprite.container.y !== y) {
          this.tweens.killTweensOf(sprite.container);
          if (instant) {
            sprite.container.setPosition(x, y);
          } else {
            this.tweens.add({
              targets: sprite.container,
              x,
              y,
              duration: SHIFT_MS,
              ease: 'Cubic.easeOut',
            });
          }
        }
      });

      // Deal new cards in from the shoe.
      for (let i = sprites.length; i < views.length; i += 1) {
        const view = views[i];
        const { x, y } = slot(i, views.length);
        let container: Phaser.GameObjects.Container;
        if (instant) {
          container = this.buildCard(view, x, y);
        } else {
          container = this.buildCard(view, SHOE_X, SHOE_Y).setAngle(-12);
          this.tweens.add({
            targets: container,
            x,
            y,
            angle: 0,
            duration: DEAL_MS,
            delay: (i - sprites.length) * 90,
            ease: 'Cubic.easeOut',
          });
        }
        container.setDepth(2 + i);
        sprites.push({ view, container });
      }
    }

    private flipCard(sprite: CardSprite, view: CardView, instant: boolean): void {
      sprite.view = view;
      if (instant) {
        this.setCardFace(sprite.container, view);
        return;
      }
      this.tweens.add({
        targets: sprite.container,
        scaleX: 0,
        duration: FLIP_MS,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.setCardFace(sprite.container, view);
          this.tweens.add({
            targets: sprite.container,
            scaleX: 1,
            duration: FLIP_MS,
            ease: 'Sine.easeOut',
          });
        },
      });
    }

    private dealerSlot(i: number, count: number): { x: number; y: number } {
      return {
        x: SCENE_WIDTH / 2 + (i - (count - 1) / 2) * FAN_X,
        y: DEALER_Y,
      };
    }

    private playerSlot(
      hand: number,
      i: number,
      count: number,
      handCount: number,
    ): { x: number; y: number } {
      return {
        x: this.handCenterX(hand, handCount) + (i - (count - 1) / 2) * FAN_X,
        y: PLAYER_Y,
      };
    }

    private handCenterX(hand: number, handCount: number): number {
      if (handCount <= 1) return SCENE_WIDTH / 2;
      return hand === 0 ? SCENE_WIDTH * 0.3 : SCENE_WIDTH * 0.7;
    }

    private buildCard(view: CardView, x: number, y: number): Phaser.GameObjects.Container {
      const container = this.add.container(x, y);
      this.setCardFace(container, view);
      return container;
    }

    private setCardFace(container: Phaser.GameObjects.Container, view: CardView): void {
      container.removeAll(true);
      const g = this.add.graphics();
      if (view.faceUp) {
        g.fillStyle(0xf8fafc, 1);
        g.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 8);
        g.lineStyle(2, 0xcbd5e1, 1);
        g.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 8);
        container.add(g);

        const color = RED_SUITS.has(view.suit) ? '#dc2626' : '#1e293b';
        container.add(
          this.add
            .text(0, -18, view.rank, {
              fontFamily: 'Arial, sans-serif',
              fontSize: '26px',
              fontStyle: 'bold',
              color,
            })
            .setOrigin(0.5),
        );
        container.add(
          this.add
            .text(0, 16, view.suit, {
              fontFamily: 'Arial, sans-serif',
              fontSize: '28px',
              color,
            })
            .setOrigin(0.5),
        );
        return;
      }

      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 8);
      g.lineStyle(2, 0x64748b, 1);
      g.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 8);
      g.lineStyle(1, 0x475569, 1);
      g.strokeRoundedRect(-CARD_W / 2 + 6, -CARD_H / 2 + 6, CARD_W - 12, CARD_H - 12, 5);
      // Diagonal lattice.
      for (let d = -CARD_H; d <= CARD_H; d += 12) {
        g.beginPath();
        g.moveTo(-CARD_W / 2 + 8, d - 8);
        g.lineTo(CARD_W / 2 - 8, d + CARD_W - 24);
        g.strokePath();
      }
      container.add(g);
      container.add(
        this.add
          .text(0, 0, '21', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#94a3b8',
          })
          .setOrigin(0.5),
      );
    }

    private drawFelt(): void {
      const g = this.add.graphics();
      g.fillStyle(0x14532d, 1);
      g.fillRoundedRect(6, 6, SCENE_WIDTH - 12, SCENE_HEIGHT - 12, 26);
      g.fillStyle(0x166534, 0.55);
      g.fillRoundedRect(20, 20, SCENE_WIDTH - 40, SCENE_HEIGHT - 40, 20);
      g.lineStyle(3, 0x0f3d22, 1);
      g.strokeRoundedRect(6, 6, SCENE_WIDTH - 12, SCENE_HEIGHT - 12, 26);
      g.lineStyle(2, 0xf5f5f4, 0.16);
      g.strokeRoundedRect(26, 26, SCENE_WIDTH - 52, SCENE_HEIGHT - 52, 16);

      this.add
        .text(SCENE_WIDTH / 2, SCENE_HEIGHT / 2 - 8, 'BLACKJACK PAYS 3 TO 2', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#f5f5f4',
        })
        .setOrigin(0.5)
        .setAlpha(0.35);
      this.add
        .text(SCENE_WIDTH / 2, SCENE_HEIGHT / 2 + 12, 'INSURANCE PAYS 2 TO 1', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#f5f5f4',
        })
        .setOrigin(0.5)
        .setAlpha(0.25);

      // Shoe marker where cards deal from.
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(SHOE_X - 20, SHOE_Y - 26, 40, 52, 6);
      g.lineStyle(2, 0x64748b, 1);
      g.strokeRoundedRect(SHOE_X - 20, SHOE_Y - 26, 40, 52, 6);
    }
  }

  return new TableScene();
}
