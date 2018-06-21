import { COL, ROW, TILE_SIZE, TILE_SPACING, TWEEN_DURATION, LOCAL_STORAGE_NAME } from '../constant'

class MainScene extends Phaser.Scene {

    tileArray = [];

    constructor() {
        super({
            key: 'MainScene'
        });



    }

    preload() {
        this.load.image('tile_default', 'assets/sprites/tile_default.png');
        this.load.image('restart', 'assets/sprites/restart.png');
        this.load.image('score', 'assets/sprites/score.png');
        this.load.image('score_best', 'assets/sprites/score_best.png');

        this.load.spritesheet('tiles', 'assets/sprites/tiles.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE
        })
    }

    create() {
        this.layout();
    }

    // 布局
    layout() {

        // 头部
        this.layout_header();

        // 4 * 4 方块
        this.layout_body();
    }

    layout_header() {
        // 添加分数背景
        this.add.sprite(this.setPosition(0, COL) + 30, this.setPosition(0, ROW) - 100, 'score');

        // 添加最高分数背景
        this.add.sprite(this.setPosition(1, COL) + 40, this.setPosition(0, ROW) - 100, 'score_best');

        // 重新开始游戏
        this.add.sprite(this.setPosition(3, COL) - 10, this.setPosition(0, ROW) - 87, "restart");

        // 分数 
        this.make.text({
            x: this.setPosition(0, COL) + 30,
            y: this.setPosition(0, ROW) - 90,
            text: '4',
            origin: { x: 0.5, y: 0.5 },
            style: {
                font: 'bold 22px Arial',
                fill: '#ffffff'
            }
        });

        // 最高分数 
        this.make.text({
            x: this.setPosition(1, COL) + 40,
            y: this.setPosition(0, ROW) - 90,
            text: '10',
            origin: { x: 0.5, y: 0.5 },
            style: {
                font: 'bold 22px Arial',
                fill: '#ffffff'
            }
        });
    }

    layout_body() {
        this.tileGroup = this.add.group();

        for (let i = 0; i < 4; i++) {
            this.tileArray[i] = [];
            for (let j = 0; j < 4; j++) {
                this.add.sprite(
                    this.setPosition(j, COL),
                    this.setPosition(i, ROW),
                    'tile_default');

                let tile = this.add.sprite(
                    this.setPosition(j, COL),
                    this.setPosition(i, ROW),
                    'tiles'
                );

                tile.alpha = 0;
                tile.visible = false;

                this.tileArray[i][j] = {
                    tileValue: 0,
                    tileSprite: tile,
                    canUpgrade: true
                }

                this.tileGroup.add(tile);
            }
        }
    }



    setPosition(pos, direction) {
        let top = direction === ROW ? 100 : 0;
        return pos * (TILE_SIZE + TILE_SPACING) + TILE_SIZE * .5 + TILE_SPACING + top;
    }


}

export default MainScene