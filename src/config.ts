export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Попробуй увеличить число: персонаж станет быстрее бегать.
export const PLAYER_SPEED = 280;

// Минус направляет прыжок вверх. Попробуй -650 для более высокого прыжка.
export const PLAYER_JUMP_VELOCITY = -650;

// Чем больше число, тем быстрее персонаж падает на землю.
export const GRAVITY = 1500;

// Чем больше число, тем быстрее меняются кадры анимации.
export const PLAYER_IDLE_FRAME_RATE = 5;
export const PLAYER_WALK_FRAME_RATE = 8;

// Увеличь число, чтобы рыцарь быстрее взмахивал мечом.
export const PLAYER_ATTACK_FRAME_RATE = 8;

// Попробуй увеличить масштаб, чтобы дракон стал крупнее.
export const DRAGON_SCALE = 0.65;
export const DRAGON_IDLE_FRAME_RATE = 5;

// Время между атаками в миллисекундах: 10000 = 10 секунд.
export const DRAGON_ATTACK_INTERVAL = 10000;
// Три кадра при скорости 3 кадра/сек дают выдох длиной в одну секунду.
export const DRAGON_ATTACK_FRAME_RATE = 3;
