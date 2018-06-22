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

        // 随机生成 2 个数字方块
        this.addTile();
        this.addTile();

        this.addEvent();

    }

    addEvent() {
        // 移动端操作
        this.input.on("pointerup", this.handleTouch);

        // 键盘操作
        this.input.keyboard.on("keydown", this.handleKey);
    }

    handleTouch = (e) => {

        // 计算按住时间
        let swipeTime = e.upTime - e.downTime;

        // 生成 {x: v1, y: v2} 格式
        let swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);

        // 获取对角线长度
        let swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);

        // 偏向方向比例 1 为直着朝一个方向
        let swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);

        /**
         * 滑动的对角线长度大于 20
         * 滑动的时间小于 1000 毫秒
         * 滑动的角度尽量偏一个方向
         */
        if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > .8 || Math.abs(swipeNormal.x) > .8)) {
            let children = this.tileGroup.getChildren();
            if (swipeNormal.x > .8) {
                for (var i = 0; i < children.length; i++) {

                    // 设置层级，越左侧层级越高
                    children[i].depth = game.config.width - children[i].x;
                }
                console.log('向右')
            }

            if (swipeNormal.x < -.8) {
                for (var i = 0; i < children.length; i++) {

                    // 越向右层级越高
                    children[i].depth = children[i].x;
                }
                console.log('向左')
            }

            if (swipeNormal.y > .8) {
                for (var i = 0; i < children.length; i++) {

                    // 越上面层级越高
                    children[i].depth = game.config.height - children[i].y;
                }
                console.log('向下')
            }

            if (swipeNormal.y < -.8) {
                for (var i = 0; i < children.length; i++) {

                    // 越下面层级越高
                    children[i].depth = children[i].y;
                }
                console.log('向上')
            }
        }
    }

    handleKey = (e) => {
        let children = this.tileGroup.getChildren();
        switch (e.code) {
            case "KeyA":
            case "ArrowLeft":
                for (var i = 0; i < children.length; i++) {

                    // 越向右层级越高
                    children[i].depth = children[i].x;
                }
                console.log('向左')
                break;
            case "KeyD":
            case "ArrowRight":
                for (var i = 0; i < children.length; i++) {

                    // 设置层级，越左侧层级越高
                    children[i].depth = game.config.width - children[i].x;
                }
                console.log('向右')
                break;
            case "KeyW":
            case "ArrowUp":
                for (var i = 0; i < children.length; i++) {

                    // 越下面层级越高
                    children[i].depth = children[i].y;
                }
                console.log('向上')
                break;
            case "KeyS":
            case "ArrowDown":
                for (var i = 0; i < children.length; i++) {

                    // 越上面层级越高
                    children[i].depth = game.config.height - children[i].y;
                }
                console.log('向下')
                break;
        }
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

    addTile() {
        let emptyTiles = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.tileArray[i][j].tileValue === 0) {
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }

        if (emptyTiles.length > 0) {
            let chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
            this.tileArray[chosenTile.row][chosenTile.col].tileValue = 1;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);

            this.tweens.add({
                targets: [this.tileArray[chosenTile.row][chosenTile.col].tileSprite],
                alpha: 1,
                duration: TWEEN_DURATION,
                onCompolete: () => {
                }
            });
        }
    }


}

export default MainScene