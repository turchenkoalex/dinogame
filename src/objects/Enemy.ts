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
  constructor(scene: Phaser.Scene, x: number, y: number, sizeMultiplier = 1) {
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

    this.on('animationcomplete-dragon-fire', () => {
      this.play('dragon-idle');
    });
    this.once('destroy', () => {
      this.hurtTimer?.remove(false);
      this.warningTimer?.remove(false);
    });
  }

  update(player: Player) {
    if (this.health <= 0 || !player.isLive()) return;
    const dx = player.body.center.x - this.body.center.x;
    const dy = Math.abs(player.body.bottom - this.body.bottom);
    if (Math.abs(dx) < DRAGON_NOTICE_DISTANCE && dy < 110) {
      this.setFlipX(dx > 0);
      this.attack();
    }
  }

  attack() {
    if (this.health <= 0 || this.scene.time.now < this.nextAttackAt || this.warningTimer) return;
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

    if (this.health === 0) {
      this.emit('defeated');
      this.attackPending = false;
      // 11 — двенадцатый кадр дракона: он лежит поверженным.
      this.anims.stop();
      this.setFrame(11);
      this.body.stop();
      this.body.enable = false;
    } else {
      this.attackPending ||= this.anims.currentAnim?.key === 'dragon-fire' && this.anims.isPlaying;
      this.anims.stop();
      this.setFrame(10);
      this.hurtTimer = this.scene.time.delayedCall(300, () => {
        this.hurtTimer = undefined;
        if (this.health <= 0) return;

        if (this.attackPending) {
          this.attackPending = false;
          this.nextAttackAt = 0;
          this.attack();
        } else {
          this.play('dragon-idle');
        }
      });
    }
  }
}
