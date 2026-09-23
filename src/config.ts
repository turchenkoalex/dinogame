export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Примерная ширина тайла на экране. Меньше число — больше повторений травы.
export const TERRAIN_TILE_WIDTH = 64;

// Физическая рамка земли чуть ниже картинки, чтобы рыцарь стоял на траве.
export const GROUND_BODY_OFFSET_Y = 8;

// Попробуй увеличить число: персонаж станет быстрее бегать.
export const PLAYER_SPEED = 280;

// Минус направляет прыжок вверх. Попробуй -650 для более высокого прыжка.
export const PLAYER_JUMP_VELOCITY = -650;
export const PLAYER_AIR_JUMP_VELOCITY = -570;
export const PLAYER_DASH_SPEED = 750;
export const PLAYER_DASH_DURATION = 180;
export const PLAYER_DASH_COOLDOWN = 1100;

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

// Увеличь число, чтобы дракон отвечал на взмах мечом с большей дистанции.
export const DRAGON_ATTACK_DISTANCE = 140;
export const DRAGON_NOTICE_DISTANCE = 360;
export const DRAGON_ATTACK_COOLDOWN = 2800;
// Три кадра при скорости 3 кадра/сек дают выдох длиной в одну секунду.
export const DRAGON_ATTACK_FRAME_RATE = 3;

export const PLAYER_MAX_HEALTH = 100;
export const DRAGON_MAX_HEALTH = 200;
export const PLAYER_ATTACK_DAMAGE = 10;
export const DRAGON_ATTACK_DAMAGE = 15;
export const HEALTH_MUSHROOM_HEAL = 50;
export const GOLDEN_ARMOR_DURATION = 15000;
