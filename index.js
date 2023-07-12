window.addEventListener('load', function () {
    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1300;
    canvas.height = 550;
    const fillScreenButton = document.getElementById('fillScreenButton')

    let enamys = []
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor() {
            this.keys = [];
            this.touchX = '';
            this.touchY = '';
            this.touchThreshold = 30;
            canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
            canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
            canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
            const restartButton = document.getElementById('restartButton');
            restartButton.addEventListener('click', function () {
                restartGame();
            });
            window.addEventListener('keydown', e => {
                if (e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') {
                    this.handleKey(e.key);
                } else if (e.key === 'Enter' && gameOver) {
                    restartGame();
                }
            });
            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') {
                    this.releaseKey(e.key);
                }
            });
        }
        handleTouchMove(e) {
            const touchX = e.changedTouches[0].pageX;
            const swipeDistanceX = touchX - this.touchX;
            if (swipeDistanceX < -this.touchThreshold && this.keys.indexOf('ArrowLeft') === -1) {
                this.handleKey('ArrowLeft');
            } else if (swipeDistanceX > this.touchThreshold && this.keys.indexOf('ArrowRight') === -1) {
                this.handleKey('ArrowRight');
            }
            if (Math.abs(swipeDistanceX) <= this.touchThreshold) {
                this.releaseKey('ArrowLeft');
                this.releaseKey('ArrowRight');
            }
            const touchY = e.changedTouches[0].pageY;
            const swipeDistanceY = touchY - this.touchY;
            if (swipeDistanceY < -this.touchThreshold && this.keys.indexOf('ArrowUp') === -1) {
                this.handleKey('ArrowUp');
            } else if (swipeDistanceY > this.touchThreshold && this.keys.indexOf('ArrowDown') === -1) {
                this.handleKey('ArrowDown');
                if (gameOver) {
                    restartGame();
                }
            }
        }
        handleKey(key) {
            if (this.keys.indexOf(key) === -1) {
                this.keys.push(key);
            }
        }
        releaseKey(key) {
            const index = this.keys.indexOf(key);
            if (index !== -1) {
                this.keys.splice(index, 1);
            }
        }
        handleTouchStart(e) {
            this.touchX = e.changedTouches[0].pageX;
            this.touchY = e.changedTouches[0].pageY;
        }
        handleTouchEnd(e) {
            this.releaseKey('ArrowUp');
            this.releaseKey('ArrowDown');
            this.releaseKey('ArrowLeft');
            this.releaseKey('ArrowRight');
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 90;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImg');
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.fps = 20
            this.frameTimer = 0
            this.maxFrame = 8
            this.frameX = 0
            this.frameY = 0
            this.frameInterval = 1000 / this.fps
            this.makeForDelicion = false
        }
        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8
            this.frameX = 0
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(input, detailTime, enamys) {
            enamys.forEach(enamy => {
                const dx = (enamy.x + enamy.width / 3) - (this.x + this.width / 4)
                const dy = (enamy.y + enamy.height / 3) - (this.y + this.height / 4);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enamy.width / 2 + this.width / 2) {
                    gameOver = true;
                }
            });

            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0
                else this.frameX++
                this.frameTimer = 0
            } else {
                this.frameTimer += detailTime
            }

            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 2;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -2;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.vy -= 15;
            } else {
                this.speed = 0;
            }

            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
            } else {
                this.vy = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('bgImage');
            this.x = 0;
            this.y = 0;
            this.width = canvas.width;
            this.height = 700;
            this.speed = 4;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
        restart() {
            this.x = 0
        }
    }


    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 55;
            this.height = 55;
            this.image = document.getElementById('animateImage')
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height
            this.speed = 8
            this.frameX = 0
            this.maxFrame = 0
            this.fps = 20
            this.frameTimer = 0
            this.frameInterval = 1000 / this.fps
            this.makeForDelicion = false
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(detailTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0
                else this.frameX++
                this.frameTimer = 0
            } else {
                this.frameTimer += detailTime
            }
            this.x -= this.speed
            if (this.x < 0 - this.width) {
                this.makeForDelicion = true
                score++
            }
        }
    }

    function hanndleEnamy(detailTime) {
        if (enamyTimer > enamyInterval + randomEnamyInterval) {
            enamys.push(new Enemy(canvas.width, canvas.height));
            randomEnamyInterval = Math.random() * 1000 + 500;
            enamyTimer = 0;
        } else {
            enamyTimer += detailTime;
        }

        enamys = enamys.filter(enamy => !enamy.makeForDelicion);

        enamys.forEach(enamy => {
            enamy.draw(ctx);
            enamy.update(detailTime);
        });
    }

    function displayStatusText(context) {
        context.textAlign = 'left';
        context.font = '30px Helvetica';
        context.fillStyle = 'blue';
        context.fillText('Score : ' + score, 20, 50);
        context.fillStyle = 'black';
        context.fillText('Score : ' + score, 21, 51);

        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'blue';
            context.fillText('GAME OVER!', canvas.width / 2, 200);
            context.fillText('Press ENTER or RESTART GAME and play!', canvas.width / 2, 250);
            context.fillStyle = 'black';
            context.fillText('GAME OVER!', canvas.width / 2, 201);
            context.fillText('Press ENTER or RESTART GAME and play!', canvas.width / 2, 251);
            document.getElementById('restartButton').style.display = 'block';
        }
    }

    function restartGame() {
        player.restart()
        background.restart()
        enamys = []
        score = 0
        gameOver = false
        animate(0)
        document.getElementById('restartButton').style.display = 'none';
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
          canvas.parentElement.requestFullscreen().catch((err) => {
            alert(`Error, cannot enable full-screen mode: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
      
    fillScreenButton.addEventListener('click', toggleFullScreen)
    
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enamyTimer = 0;
    let enamyInterval = 1000;
    let randomEnamyInterval = Math.random() * 1000 + 500;



    function animate(timeStamp) {
        const detailTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, detailTime, enamys);
        hanndleEnamy(detailTime);
        displayStatusText(ctx);

        if (!gameOver) {
            requestAnimationFrame(animate);
        }
    }

    animate(0);
})
