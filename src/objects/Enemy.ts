import Phaser from 'phaser';
import { DRAGON_SCALE, DRAGON_MAX_HEALTH, DRAGON_NOTICE_DISTANCE, DRAGON_ATTACK_COOLDOWN } from '../config';
import { Player } from '../player/Player';

// Дракон отвечает огнём на близкую атаку рыцаря.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  health = DRAGON_MAX_HEALTH;
  private hurtTimer?: Phaser.Time.TimerEvent;
  private warningTimer?: Phaser.Time.TimerEvent;
  private attackPending = false;
  private nextAttackAt = 0;
  private flightSprite: Phaser.GameObjects.Sprite;
  private flightPhase: 'ground' | 'rise' | 'travel' | 'land' = 'ground';
  private nextFlightAt: number;
  private perchIndex = 0;
  private flightTarget?: { x: number; y: number };
  private flightHeight = 0;

  constructor(
    scene: Phaser.Scene, x: number, y: number, sizeMultiplier = 1,
    private readonly perches: { x: number; y: number }[] = [],
  ) {
    super(scene, x, y, 'dragon', 0);
    scene.add.existing(this);
    // y обозначает землю под ногами. На картинке дракон уже смотрит влево.
    this.setOrigin(0.5, 1);
    this.setScale(DRAGON_SCALE * sizeMultiplier);
    scene.physics.add.existing(this);
    // Постоянная рамка тела без огня; её нижняя граница проходит по лапам.
    this.body.setSize(147, 150);
    this.body.setCollideWorldBounds(true);
    this.play('dragon-idle');
    // Flight artwork uses the standing frame's dimensions and foot-level origin.
    this.flightSprite = scene.add.sprite(x, y, 'dragon-flight-up')
      .setOrigin(0.5, 1).setScale(DRAGON_SCALE * sizeMultiplier).setVisible(false);
    this.flightSprite.setDepth(this.depth + 1);
    this.nextFlightAt = scene.time.now + 3800;

    this.on('animationcomplete-dragon-fire', () => {
      this.play('dragon-idle');
    });
    this.once('destroy', () => {
      this.hurtTimer?.remove(false);
      this.warningTimer?.remove(false);
      this.flightSprite.destroy();
    });
  }

  update(player: Player) {
    if (this.health <= 0) return;
    this.updateFlight();
    if (!player.isLive()) return;
    const dx = player.body.center.x - this.body.center.x;
    const dy = Math.abs(player.body.bottom - this.body.bottom);
    if (this.flightPhase === 'ground' && this.perches.length > 1 &&
        this.scene.time.now >= this.nextFlightAt && Math.abs(dx) < 560 &&
        !this.warningTimer && !this.hurtTimer && this.anims.currentAnim?.key !== 'dragon-fire') {
      this.startFlight();
    }
    if (this.flightPhase !== 'ground') return;
    if (Math.abs(dx) < DRAGON_NOTICE_DISTANCE && dy < 110) {
      this.setFlipX(dx > 0);
      this.attack();
    }
  }

  private startFlight() {
    this.perchIndex = (this.perchIndex + 1) % this.perches.length;
    this.flightTarget = this.perches[this.perchIndex];
    this.flightHeight = Math.max(115, Math.min(this.y, this.flightTarget.y) - 85);
    this.flightPhase = 'rise';
    this.body.setAllowGravity(false);
    this.body.checkCollision.none = true;
    this.body.setVelocity(0, 0);
    this.anims.stop();
    this.setVisible(false);
    this.flightSprite.setVisible(true).setFlipX(this.flipX);
  }

  private updateFlight() {
    if (this.flightPhase === 'ground' || !this.flightTarget) return;
    const target = this.flightPhase === 'rise'
      ? { x: this.x, y: this.flightHeight }
      : this.flightPhase === 'travel'
        ? { x: this.flightTarget.x, y: this.flightHeight }
        : this.flightTarget;
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 5) {
      const speed = this.flightPhase === 'travel' ? 155 : 190;
      this.body.setVelocity(dx / distance * speed, dy / distance * speed);
      if (Math.abs(dx) > 8) this.flightSprite.setFlipX(dx > 0);
    } else {
      this.body.reset(target.x, target.y);
      if (this.flightPhase === 'rise') this.flightPhase = 'travel';
      else if (this.flightPhase === 'travel') this.flightPhase = 'land';
      else {
        this.flightPhase = 'ground';
        this.body.checkCollision.none = false;
        this.body.setAllowGravity(true);
        this.flightSprite.setVisible(false);
        this.setVisible(true).setFlipX(this.flightSprite.flipX);
        this.play('dragon-idle');
        this.nextFlightAt = this.scene.time.now + 4800;
      }
    }
    const wingFrame = Math.floor(this.scene.time.now / 150) % 2 === 0
      ? 'dragon-flight-up' : 'dragon-flight-down';
    if (this.flightSprite.texture.key !== wingFrame) this.flightSprite.setTexture(wingFrame);
    this.flightSprite.setPosition(this.x, this.y);
  }

  attack() {
    if (this.health <= 0 || this.flightPhase !== 'ground' || this.scene.time.now < this.nextAttackAt || this.warningTimer) return;
    this.nextAttackAt = this.scene.time.now + DRAGON_ATTACK_COOLDOWN;

    // Ответный огонь начинается после того, как показана поза урона.
    if (this.hurtTimer) {
      this.attackPending = true;
      return;
    }

    this.setTint(0xff9b61);
    this.warningTimer = this.scene.time.delayedCall(550, () => {
      this.warningTimer = undefined;
      this.clearTint();
      if (this.health > 0) this.play('dragon-fire');
    });
  }

  takeDamage(amount: number) {
    if (this.health <= 0) return;

    this.health = Math.max(0, this.health - amount);
    this.emit('health-changed', this.health);
    this.hurtTimer?.remove(false);
    this.hurtTimer = undefined;
    this.warningTimer?.remove(false);
    this.warningTimer = undefined;
    this.clearTint();
    this.flightSprite.clearTint();

    if (this.health === 0) {
      this.emit('defeated');
      this.attackPending = false;
      // 11 — двенадцатый кадр дракона: он лежит поверженным.
      this.anims.stop();
      this.setFrame(11);
      this.body.stop();
      this.body.enable = false;
      this.flightSprite.setVisible(false);
      this.setVisible(true);
    } else {
      this.attackPending ||= this.anims.currentAnim?.key === 'dragon-fire' && this.anims.isPlaying;
      this.anims.stop();
      this.setFrame(10);
      if (this.flightPhase !== 'ground') this.flightSprite.setTint(0xff9b61);
      this.hurtTimer = this.scene.time.delayedCall(300, () => {
        this.hurtTimer = undefined;
        if (this.health <= 0) return;
        this.flightSprite.clearTint();

        if (this.attackPending) {
          this.attackPending = false;
          this.nextAttackAt = 0;
          this.attack();
        } else {
          if (this.flightPhase === 'ground') this.play('dragon-idle');
        }
      });
    }
  }
}
