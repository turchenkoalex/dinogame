import Phaser from 'phaser';
import { TouchControls } from './TouchControls';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, PLAYER_MAX_HEALTH, GOLDEN_ARMOR_DURATION } from '../config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private touchControls?: TouchControls;
  health = PLAYER_MAX_HEALTH;
  hasGoldenArmor = false;
  private armorTimer?: Phaser.Time.TimerEvent;
  private hurtUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'knight_silver', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.4);
    // Размеры тела задаются до масштаба: в игре остаётся прежнее тело 40×56.
    this.body.setSize(100, 155);
    // Над головой оставлено место для поднятого меча; тело стоит у ног.
    this.body.setOffset(10, 44);
    this.body.setCollideWorldBounds(true);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    if (scene.game.device.input.touch) this.touchControls = new TouchControls(scene);
    this.play('knight-idle');
  }

  isLive(): boolean {
    return this.health > 0;
  }

  takeDamage(amount: number) {
    if (this.hasGoldenArmor || this.health <= 0) return;

    this.health = Math.max(0, this.health - amount);
    this.emit('health-changed', this.health);

    if (this.health <= 0) {
      this.emit('defeated');
      // 14 — пятнадцатый кадр спрайта: рыцарь лежит поверженным.
      this.anims.stop();
      this.setFrame(14);
      this.body.enable = false;
      this.setActive(false);
    } else {
      this.hurtUntil = this.scene.time.now + 300;
      this.anims.stop();
      this.setFrame(13);
    }
  }

  heal(amount: number) {
    this.health = Math.min(PLAYER_MAX_HEALTH, this.health + amount);
    this.emit('health-changed', this.health);
  }

  wearGoldenArmor() {
    this.hasGoldenArmor = true;
    this.emit('armor-changed', true);
    this.armorTimer?.remove(false);
    this.armorTimer = this.scene.time.delayedCall(GOLDEN_ARMOR_DURATION, () => {
      this.hasGoldenArmor = false;
      this.emit('armor-changed', false);
    });
  }

  update() {
    const touch = this.touchControls?.read();
    if (!this.isLive()) return;

    this.body.setVelocityX(0);

    if (this.cursors.left.isDown || touch?.left) {
      this.body.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown || touch?.right) {
      this.body.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    }

    const spacePressed = Phaser.Input.Keyboard.JustDown(this.cursors.space) || touch?.attack;
    const upPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || touch?.jump;

    // Прыгаем только с опоры и только при новом нажатии клавиши.
    if (upPressed && this.body.blocked.down) {
      this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
    }

    // Удерживаем позу урона, чтобы ходьба, прыжок и атака не сменили её сразу.
    if (this.scene.time.now < this.hurtUntil) return;

    const isAttacking = this.anims.currentAnim?.key === 'knight-attack' && this.anims.isPlaying;

    if (spacePressed && !isAttacking) {
      this.play('knight-attack');
      // Сообщаем уровню о начале нового взмаха мечом.
      this.emit('attack-start');
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
