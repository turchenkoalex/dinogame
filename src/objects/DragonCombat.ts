import Phaser from 'phaser';
import { DRAGON_ATTACK_DISTANCE, PLAYER_ATTACK_DAMAGE, DRAGON_ATTACK_DAMAGE } from '../config';
import { Player } from '../player/Player';
import { Enemy } from './Enemy';

// Одинаковые правила направленного боя для обоих уровней.
export function connectDragonCombat(player: Player, dragon: Enemy, damageMultiplier = 1) {
  player.on('attack-start', () => {
    // Сравниваем позиции у ног, учитывая и расстояние по высоте.
    const distance = Phaser.Math.Distance.Between(
      player.body.center.x, player.body.bottom,
      dragon.x, dragon.y,
    );

    // Рыцарь без отражения смотрит вправо: меч не задевает цели за спиной.
    const targetOffsetX = dragon.body.center.x - player.body.center.x;
    const isInFront = player.flipX ? targetOffsetX < 0 : targetOffsetX > 0;
    if (distance <= DRAGON_ATTACK_DISTANCE && isInFront) {
      dragon.takeDamage(PLAYER_ATTACK_DAMAGE);
      dragon.attack();
    }
  });
  dragon.on('animationcomplete-dragon-fire', () => {
    if (dragon.health > 0 && player.health > 0) {
      const distance = Phaser.Math.Distance.Between(player.x, player.y, dragon.x, dragon.y);
      // Исходный спрайт дракона смотрит влево. Проверяем сторону при попадании,
      // чтобы рыцарь мог успеть перебежать за его спину во время выдоха.
      const targetOffsetX = player.body.center.x - dragon.body.center.x;
      const isInFront = dragon.flipX ? targetOffsetX > 0 : targetOffsetX < 0;
      if (distance <= DRAGON_ATTACK_DISTANCE && isInFront) {
        player.takeDamage(DRAGON_ATTACK_DAMAGE * damageMultiplier);
      }
    }
  });
}
