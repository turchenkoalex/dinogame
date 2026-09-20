import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

type Action = 'left' | 'right' | 'jump' | 'attack';

export class TouchControls {
  private held = new Map<number, Action>();
  private buttons = new Map<Action, Phaser.GameObjects.Arc>();
  private jumpPressed = false;
  private attackPressed = false;

  constructor(scene: Phaser.Scene) {
    const addButton = (action: Action, x: number, y: number, symbol: string) => {
      const button = scene.add.circle(x, y, 48, 0x172331, 0.65)
        .setStrokeStyle(3, 0xffffff, 0.8).setScrollFactor(0).setDepth(1100)
        .setName(`touch-${action}`).setInteractive();
      scene.add.text(x, y, symbol, { fontFamily: 'Arial', fontSize: '44px', color: '#ffffff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(1101);
      this.buttons.set(action, button);
      const press = (pointer: Phaser.Input.Pointer) => {
        if (this.held.get(pointer.id) === action) return;
        this.held.set(pointer.id, action);
        if (action === 'jump') this.jumpPressed = true;
        if (action === 'attack') this.attackPressed = true;
        this.refresh();
      };
      button.on('pointerdown', press);
      // Можно переводить палец между стрелками, не отрывая его от экрана.
      button.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown && (action === 'left' || action === 'right')) press(pointer);
      });
      button.on('pointerout', (pointer: Phaser.Input.Pointer) => {
        if (this.held.get(pointer.id) === action) release(pointer);
      });
    };
    const release = (pointer: Phaser.Input.Pointer) => {
      this.held.delete(pointer.id);
      this.refresh();
    };
    const reset = () => {
      this.held.clear();
      this.jumpPressed = this.attackPressed = false;
      this.refresh();
    };
    addButton('left', 84, GAME_HEIGHT - 76, '←');
    addButton('right', 204, GAME_HEIGHT - 76, '→');
    addButton('jump', GAME_WIDTH - 84, GAME_HEIGHT - 196, '↑');
    addButton('attack', GAME_WIDTH - 84, GAME_HEIGHT - 76, '○');
    scene.input.on('pointerup', release);
    scene.input.on('pointerupoutside', release);
    scene.input.on('gameout', reset);
    scene.game.events.on(Phaser.Core.Events.BLUR, reset);
    // touchcancel бывает при системных жестах и прерывании касания.
    scene.game.canvas.addEventListener('touchcancel', reset);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      reset();
      scene.input.off('pointerup', release);
      scene.input.off('pointerupoutside', release);
      scene.input.off('gameout', reset);
      scene.game.events.off(Phaser.Core.Events.BLUR, reset);
      scene.game.canvas.removeEventListener('touchcancel', reset);
    });
  }

  private refresh() {
    for (const [action, button] of this.buttons) {
      button.setFillStyle(this.isHeld(action) ? 0x438d70 : 0x172331, 0.75);
    }
  }

  private isHeld(action: Action) {
    return Array.from(this.held.values()).includes(action);
  }

  read() {
    const input = {
      left: this.isHeld('left'), right: this.isHeld('right'),
      jump: this.jumpPressed, attack: this.attackPressed,
    };
    this.jumpPressed = this.attackPressed = false;
    return input;
  }
}
