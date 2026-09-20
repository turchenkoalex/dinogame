import Phaser from 'phaser';
import { GROUND_BODY_OFFSET_Y } from '../config';

export function addGround(
  scene: Phaser.Scene,
  bodies: Phaser.Physics.Arcade.StaticGroup,
  left: number,
  top: number,
  width: number,
) {
  const bottom = scene.physics.world.bounds.bottom;
  // Повторяем грунт без прозрачного травяного края между вертикальными рядами.
  scene.add.tileSprite(left, top + 24, width, bottom - top - 24, 'ground_middle', 'soil')
    .setOrigin(0);
  scene.add.tileSprite(left, top, width, 64, 'ground_middle', '__BASE').setOrigin(0);
  // Единое тело участка убирает физические стыки; яму собираем отдельными участками.
  const surface = scene.add.zone(left, top + GROUND_BODY_OFFSET_Y, width, bottom - top - GROUND_BODY_OFFSET_Y)
    .setOrigin(0);
  bodies.add(surface);
}
