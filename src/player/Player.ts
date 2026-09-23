import Phaser from 'phaser';
import { TouchControls } from './TouchControls';
import { PLAYER_SPEED, PLAYER_JUMP_VELOCITY, PLAYER_AIR_JUMP_VELOCITY, PLAYER_DASH_SPEED, PLAYER_DASH_DURATION, PLAYER_DASH_COOLDOWN, PLAYER_MAX_HEALTH, GOLDEN_ARMOR_DURATION } from '../config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private dashKey: Phaser.Input.Keyboard.Key;
  private touchControls?: TouchControls;
  health = PLAYER_MAX_HEALTH;
  hasGoldenArmor = false;
  private armorTimer?: Phaser.Time.TimerEvent;
  private hurtUntil = 0;
  private dashUntil = 0;
  private nextDashAt = 0;
  private lastGroundedAt = 0;
  private jumpQueuedUntil = -1;
  private airJumpsRemaining = 1;

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
    this.dashKey = scene.input.keyboard!.addKey('SHIFT');
    if (scene.game.device.input.touch) this.touchControls = new TouchControls(scene);
    this.play('knight-idle');
  }

  isLive(): boolean {
    return this.health > 0;
  }

  takeDamage(amount: number) {
    if (this.hasGoldenArmor || this.health <= 0 || this.scene.time.now < this.dashUntil || this.scene.time.now < this.hurtUntil) return;

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

  get armorRemaining(): number {
    return this.hasGoldenArmor ? Math.max(0, this.armorTimer?.getRemaining() ?? 0) : 0;
  }

  wearGoldenArmor(duration = GOLDEN_ARMOR_DURATION) {
    this.hasGoldenArmor = true;
    this.refreshAppearance();
    this.emit('armor-changed', true);
    this.armorTimer?.remove(false);
    this.armorTimer = this.scene.time.delayedCall(duration, () => {
      this.hasGoldenArmor = false;
      this.refreshAppearance();
      this.emit('armor-changed', false);
    });
  }

  private refreshAppearance() {
    if (this.scene.time.now < this.dashUntil) this.setTint(0x8de8ff);
    else if (this.hasGoldenArmor) this.setTint(0xffd35a);
    else this.clearTint();
  }

  update() {
    const touch = this.touchControls?.read();
    if (!this.isLive()) return;

    const now = this.scene.time.now;
    const grounded = this.body.blocked.down;
    if (grounded) {
      this.lastGroundedAt = now;
      this.airJumpsRemaining = 1;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || touch?.jump) this.jumpQueuedUntil = now + 130;

    if (now < this.dashUntil) {
      this.body.setVelocity(PLAYER_DASH_SPEED * (this.flipX ? -1 : 1), 0);
      return;
    }
    if (!this.body.allowGravity) this.body.setAllowGravity(true);

    this.body.setVelocityX(0);

    if (this.cursors.left.isDown || touch?.left) {
      this.body.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown || touch?.right) {
      this.body.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    }

    if ((Phaser.Input.Keyboard.JustDown(this.dashKey) || touch?.dash) && now >= this.nextDashAt) {
      this.dashUntil = now + PLAYER_DASH_DURATION;
      this.nextDashAt = now + PLAYER_DASH_COOLDOWN;
      this.body.setAllowGravity(false).setVelocity(PLAYER_DASH_SPEED * (this.flipX ? -1 : 1), 0);
      this.refreshAppearance();
      this.scene.time.delayedCall(PLAYER_DASH_DURATION, () => this.refreshAppearance());
      this.emit('dash-start');
      return;
    }

    const spacePressed = Phaser.Input.Keyboard.JustDown(this.cursors.space) || touch?.attack;

    // Небольшой запас времени на нажатие до приземления и после края платформы.
    if (this.jumpQueuedUntil >= now) {
      let jumped = false;
      if (grounded || now - this.lastGroundedAt < 100) {
        this.body.setVelocityY(PLAYER_JUMP_VELOCITY);
        this.lastGroundedAt = -Infinity;
        jumped = true;
      } else if (this.airJumpsRemaining > 0) {
        this.body.setVelocityY(PLAYER_AIR_JUMP_VELOCITY);
        this.airJumpsRemaining--;
        jumped = true;
      }
      if (jumped) this.jumpQueuedUntil = 0;
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
