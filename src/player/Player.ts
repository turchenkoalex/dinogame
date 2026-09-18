import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY } from '../config';

export class Player extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.Body;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 40, 56, 0xffb347);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    this.cursors = scene.input.keyboard!.createCursorKeys();
  }

  update() {
    this.body.setVelocityX(0);

    if (this.cursors.left.isDown) {
      this.body.setVelocityX(-PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.body.setVelocityX(PLAYER_SPEED);
    }

    const spacePressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    const upPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up);

    // Прыгаем только с опоры и только при новом нажатии клавиши.
    if ((spacePressed || upPressed) && this.body.blocked.down) {
      this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
    }
  }
}
