import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY } from '../config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'knight_silver', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.4);
    // Размеры тела задаются до масштаба: в игре остаётся прежнее тело 40×56.
    this.body.setSize(100, 140);
    // Над головой оставлено место для поднятого меча; тело стоит у ног.
    this.body.setOffset(10, 58);
    this.body.setCollideWorldBounds(true);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.play('knight-idle');
  }

  update() {
    this.body.setVelocityX(0);

    if (this.cursors.left.isDown) {
      this.body.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.body.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    }

    const spacePressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    const upPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up);

    // Прыгаем только с опоры и только при новом нажатии клавиши.
    if (upPressed && this.body.blocked.down) {
      this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
    }

    const isAttacking = this.anims.currentAnim?.key === 'knight-attack' && this.anims.isPlaying;

    if (spacePressed && !isAttacking) {
      this.play('knight-attack');
    }

    // Даём взмаху закончиться, прежде чем включать ходьбу или прыжок.
    if (isAttacking || spacePressed) {
      return;
    }

    if (!this.body.blocked.down || this.body.velocity.y < 0) {
      this.anims.stop();
      this.setFrame(this.body.velocity.y < 0 ? 8 : 9);
    } else if (this.body.velocity.x !== 0) {
      // true не даёт запускать анимацию заново при каждом обновлении игры.
      this.play('knight-walk', true);
    } else {
      this.play('knight-idle', true);
    }
  }
}
