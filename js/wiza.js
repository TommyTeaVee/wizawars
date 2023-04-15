function WizardOfWorBullet(e, t, n, r) {
    this.owner = e;
    this.x = t;
    this.y = n;
    this.d = r;
    this.col = 0;
    this.row = 0;
    this.bw = 0;
    this.bh = 0;
    if (this.d == "up" || this.d == "down") {
        this.col = this.owner.col;
        this.bw = 2;
        this.bh = 8
    } else {
        this.row = this.owner.row;
        this.bw = 8;
        this.bh = 2
    }
    this.animationRoutine = function () {
        var e = DATA.sprite.bullets;
        e = this.owner.type == "player" ? e.player : e.monster;
        e = this.col == 0 ? e.h : e.v;
        UTIL.draw(e.x, e.y, e.w, e.h, this.x, this.y)
    };
    this.scanRoutine = function () {
        if (this.owner.status == "shooted" || this.owner.status == "died") {
            this.owner.bullet = false;
            return
        }
        if (this.owner.type == "player") {
            var e = false;
            for (var t = 0; t < game.monsters.length; t++) {
                var n = game.monsters[t];
                if (n.status == "alive" && UTIL.collision(n.x, n.y, 18, 18, this.x, this.y, this.bw, this.bh)) {
                    n.status = "shooted";
                    e = true;
                    var r = DATA.scoring[n.type];
                    if (game.doubleScoreNow) r *= 2;
                    this.owner.score += r
                }
            }
            if (e) {
                engine.audio.stop("Fire");
                this.owner.bullet = false;
                return
            }
            var i = this.owner.num == 1 ? game.players[0].bullet : game.players[1].bullet;
            if (i && UTIL.collision(i.x, i.y, i.bw, i.bh, this.x, this.y, this.bw, this.bh)) {
                this.owner.bullet = false;
                i.owner.bullet = false;
                return
            }
            var s = this.owner.num == 1 ? game.players[0] : game.players[1];
            if (s.status == "alive" && UTIL.collision(s.x, s.y, 18, 18, this.x, this.y, this.bw, this.bh)) {
                r = DATA.scoring.worrior;
                if (game.doubleScoreNow) r *= 2;
                this.owner.score += r;
                s.status = "dead";
                engine.audio.request({
                    name: "Death"
                });
                engine.audio.stop("Fire");
                this.owner.bullet = false;
                return
            }
        } else {
            var e = false;
            for (var t = 0; t < 2; t++) {
                if (game.players[t].status == "alive" && UTIL.collision(game.players[t].x, game.players[t].y, 18, 18, this.x, this.y, this.bw, this.bh)) {
                    e = true;
                    game.players[t].status = "dead";
                    if (this.owner.type == "wizardOfWor") {
                        game.radarText = "MEGLOGOTT";
                        this.owner.status = "died";
                        engine.audio.request({
                            name: "WizardEscape"
                        });
                        game.frameCounters.wizardEscaped = 4.4 * engine.scanFPS;
                        game.players[t].lives--
                    }
                }
            }
            if (e) {
                if (this.owner.type != "wizardOfWor" && this.owner.type != "worluk") {
                    engine.audio.request({
                        name: "Death"
                    })
                }
                this.owner.bullet = false;
                return
            }
        }
        var o = this.owner.type == "player" ? 8 : 4;
        switch (this.d) {
        case "up":
            this.y -= o;
            break;
        case "right":
            this.x += o;
            break;
        case "down":
            this.y += o;
            break;
        case "left":
            this.x -= o;
            break
        }
        if (this.y < 2 || this.y > 134 || this.x < 34 || this.x > 285) {
            this.owner.bullet = false;
            return
        }
        for (var t = 0; t < game.innerWalls.length; t++) {
            var u = game.innerWalls[t];
            if (u.col == this.col && UTIL.collision(this.x, this.y, 2, 8, u.x, u.y, u.w, u.h)) {
                this.owner.bullet = false;
                return
            }
            if (u.row == this.row && UTIL.collision(this.x, this.y, 8, 2, u.x, u.y, u.w, u.h)) {
                this.owner.bullet = false;
                return
            }
        }
    }
}

function WizardOfWorMonster(e) {
    this.type = e;
    this.status = "alive";
    var t = game.getFreeCoordinate();
    this.col = t.col;
    this.row = t.row;
    this.x;
    this.y;
    this.d = "up";
    this.visible = true;
    this.animationSequence = 0;
    this.bullet = false;
    this.frameCounters = {
        shooted: 0
    };
    this.path = {
        primary: "up",
        secondary: "right",
        len: 0,
        steps: 0,
        inMoving: false,
        inMovingPixels: 0,
        diagonal: false
    };
    this.calcPositionByCoordinates = function () {
        this.x = 34 + (this.col - 1) * 24;
        this.y = 3 + (this.row - 1) * 24
    };
    this.calcPositionByCoordinates();
    this.getCol = function () {
        var e = this.getLine();
        if (e == "both" || e == "col") return (this.x - 34) / 24 + 1;
        else return Math.round((this.x - 34) / 24) + 1
    };
    this.getRow = function () {
        var e = this.getLine();
        if (e == "both" || e == "row") return (this.y - 3) / 24 + 1;
        else return Math.round((this.y - 3) / 24) + 1
    };
    this.getLine = function () {
        var e = (this.x - 34) % 24 === 0 ? true : false;
        var t = (this.y - 3) % 24 === 0 ? true : false;
        if (e && t) return "both";
        else if (!e && t) return "row";
        else if (e && !t) return "col"
    };
    this.isHiddenable = function () {
        if (this.status != "alive") return false;
        if (this.type == "burwor" || this.type == "worluk" || this.type == "wizardOfWor") return false;
        for (var e = 0; e < 2; e++) {
            if (game.players[e].status != "out") {
                if (game.players[e].x - 24 < this.x && game.players[e].x + 24 > this.x) return false;
                if (game.players[e].y - 24 < this.y && game.players[e].y + 24 > this.y) return false
            }
        }
        return true
    };
    this.generatePath = function () {
        this.path.primary = DATA.directions[UTIL.rnd(4) - 1];
        if (this.path.primary == "up" || this.path.primary == "down") this.path.secondary = ["left", "right"][UTIL.rnd(2) - 1];
        else this.path.secondary = ["up", "down"][UTIL.rnd(2) - 1];
        this.path.len = UTIL.rnd(14) + 2;
        this.path.steps = 0;
        this.path.inMoving = false;
        this.path.inMovingPixels = 0;
        this.path.diagonal = UTIL.rnd(3) != 1 ? true : false;
        if (this.visible && UTIL.rnd(11) == 1 && this.isHiddenable()) this.visible = false
    };
    this.animationRoutine = function () {
        if (this.status == "died" || this.status == "escaped" || !this.visible || game.scene != "dungeon") return false;
        var e = 0;
        if (this.animationSequence > 8) e = 1;
        else if (this.animationSequence > 2 && this.animationSequence < 6) e = 2;
        if (this.status == "shooted") var t = DATA.sprite.hit[Math.floor(UTIL.getAFC() % 48 / 3)];
        else if (this.type == "worluk") var t = DATA.sprite[this.type][e];
        else var t = DATA.sprite[this.type][this.d][e];
        UTIL.draw(t.x, t.y, 18, 18, this.x, this.y)
    };
    this.scanRoutine = function () {
        if (this.status == "died") return;
        else if (this.status == "shooted") {
            this.frameCounters.shooted++;
            if (this.frameCounters.shooted == 1) {
                this.visible = true;
                this.bullet = false;
                if (this.type == "worluk" || this.type == "wizardOfWor") {
                    engine.audio.stop("Worluk");
                    this.frameCounters.shooted = 20
                } else {
                    engine.audio.request({
                        name: "Shooted"
                    })
                }
            }
            if (this.frameCounters.shooted >= 20) game.killMonster(this)
        } else if (this.status == "escaped") {
            this.status = "died"
        } else if (this.status == "alive") {
            if (this.type == "wizardOfWor" && this.path.steps >= 3 && UTIL.rnd(14) == 1) {
                var e = game.getFreeCoordinate();
                this.col = e.col;
                this.row = e.row;
                this.calcPositionByCoordinates();
                this.path.inMoving = false;
                this.path.steps = 0;
                this.path.len = 0
            }
            if (this.path.steps >= this.path.len) this.generatePath();
            var t = this.col;
            var n = this.row;
            var r = this.col;
            var i = this.row;
            if (!this.path.inMoving) {
                this.path.inMoving = true;
                this.path.inMovingPixels = 0;
                if (this.path.diagonal) {
                    var s = this.path.primary;
                    this.path.primary = this.path.secondary;
                    this.path.secondary = s
                }
                switch (this.path.primary) {
                case "up":
                    i = n - 1;
                    break;
                case "right":
                    r = t + 1;
                    break;
                case "down":
                    i = n + 1;
                    break;
                case "left":
                    r = t - 1;
                    break
                }
                if (game.innerWallCollision(t, n, this.path.primary)) {
                    i = n;
                    r = t
                }
                if (r < 1 || r > 11) r = t;
                if (i < 1 || i > 6) i = n;
                if (i == n && r == t) {
                    switch (this.path.secondary) {
                    case "up":
                        i = n - 1;
                        break;
                    case "right":
                        r = t + 1;
                        break;
                    case "down":
                        i = n + 1;
                        break;
                    case "left":
                        r = t - 1;
                        break
                    }
                    if (game.innerWallCollision(t, n, this.path.secondary)) {
                        i = n;
                        r = t
                    }
                    if (r < 1 || r > 11) r = t;
                    if (i < 1 || i > 6) i = n;
                    if (i == n && r == t) {
                        this.path.inMoving = false;
                        this.path.steps = 0;
                        this.path.len = 0
                    } else {
                        this.d = this.path.secondary
                    }
                } else {
                    this.d = this.path.primary
                } if (!this.bullet && this.visible && this.path.inMoving && this.type != "worluk") {
                    if (this.type == "wizardOfWor" && UTIL.rnd(4) == 1 || UTIL.rnd(15) == 1) {
                        engine.audio.request({
                            name: "EnemyFire"
                        });
                        this.bullet = new WizardOfWorBullet(this, this.d == "left" ? this.x : this.x + 9, this.d == "up" ? this.y : this.y + 9, this.d)
                    }
                }
            }
            if (this.path.inMoving) {
                var o = 0;
                if (game.speed % 4 == 1 && UTIL.getSFC() % 4 < 1 || game.speed % 4 == 2 && UTIL.getSFC() % 4 < 2 || game.speed % 4 == 3 && UTIL.getSFC() % 4 < 3) o = 1;
                var u = Math.floor(game.speed / 4) + o;
                if (u > 0) {
                    this.animationSequence++;
                    if (u >= 3) this.animationSequence++;
                    if (this.animationSequence > 11) this.animationSequence = 0
                }
                this.path.inMovingPixels += u;
                if (this.path.inMovingPixels > 24) u = u - (this.path.inMovingPixels - 24);
                switch (this.d) {
                case "up":
                    this.y -= u;
                    break;
                case "right":
                    this.x += u;
                    break;
                case "down":
                    this.y += u;
                    break;
                case "left":
                    this.x -= u;
                    break
                }
                if (this.path.inMovingPixels >= 24) {
                    var a = this.getLine();
                    if (a == "both" || a == "row") this.row = this.getRow();
                    if (a == "both" || a == "col") this.col = this.getCol();
                    this.path.steps++;
                    this.path.inMoving = false;
                    if (this.row == 3 && (this.col == 1 || this.col == 11) && game.teleportStatus == "open") {
                        if (this.type == "worluk") {
                            this.status = "escaped";
                            game.doubleScoreNext = false;
                            engine.audio.stop("Worluk");
                            engine.audio.request({
                                name: "WorlukEscape"
                            });
                            game.radarText = "MEGLOGOTT";
                            this.radarTextColor = 7;
                            game.closeTeleport(0);
                            game.frameCounters.worlukEscaped = 1.8 * engine.scanFPS
                        } else {
                            if (UTIL.rnd(2) == 1) {
                                this.col = this.col == 11 ? 1 : 11;
                                this.calcPositionByCoordinates();
                                this.path.inMoving = false;
                                this.path.steps = 0;
                                this.path.len = 0;
                                if (this.type !== "wizardOfWor") game.closeTeleport(13);
                                engine.audio.request({
                                    name: "Teleport"
                                })
                            }
                        }
                    }
                }
            }
            if (!this.visible && !this.isHiddenable()) {
                engine.audio.request({
                    name: "Visible"
                });
                this.visible = true
            }
        }
    }
}

function WizardOfWorPlayer(e) {
    this.type = "player";
    this.num = e;
    this.score = 0;
    this.lives = 3;
    this.status = "wait";
    this.col = e == 1 ? 1 : 11;
    this.row = 6;
    this.x;
    this.y;
    this.d = e == 1 ? "right" : "left";
    this.animationSequence = 3;
    this.bullet = false;
    this.frameCounters = {
        justShoot: 0,
        entering: 0,
        dead: 0
    };
    this.calcPositionByCoordinates = function () {
        this.x = (this.col - 1) * 24 + 34;
        this.y = 147
    };
    this.calcPositionByCoordinates();
    this.getCol = function () {
        var e = this.getLine();
        if (e == "both" || e == "col") return (this.x - 34) / 24 + 1;
        else return Math.round((this.x - 34) / 24) + 1
    };
    this.getRow = function () {
        var e = this.getLine();
        if (e == "both" || e == "row") return (this.y - 3) / 24 + 1;
        else return Math.round((this.y - 3) / 24) + 1
    };
    this.getLine = function () {
        var e = (this.x - 34) % 24 === 0 ? true : false;
        var t = (this.y - 3) % 24 === 0 ? true : false;
        if (e && t) return "both";
        else if (!e && t) return "row";
        else if (e && !t) return "col"
    };
    this.goToStartPosition = function () {
        this.status = "wait";
        this.col = this.num == 1 ? 1 : 11;
        this.row = 6;
        this.calcPositionByCoordinates();
        this.d = this.num == 1 ? "right" : "left";
        this.animationSequence = 3;
        this.frameCounters = {
            entering: 10 * engine.scanFPS,
            justShoot: 0,
            dead: 0
        };
        this.bullet = false
    };
    this.animationRoutine = function () {
        if (game.scene != "dungeon") return;
        var e = 0;
        if (this.animationSequence > 8) e = 1;
        else if (this.animationSequence > 2 && this.animationSequence < 6) e = 2;
        if (this.status == "wait" || this.status == "out" || game.frameCounters.wizardEscaped > 0) return false;
        else if (this.status == "dead") {
            if (this.frameCounters.dead < .8 * engine.scanFPS) {
                if (this.d == "left" || this.d == "right") var t = DATA.sprite.players[this.frameCounters.dead % 10 > 5 ? 0 : 1][this.d][e];
                else {
                    if (this.frameCounters.dead % 10 > 5) var t = DATA.sprite.players[this.num][this.d][e];
                    else var t = DATA.sprite.players[this.num].death[this.d][e]
                }
            } else var t = DATA.sprite.hit[this.frameCounters.dead % 8]
        } else {
            var t = DATA.sprite.players[this.num];
            if (this.frameCounters.justShoot > 0) t = t.shoot[this.d];
            else t = t[this.d][e]
        }
        UTIL.draw(t.x, t.y, 18, 18, this.x, this.y)
    };
    this.scanRoutine = function () {
        if (this.status == "out") return false;
        else if (this.status == "dead") {
            this.frameCounters.dead++;
            if (this.frameCounters.dead == 1) this.bullet = false;
            if (this.frameCounters.dead > 2 * engine.scanFPS) {
                this.lives--;
                if (this.lives < 1) {
                    this.status = "out";
                    if (game.players[0].status == "out" && game.players[1].status == "out") {
                        game.gameOver();
                        return
                    }
                } else {
                    this.goToStartPosition();
                    return
                }
            } else if (game.afterWorluk() && this.frameCounters.dead >= .8 * engine.scanFPS) this.frameCounters.dead = 2 * engine.scanFPS
        } else if (this.status == "wait") {
            this.frameCounters.entering--;
            var e = engine.pressedKeys[DATA.keys[this.num].up] === true;
            if (e || this.frameCounters.entering <= 1 * engine.scanFPS) {
                this.frameCounters.entering = 0;
                this.status = "enter";
                engine.audio.request({
                    name: "Enter"
                })
            }
        } else if (this.status == "enter") {
            this.y -= 2;
            if (this.getLine() == "both" && this.getRow() == 6) this.status = "alive"
        } else if (this.status == "alive") {
            var t = DATA.keys[this.num];
            var e = engine.pressedKeys[t.up] === true;
            var n = engine.pressedKeys[t.down] === true;
            var r = engine.pressedKeys[t.right] === true;
            var i = engine.pressedKeys[t.left] === true;
            var s = engine.pressedKeys[t.fire] === true;
            for (var o = 0; o < game.monsters.length; o++) {
                var u = game.monsters[o];
                if (u.status == "alive" && UTIL.collision(u.x + 3, u.y + 3, 12, 12, this.x + 3, this.y + 3, 12, 12)) {
                    if (u.type == "wizardOfWor") {
                        game.radarText = "ELMENEKULT";
                        u.status = "died";
                        engine.audio.request({
                            name: "WizardEscape"
                        });
                        game.frameCounters.wizardEscaped = 4.4 * engine.scanFPS;
                        this.lives--;
                        game.closeTeleport(0)
                    } else {
                        this.status = "dead";
                        engine.audio.request({
                            name: "Death"
                        });
                        return
                    }
                }
            }
            if (this.frameCounters.justShoot > 0) {
                this.frameCounters.justShoot--;
                return
            }
            var a = this.getLine();
            var f = false;
            if (e) f = "up";
            else if (n) f = "down";
            else if (r) f = "right";
            else if (i) f = "left";
            if (f) {
                if (game.teleportStatus == "open" && a == "both" && this.row == 3) {
                    if (this.x >= 274 && (f == "right" || f == "down" && this.d == "right" && game.innerWallCollision(this.col, this.row, "down"))) {
                        this.d = "right";
                        this.col = 1;
                        this.x = 34;
                        engine.audio.request({
                            name: "Teleport"
                        });
                        if (!game.afterWorluk()) game.closeTeleport(13);
                        return
                    } else if (this.x <= 34 && (f == "left" || f == "down" && this.d == "left" && game.innerWallCollision(this.col, this.row, "down"))) {
                        this.d = "left";
                        this.col = 11;
                        this.x = 274;
                        engine.audio.request({
                            name: "Teleport"
                        });
                        if (!game.afterWorluk()) game.closeTeleport(13);
                        return
                    }
                }
                if (a == "both") {
                    if (f == "up" && !game.innerWallCollision(this.col, this.row, "up") && this.y > 3) this.d = "up";
                    else if (f == "right" && !game.innerWallCollision(this.col, this.row, "right") && this.x < 274) this.d = "right";
                    else if (f == "down" && !game.innerWallCollision(this.col, this.row, "down") && this.y < 123) this.d = "down";
                    else if (f == "left" && !game.innerWallCollision(this.col, this.row, "left") && this.x > 34) this.d = "left"
                } else {
                    if (this.d == "up" && f == "down") this.d = "down";
                    else if (this.d == "down" && f == "up") this.d = "up";
                    else if (this.d == "right" && f == "left") this.d = "left";
                    else if (this.d == "left" && f == "right") this.d = "right"
                }
                var l = true;
                if (this.d == "up" && (!game.innerWallCollision(this.col, this.row, "up") || a !== "both") && this.y > 3) this.y -= 2;
                else if (this.d == "right" && (!game.innerWallCollision(this.col, this.row, "right") || a !== "both") && this.x < 274) this.x += 2;
                else if (this.d == "down" && (!game.innerWallCollision(this.col, this.row, "down") || a !== "both") && this.y < 123) this.y += 2;
                else if (this.d == "left" && (!game.innerWallCollision(this.col, this.row, "left") || a !== "both") && this.x > 34) this.x -= 2;
                else l = false; if (l) {
                    a = this.getLine();
                    if (a == "both" || a == "col") this.col = this.getCol();
                    if (a == "both" || a == "row") this.row = this.getRow();
                    this.animationSequence += 1;
                    if (this.animationSequence > 11) this.animationSequence = 0
                }
            }
            if (s && !this.bullet) {
                var c, h;
                var p = true;
                if (this.d == "up" && (!game.innerWallCollision(this.col, this.row, "up") || a !== "both") && this.y > 3) {
                    c = this.x + 9;
                    h = this.y
                } else if (this.d == "right" && (!game.innerWallCollision(this.col, this.row, "right") || a !== "both") && this.x < 274) {
                    c = this.x + 9;
                    h = this.y + 8
                } else if (this.d == "down" && (!game.innerWallCollision(this.col, this.row, "down") || a !== "both") && this.y < 123) {
                    c = this.x + 9;
                    h = this.y + 9
                } else if (this.d == "left" && (!game.innerWallCollision(this.col, this.row, "left") || a !== "both") && this.x > 34) {
                    c = this.x;
                    h = this.y + 8
                } else p = false; if (p) {
                    engine.audio.request({
                        name: "Fire"
                    });
                    this.bullet = new WizardOfWorBullet(this, c, h, this.d);
                    this.frameCounters.justShoot = Math.floor(.1 * engine.scanFPS);
                    engine.pressedKeys[DATA.keys[this.num].fire] = "hold"
                }
            }
        }
    }
}

function WizardOfWorGame() {
    this.scene = "title";
    this.level = 0;
    this.speed = 1;
    this.speedSoundTempo = 1;
    this.numOfPlayers = 2;
    this.doubleScoreNow = false;
    this.doubleScoreNext = false;
    this.killedMonsters = 0;
    this.killedBurwors = 0;
    this.killedThorwors = 0;
    this.wallsH = [];
    this.wallsV = [];
    this.wallType = "blue";
    this.teleportStatus = "open";
    this.dungeonType = "easy";
    this.dungeonNumber = -1;
    this.innerWalls = [];
    this.radarText = "RADAR";
    this.radarTextColor = 2;
    this.players = [];
    this.monsters = [];
    this.bgColor = 0;
    this.frameCounters = {
        dungeon: 0,
        title: 0,
        getReady: 0,
        doubleScore: 0,
        teleport: 0,
        teleportOpenDelay: 0,
        worlukDeathAnimation: 0,
        worlukEscaped: 0,
        wizardDeathAnimation: 0,
        wizardEscaped: 0,
        gameOver: 0
    };
    this.startNewGame = function (e) {
        this.level = 0;
        this.speed = 1;
        this.speedSoundTempo = 1;
        this.numOfPlayers = e;
        this.doubleScoreNow = false;
        this.doubleScoreNext = false;
        this.dungeonType = "easy";
        this.dungeonNumber = -1;
        this.players = [];
        for (var t = 0; t < 2; t++) this.players[t] = new WizardOfWorPlayer(t);
        if (e == 1) {
            this.players[1].status = "out";
            this.players[1].lives = 0
        }
        for (var t in this.frameCounters) this.frameCounters[t] = 0;
        this.scene = "getReady"
    };
    this.showTouchNavigation = function () {
        if (engine.platform != "mobile") return;
        document.getElementById("touchControlFire")
            .setAttribute("class", "");
        document.getElementById("touchControlMove")
            .setAttribute("class", "")
    };
    this.hideTouchNavigation = function () {
        if (engine.platform != "mobile") return;
        document.getElementById("touchControlFire")
            .setAttribute("class", "hide");
        document.getElementById("touchControlMove")
            .setAttribute("class", "hide")
    };
    this.nextDungeon = function () {
        this.level++;
        if (this.level > 20) UTIL.analyticsEvent("game", "highLevel", this.level.toString());
        this.dungeonType = this.level <= 7 ? "easy" : "hard";
        if (this.level == 4 || this.level >= 13 && (this.level - 13) % 6 == 0) this.dungeonType = "fix";
        if (this.dungeonType == "easy") {
            do {
                var e = UTIL.rnd(12) - 1
            } while (e == this.dungeonNumber)
        } else if (this.dungeonType == "hard") {
            do {
                var e = UTIL.rnd(8) - 1
            } while (e == this.dungeonNumber)
        } else if (this.dungeonType == "fix") var e = this.level == 4 ? 0 : 1;
        this.dungeonNumber = e;
        this.speed = this.level;
        if (this.speed > 14) this.speed = 14;
        this.speedSoundTempo = Math.round(this.speed / 2);
        if (this.speedSoundTempo > 7) this.speedSoundTempo = 7;
        engine.audio.request({
            name: "Speed" + this.speedSoundTempo,
            loop: true
        });
        this.parseDungeon();
        this.killedMonsters = 0;
        this.killedBurwors = 0;
        this.killedThorwors = 0;
        this.monsters = [];
        for (var t = 0; t < 6; t++) this.monsters[t] = new WizardOfWorMonster("burwor");
        this.doubleScoreNow = this.doubleScoreNext ? true : false;
        this.doubleScoreNext = false;
        for (var t = 0; t < 2; t++)
            if (game.players[t].status != "out") game.players[t].goToStartPosition();
        if (this.level == 1) this.radarText = "RADAR";
        else if (this.level == 4) this.radarText = "AZ ARENA";
        else if (this.level == 13) this.radarText = "A VEREM";
        else {
            this.radarText = "SZINT  ";
            if (this.level < 10) this.radarText += " ";
            this.radarText += this.level.toString()
        }
        this.radarTextColor = 2;
        this.openTeleport();
        this.showTouchNavigation();
        this.wallType = "blue";
        this.frameCounters.dungeon = 0;
        this.scene = "dungeon"
    };
    this.parseDungeon = function () {
        var e = DATA.dungeons[this.dungeonType][this.dungeonNumber].split("|");
        this.wallsH = e[0].split(",");
        this.wallsV = e[1].split(",");
        this.innerWalls = [];
        for (var t = 0; this.wallsH[t]; t++) {
            var n = this.wallsH[t].split("x");
            var r = n[0];
            var i = n[1];
            var e = {
                type: "h",
                col: r,
                row: i,
                x: 31 + (r - 1) * 24,
                y: i * 24 - 2,
                w: 24,
                h: 4
            };
            this.innerWalls.push(e)
        }
        for (var t = 0; this.wallsV[t]; t++) {
            var n = this.wallsV[t].split("x");
            var r = n[0];
            var i = n[1];
            var e = {
                type: "v",
                col: r,
                row: i,
                x: 29 + r * 24,
                y: (i - 1) * 24,
                w: 4,
                h: 24
            };
            this.innerWalls.push(e)
        }
    };
    this.getFreeCoordinate = function () {
        do {
            var e = UTIL.rnd(11);
            var t = UTIL.rnd(6);
            var n = true;
            for (var r = e - 2; r <= e + 2; r++) {
                for (var i = t - 2; i <= t + 2; i++) {
                    if ((r == 1 || r == 11) && i == 3) n = false;
                    for (var s = 0; s < 2; s++)
                        if (this.players[s].status != "out" && this.players[s].col == r && this.players[s].row == i) n = false
                }
            }
        } while (!n);
        return {
            col: e,
            row: t
        }
    };
    this.innerWallCollision = function (e, t, n) {
        if (n == "up" || n == "down") {
            for (var r = 0; r < this.wallsH.length; r++) {
                var i = this.wallsH[r].split("x");
                if (n == "up" && e == i[0] && t - 1 == i[1]) return true;
                if (n == "down" && e == i[0] && t == i[1]) return true
            }
        }
        if (n == "right" || n == "left") {
            for (var r = 0; r < this.wallsV.length; r++) {
                var i = this.wallsV[r].split("x");
                if (n == "right" && t == i[1] && e == i[0]) return true;
                if (n == "left" && t == i[1] && e - 1 == i[0]) return true
            }
        }
        return false
    };
    this.displayScore = function (e, t) {
        if (e == 1) {
            UTIL.rect(239, 168, 80, 8, 7);
            UTIL.rect(239, 192, 80, 8, 7);
            UTIL.rect(239, 176, 8, 16, 7);
            UTIL.rect(311, 176, 8, 16, 7);
            UTIL.drawText(UTIL.rightAlignedText(t, 38), 0, 189, 7)
        } else if (e == 2) {
            UTIL.rect(7, 168, 80, 8, 6);
            UTIL.rect(7, 192, 80, 8, 6);
            UTIL.rect(7, 176, 8, 16, 6);
            UTIL.rect(79, 176, 8, 16, 6);
            UTIL.drawText(UTIL.rightAlignedText(t, 9), 0, 189, 6)
        }
    };
    this.killMonster = function (e) {
        this.killedMonsters++;
        e.status = "died";
        if (this.killedMonsters % 4 == 0 && this.speed < 16) this.speedUp();
        if (e.type == "burwor") {
            this.killedBurwors++;
            if (this.killedBurwors >= 7 - this.level) {
                game.monsters.push(new WizardOfWorMonster("garwor"))
            }
        } else if (e.type == "garwor") {
            game.monsters.push(new WizardOfWorMonster("thorwor"))
        } else if (e.type == "thorwor") {
            this.killedThorwors++;
            var t = 6;
            if (this.level < 6) t = 6 - (6 - this.level);
            if (this.killedThorwors >= t) {
                if (this.level == 1) this.endDungeon();
                else {
                    this.closeTeleport(5);
                    game.monsters.push(new WizardOfWorMonster("worluk"));
                    this.radarText = " WORLUK";
                    this.radarTextColor = 7;
                    this.speed = 16;
                    this.wallType = "worluk";
                    engine.audio.stopAllSound();
                    engine.audio.request({
                        name: "Worluk",
                        loop: true
                    })
                }
            }
        } else if (e.type == "worluk") {
            this.doubleScoreNext = true;
            this.radarText = "DUPLA  PONTSZAM";
            this.radarTextColor = 7;
            engine.audio.stop("Worluk");
            engine.audio.request({
                name: "WorlukDeath"
            });
            if (this.wizardOfWor()) {} else {
                this.wallType = "red";
                this.frameCounters.worlukDeathAnimation = 4.4 * engine.scanFPS;
                this.closeTeleport(0)
            }
        } else if (e.type == "wizardOfWor") {
            this.doubleScoreNext = true;
            this.radarText = "DUPLA  PONTSZAM";
            this.radarTextColor = 7;
            this.wallType = "wizardOfWor";
            engine.audio.request({
                name: "WizardDeath"
            });
            this.frameCounters.wizardDeathAnimation = 5 * engine.scanFPS
        }
    };
    this.closeTeleport = function (e) {
        this.teleportStatus = "close";
        this.frameCounters.teleport = 0;
        this.frameCounters.teleportOpenDelay = e * engine.scanFPS
    };
    this.openTeleport = function () {
        this.teleportStatus = "open";
        this.frameCounters.teleport = 0;
        this.frameCounters.teleportOpenDelay = 0
    };
    this.afterWorluk = function () {
        for (var e = 0; e < this.monsters.length; e++)
            if (this.monsters[e].type == "worluk") return true;
        return false
    };
    this.wizardOfWor = function () {
        if (UTIL.rnd(7) == 1 && this.level >= 3) {
            this.speed = 16;
            this.wallType = "blue";
            this.openTeleport();
            this.radarText = "Wor a Varazslo";
            this.radarTextColor = 7;
            game.monsters.push(new WizardOfWorMonster("wizardOfWor"));
            return true
        } else {
            return false
        }
    };
    this.endDungeon = function (e) {
        engine.audio.stopAllSound();
        if (this.level > 6) this.radarText = "CSATALORD";
        this.hideTouchNavigation();
        this.frameCounters.getReady = 0;
        this.scene = "getReady"
    };
    this.subscribeToToplist = function (e) {
        if (!e) return false;
        for (i = 5; i >= 1; i--) {
            pts = engine.options.highScores[i - 1];
            if (e >= pts) {
                engine.options.highScores[i] = pts;
                if (i == 1) engine.options.highScores[0] = e
            } else {
                engine.options.highScores[i] = e;
                break
            }
        }
        engine.options.highScores[5] = null;
        engine.options.highScores.pop();
        localStorage.setItem("highScores", engine.options.highScores.join(","))
    };
    this.refreshPressedKeysByGamepad = function () {
        if (!navigator.webkitGetGamepads) return;
        var e = 0;
        if (engine.options.p1controls == "gamepad") e++;
        if (engine.options.p2controls == "gamepad") e++;
        if (!e) return;
        for (var t = 0; t < e; t++) {
            var n = navigator.webkitGetGamepads()[t];
            if (n !== undefined) {
                var r = n.buttons;
                var i = n.axes;
                var s = false;
                if (e == 1 && engine.options.p1controls == "gamepad") s = DATA.keys[0];
                else if (e == 1 && engine.options.p2controls == "gamepad") s = DATA.keys[1];
                else if (e == 2) s = DATA.keys[t];
                var o = r && (r[0] || r[1] || r[2] || r[3]);
                if (o && engine.pressedKeys[s.fire] !== "hold") engine.pressedKeys[s.fire] = true;
                else if (!o) engine.pressedKeys[s.fire] = false;
                var u = r && r[12] || i && i[1] < -.5;
                if (u && engine.pressedKeys[s.up] !== "hold") engine.pressedKeys[s.up] = true;
                else if (!u) engine.pressedKeys[s.up] = false;
                var a = r && r[13] || i && i[1] > .5;
                if (a && engine.pressedKeys[s.down] !== "hold") engine.pressedKeys[s.down] = true;
                else if (!a) engine.pressedKeys[s.down] = false;
                var f = r && r[14] || i && i[0] < -.5;
                if (f && engine.pressedKeys[s.left] !== "hold") engine.pressedKeys[s.left] = true;
                else if (!f) engine.pressedKeys[s.left] = false;
                var l = r && r[15] || i && i[0] > .5;
                if (l && engine.pressedKeys[s.right] !== "hold") engine.pressedKeys[s.right] = true;
                else if (!l) engine.pressedKeys[s.right] = false
            }
        }
    };
    this.animationRoutine = function () {
        if (this.scene == "title") this.animateTitle();
        else if (this.scene == "enemyRoster") this.animateEnemyRoster();
        else if (this.scene == "options") this.animateOptions();
        else if (this.scene == "getReady") this.animateGetReady();
        else if (this.scene == "doubleScore") this.animateDoubleScore();
        else if (this.scene == "dungeon") this.animateDungeon();
        else if (this.scene == "gameOver") this.animateGameOver()
    };
    this.scanRoutine = function () {
        if (engine.pressedKeys[27] === true) {
            this.players[0].score = 0;
            this.players[1].score = 0;
            engine.audio.stopAllSound();
            this.hideTouchNavigation();
            this.frameCounters.title = 0;
            this.scene = "title";
            return
        }
        this.refreshPressedKeysByGamepad();
        if (engine.click.x !== false) {
            this.scanMouseEvents(engine.click.x, engine.click.y, engine.click.btn);
            for (var e in engine.click) engine.click[e] = false
        }
        if (this.scene == "title" || this.scene == "enemyRoster") this.scanTitle();
        else if (this.scene == "getReady") this.scanGetReady();
        else if (this.scene == "doubleScore") this.scanDoubleScore();
        else if (this.scene == "dungeon") this.scanDungeon();
        else if (this.scene == "gameOver") this.scanGameOver()
    };
    this.animateTitle = function () {
        UTIL.cls();
        UTIL.drawText("    Wizard Of Wor HTML5", 79, 21, 14);
        UTIL.drawText("Chrome alat van hang is!", 95, 37, 14);
        UTIL.drawText("Rekord pontszamok", 119, 61, 10);
        for (var e = 0; e < 5; e++) {
            UTIL.drawText(UTIL.rightAlignedText(engine.options.highScores[e], 23), 0, 85 + e * 16, 14)
        }
        UTIL.drawText("BEALLITASOK", 119, 189, 10);
        this.displayScore(1, game.players[0] ? game.players[0].score : 0);
        this.displayScore(2, game.players[1] ? game.players[1].score : 0)
    };
    this.animateEnemyRoster = function () {
        UTIL.cls();
        UTIL.drawText("Burwor      100  pont", 71, 21, 14);
        UTIL.drawText("Garwor      200  pont", 71, 45, 7);
        UTIL.drawText("Thorwor      500  pont", 63, 69, 10);
        UTIL.drawText("Harcos      1000  pont", 63, 93, 14);
        UTIL.drawText("Harcos      1000  pont", 63, 117, 7);
        UTIL.drawText("Csatalord   1000  pont", 71, 141, 10);
        UTIL.drawText("Dupla Pontszam", 159, 157, 10);
        UTIL.drawText("Wor a Varazslo     2500  pont", 15, 181, 7);
        var e = DATA.sprite.burwor.left[2];
        UTIL.draw(e.x, e.y, 18, 18, 130, 6);
        var e = DATA.sprite.garwor.left[1];
        UTIL.draw(e.x, e.y, 18, 18, 129, 30);
        var e = DATA.sprite.thorwor.left[0];
        UTIL.draw(e.x, e.y, 18, 18, 130, 54);
        var e = DATA.sprite.enemyRosterPlayer2;
        UTIL.draw(e.x, e.y, 18, 18, 130, 78);
        var e = DATA.sprite.players[0].left[2];
        UTIL.draw(e.x, e.y, 18, 18, 130, 102);
        var e = DATA.sprite.worluk[0];
        UTIL.draw(e.x, e.y, 18, 18, 129, 126);
        var e = DATA.sprite.wizardOfWor.left[2];
        UTIL.draw(e.x, e.y, 18, 18, 130, 166)
    };
    this.animateOptions = function () {
        UTIL.cls();
        if (engine.options.sound === "on") UTIL.rect(110, 15, 58, -16, 7);
        else UTIL.rect(190, 15, 66, -16, 7);
        UTIL.drawText("HANG:", 48, 13, 10);
        var e = 11;
        if (engine.audio.context) e = engine.options.sound == "on" ? 6 : 14;
        UTIL.drawText("be", 111, 13, e);
        UTIL.drawText("ki", 191, 13, engine.options.sound == "off" ? 6 : 14);
        if (engine.platform == "desktop") {
            if (engine.options.display === "window") UTIL.rect(110, 39, 58, -16, 7);
            else UTIL.rect(190, 39, 82, -16, 7);
            UTIL.drawText("KEPERNYO:", 32, 37, 10);
            UTIL.drawText("Ablakos", 111, 37, engine.options.display == "window" ? 6 : 14);
            UTIL.drawText("Teljes kepernyo", 191, 37, engine.options.display == "fullscreen" ? 6 : 14)
        }
        if (engine.options.p1controls === "gamepad" || engine.options.p1controls == "touch") UTIL.rect(110, 65, 58, -16, 7);
        else UTIL.rect(190, 65, 66, -16, 7);
        UTIL.drawText("P1 iranyitas:", 0, 63, 10);
        if (engine.platform == "desktop") {
            var e = 11;
            if (navigator.webkitGetGamepads) e = engine.options.p1controls == "gamepad" ? 6 : 14;
            UTIL.drawText("gamepad", 111, 63, e);
            UTIL.drawText("billenty", 191, 63, engine.options.p1controls == "keyboard" ? 6 : 14);
            if (!navigator.webkitGetGamepads) UTIL.drawText("[N/A]", 111, 77, 12);
            UTIL.drawText("[NYILAK+ENTER]", 191, 77, 12)
        } else {
            UTIL.drawText("touch", 111, 63, engine.options.p1controls == "touch" ? 6 : 14)
        } if (engine.options.p2controls === "gamepad") UTIL.rect(110, 99, 58, -16, 7);
        else if (engine.options.p2controls === "keyboard") UTIL.rect(190, 99, 66, -16, 7);
        UTIL.drawText("P2 iranyitas:", 0, 97, 10);
        if (engine.platform == "desktop") {
            var e = 11;
            if (navigator.webkitGetGamepads) e = engine.options.p2controls == "gamepad" ? 6 : 14;
            UTIL.drawText("gamepad", 111, 97, e);
            UTIL.drawText("billenty", 191, 97, engine.options.p2controls == "keyboard" ? 6 : 14);
            if (!navigator.webkitGetGamepads) UTIL.drawText("[N/A]", 111, 111, 12);
            UTIL.drawText("[WASD+SHIFT]", 191, 111, 12)
        } else {
            UTIL.drawText("N/A [csak asztal]", 111, 97, 12)
        }

        UTIL.drawText("", 0, 149, 14);
        UTIL.drawText("", 191, 149, 6);
        UTIL.rect(108, 200, 108, -14, 10);
        UTIL.drawText("MENTES/VISSZA", 111, 198, 0)
    };
    this.animateGetReady = function () {
        if (game.level == 0) UTIL.cls();
        else this.animateDungeon();
        for (var e = 0; e < 3; e++) UTIL.rect(31 + e * 32, 48, 24, 40, 0);
        for (var e = 0; e < 5; e++) UTIL.rect(143 + e * 32, 48, 24, 40, 0);
        var t = DATA.sprite.texts.get;
        UTIL.draw(t.x, t.y, t.w, t.h, 31, 50);
        var t = DATA.sprite.texts.ready;
        UTIL.draw(t.x, t.y, t.w, t.h, 143, 50);
        if (this.frameCounters.getReady > 35) {
            UTIL.rect(135, 96, 24, 40, 0);
            UTIL.rect(167, 96, 24, 40, 0);
            var t = DATA.sprite.texts.go;
            UTIL.draw(t.x, t.y, t.w, t.h, 135, 98)
        }
    };
    this.animateGameOver = function () {
        this.animateDungeon();
        for (var e = 0; e < 4; e++) UTIL.rect(23 + e * 32, 56, 24, 40, 0);
        for (var e = 0; e < 4; e++) UTIL.rect(191 + e * 32, 56, 24, 40, 0);
        var t = DATA.sprite.texts.game;
        UTIL.draw(t.x, t.y, t.w, t.h, 23, 58);
        var t = DATA.sprite.texts.over;
        UTIL.draw(t.x, t.y, t.w, t.h, 191, 58)
    };
    this.animateDoubleScore = function () {
        UTIL.cls();
        if (this.doubleScoreNext) {
            var e = DATA.sprite.texts["double"];
            UTIL.draw(e.x, e.y, e.w, e.h, 71, 2);
            var e = DATA.sprite.texts.score;
            UTIL.draw(e.x, e.y, e.w, e.h, 87, 50);
            var e = DATA.sprite.texts.dungeon;
            UTIL.draw(e.x, e.y, e.w, e.h, 55, 98)
        }
        if (this.level == 3 || this.level == 12) {
            UTIL.drawText("BONUSZ JATEKOS", 110, 173, 7);
            if (game.players[0].status != "out") {
                var e = DATA.sprite.players[0].left[2];
                UTIL.draw(e.x, e.y, 18, 18, 235, 164)
            }
            if (game.players[1].status != "out") {
                var e = DATA.sprite.players[1].right[2];
                UTIL.draw(e.x, e.y, 18, 18, 73, 164)
            }
        }
    };
    this.animateDungeon = function () {
        UTIL.rect(0, 0, 320, 200, this.bgColor);
        if (this.wallType == "wizardOfWor" && UTIL.getAFC() % 40 > 30) return;
        var e = DATA.sprite.walls[this.wallType];
        var t;
        var n;
        var r = this.wallType == "worluk" && (this.frameCounters.worlukEscaped > 0 || this.scene == "gameOver") ? 0 : UTIL.rnd(3) - 1;
        if (e.h.length === undefined) t = e.h;
        else t = e.h[r]; if (e.v.length === undefined) n = e.v;
        else n = e.v[r];
        UTIL.draw(n.x, n.y, 4, 24, 29, 0);
        UTIL.draw(n.x, n.y, 4, 24, 29, 24);
        UTIL.draw(n.x, n.y, 4, 24, 29, 72);
        UTIL.draw(n.x, n.y, 4, 24, 29, 96);
        UTIL.draw(n.x, n.y, 4, 24, 29, 120);
        UTIL.draw(n.x, n.y, 4, 24, 293, 0);
        UTIL.draw(n.x, n.y, 4, 24, 293, 24);
        UTIL.draw(n.x, n.y, 4, 24, 293, 72);
        UTIL.draw(n.x, n.y, 4, 24, 293, 96);
        UTIL.draw(n.x, n.y, 4, 24, 293, 120);
        for (var i = 0; i < 11; i++) UTIL.draw(t.x, t.y, 24, 2, 29 + i * 24, 0);
        for (var i = 0; i < 11; i++) UTIL.draw(t.x, t.y, 24, 2, 29 + i * 24, 142);
        for (var i = 0; this.innerWalls[i]; i++) {
            var s = this.innerWalls[i];
            if (s.type == "h") UTIL.draw(t.x, t.y, 24, 4, s.x, s.y);
            else if (s.type == "v") UTIL.draw(n.x, n.y, 4, 24, s.x, s.y)
        }
        UTIL.draw(t.x, t.y, 24, 4, 8, 46);
        UTIL.draw(t.x, t.y, 24, 4, 8, 70);
        UTIL.draw(t.x, t.y, 24, 4, 295, 46);
        UTIL.draw(t.x, t.y, 24, 4, 295, 70);
        if (this.teleportStatus == "close") {
            var o = DATA.sprite.teleport.wallClose;
            UTIL.draw(o.x, o.y, o.w, o.h, 27, 50);
            UTIL.draw(o.x, o.y, o.w, o.h, 299, 50)
        } else {
            var o = DATA.sprite.teleport.wallOpen;
            var u = DATA.sprite.teleport.arrows.left;
            var a = DATA.sprite.teleport.arrows.right;
            UTIL.draw(o.x, o.y, o.w, o.h, 27, 50);
            UTIL.draw(u.x, u.y, u.w, u.h, 7, 56);
            UTIL.draw(o.x, o.y, o.w, o.h, 299, 50);
            UTIL.draw(a.x, a.y, a.w, a.h, 311, 56)
        }
        UTIL.rect(27, 49, 2, 1, this.bgColor);
        UTIL.rect(299, 49, 2, 1, this.bgColor);
        UTIL.rect(27, 70, 2, 1, this.bgColor);
        UTIL.rect(299, 70, 2, 1, this.bgColor);
        UTIL.draw(n.x, n.y, 2, 24, 269, 144);
        UTIL.draw(n.x, n.y, 2, 24, 295, 144);
        if (this.players[0].status == "wait" || this.players[0].status == "enter") UTIL.rect(271, 142, 22, 2, this.bgColor);
        UTIL.draw(n.x, n.y, 2, 24, 29, 144);
        UTIL.draw(n.x, n.y, 2, 24, 55, 144);
        if (this.players[1].status == "wait" || this.players[1].status == "enter") UTIL.rect(33, 142, 22, 2, this.bgColor);
        var f = DATA.sprite.players[0].left[2];
        if (this.players[0].lives > 1 || this.players[0].lives == 1 && this.players[0].status == "wait") UTIL.draw(f.x, f.y, 18, 18, 274, 147);
        var l = this.players[0].lives - 1;
        if (this.players[0].status != "wait") l--;
        for (var i = 0; i < l; i++) UTIL.draw(f.x, f.y, 18, 18, 301, 147 - i * 24);
        var f = DATA.sprite.players[1].right[2];
        if (this.players[1].lives > 1 || this.players[1].lives == 1 && this.players[1].status == "wait") UTIL.draw(f.x, f.y, 18, 18, 34, 147);
        var l = this.players[1].lives - 1;
        if (this.players[1].status != "wait") l--;
        for (var i = 0; i < l; i++) UTIL.draw(f.x, f.y, 18, 18, 7, 147 - i * 24);
        if (this.players[0].status == "wait") {
            var c = Math.floor(this.players[0].frameCounters.entering / engine.scanFPS);
            if (c < 9 && c > 0) UTIL.drawText(c, 247, 165, 7)
        }
        if (this.players[1].status == "wait") {
            var c = Math.floor(this.players[1].frameCounters.entering / engine.scanFPS);
            if (c < 9 && c > 0) UTIL.drawText(c, 71, 165, 6)
        }
        this.players[0].animationRoutine();
        this.players[1].animationRoutine();
        for (var i = 0; i < this.monsters.length; i++) this.monsters[i].animationRoutine();
        if (this.players[0].bullet) this.players[0].bullet.animationRoutine();
        if (this.players[1].bullet) this.players[1].bullet.animationRoutine();
        for (var i = 0; i < this.monsters.length; i++)
            if (this.monsters[i].bullet) this.monsters[i].bullet.animationRoutine();
        UTIL.draw(n.x, n.y, 2, 24, 117, 152);
        UTIL.draw(n.x, n.y, 2, 24, 117, 176);
        UTIL.draw(n.x, n.y, 2, 24, 207, 152);
        UTIL.draw(n.x, n.y, 2, 24, 207, 176);
        UTIL.draw(t.x, t.y, 24, 2, 119, 150);
        UTIL.draw(t.x, t.y, 24, 2, 143, 150);
        UTIL.draw(t.x, t.y, 24, 2, 167, 150);
        UTIL.draw(t.x, t.y, 24, 2, 183, 150);
        UTIL.drawText(this.radarText, 160 - Math.floor(this.radarText.length / 2) * 8, 152, this.radarTextColor, "c64", this.bgColor);
        UTIL.rect(119, 152, 88, 48, this.bgColor);
        for (var i = 0; i < this.monsters.length; i++) {
            var h = this.monsters[i];
            if (h.status == "died") continue;
            var p;
            if (h.status == "alive") {
                if (h.type == "burwor") p = 6;
                else if (h.type == "garwor") p = 7;
                else if (h.type == "thorwor") p = 2;
                else continue
            } else if (h.status == "shooted") {
                switch (UTIL.rnd(4)) {
                case 1:
                    p = 1;
                    break;
                case 2:
                    p = 4;
                    break;
                case 3:
                    p = 13;
                    break;
                case 4:
                    p = 15;
                    break
                }
            }
            UTIL.rect(120 + (h.getCol() - 1) * 8, 153 + (h.getRow() - 1) * 8, 6, 6, p)
        }
        this.displayScore(1, game.players[0].score);
        this.displayScore(2, game.players[1].score)
    };
    this.scanMouseEvents = function (e, t, n) {
        if (this.scene == "title") {
            if (e > 87 && e < 238 && t > 163) {
                this.scene = "options"
            } else if (e > 115 && e < 234 && t > 22 && t < 42) {
            } else {
                this.startNewGame(1)
            }
        } else if (this.scene == "enemyRoster") {
            this.startNewGame(1)
        } else if (this.scene == "options") {
            if (e > 110 && e < 168 && t < 15) {
                if (!engine.audio.context) {
                    localStorage.setItem("sound", "off");
                    engine.options.sound = "off"
                } else {
                    localStorage.setItem("sound", "on");
                    engine.options.sound = "on";
                    engine.audio.play("Fire")
                }
            } else if (e > 190 && e < 256 && t < 15) {
                localStorage.setItem("sound", "off");
                engine.options.sound = "off"
            } else if (engine.platform == "desktop" && navigator.webkitGetGamepads && e > 110 && e < 168 && t > 49 && t < 70) {
                localStorage.setItem("p1controls", "gamepad");
                engine.options.p1controls = "gamepad"
            } else if (engine.platform == "desktop" && e > 190 && e < 256 && t > 49 && t < 70) {
                localStorage.setItem("p1controls", "keyboard");
                engine.options.p1controls = "keyboard"
            } else if (engine.platform == "desktop" && navigator.webkitGetGamepads && e > 110 && e < 168 && t > 82 && t < 105) {
                localStorage.setItem("p2controls", "gamepad");
                engine.options.p2controls = "gamepad"
            } else if (engine.platform == "desktop" && e > 190 && e < 256 && t > 82 && t < 105) {
                localStorage.setItem("p2controls", "keyboard");
                engine.options.p2controls = "keyboard"
            } else if (e > 189 && e < 307 && t > 135 && t < 152) {
                UTIL.analyticsEvent("support", "clickDonate");
                document.getElementById("donate")
                    .submit()
            } else if (e > 105 && e < 219 && t > 181) {
                this.hideTouchNavigation();
                this.frameCounters.title = 0;
                this.scene = "title"
            }
        }
    };
    this.scanTitle = function () {
        this.frameCounters.title++;
        if (this.frameCounters.title > 13 * engine.scanFPS) {
            this.frameCounters.title = 0;
            this.scene = "title"
        } else if (this.frameCounters.title > 8 * engine.scanFPS) this.scene = "enemyRoster";
        if (engine.pressedKeys[DATA.keys[0].fire] === true) this.startNewGame(1);
        if (engine.platform == "desktop" && engine.pressedKeys[DATA.keys[1].fire] === true) this.startNewGame(2)
    };
    this.scanGetReady = function () {
        this.frameCounters.getReady++;
        if (this.frameCounters.getReady == 1) engine.audio.request({
            name: "GetReady"
        });
        if (this.frameCounters.getReady > 4 * engine.scanFPS) {
            this.frameCounters.doubleScore = 0;
            this.scene = "doubleScore"
        }
    };
    this.scanGameOver = function () {
        this.frameCounters.gameOver++;
        if (this.frameCounters.gameOver == 1) {
            if (game.players[0].score > 0) this.subscribeToToplist(game.players[0].score);
            if (this.numOfPlayers > 1 && game.players[1].score > 0) this.subscribeToToplist(game.players[1].score);
            UTIL.analyticsEvent("game", "finalScore", (game.players[0].score + game.players[1].score)
                .toString())
        }
        if (this.frameCounters.gameOver >= 8 * engine.scanFPS) {
            this.hideTouchNavigation();
            this.frameCounters.title = 0;
            game.scene = "title"
        }
    };
    this.scanDoubleScore = function () {
        this.frameCounters.doubleScore++;
        if (this.frameCounters.doubleScore == 1) {
            if (!this.doubleScoreNext && this.level != 3 && this.level != 12) {
                this.frameCounters.doubleScore = 0;
                this.nextDungeon();
                return
            }
            if (this.doubleScoreNext) engine.audio.request({
                name: "Doublescore"
            });
            if (this.level == 3 || this.level == 12) {
                if (this.players[0].status != "out") game.players[0].lives++;
                if (this.players[1].status != "out") game.players[1].lives++
            }
        }
        if (this.frameCounters.doubleScore >= 4.9 * engine.scanFPS) {
            this.frameCounters.doubleScore = 0;
            this.nextDungeon()
        }
    };
    this.speedUp = function () {
        if (this.speed >= 16) return;
        this.speed++;
        var e = Math.round(this.speed / 2);
        if (e > 7) e = 7;
        if (e != this.speedSoundTempo) {
            engine.audio.stop("Speed" + this.speedSoundTempo);
            this.speedSoundTempo = e;
            engine.audio.request({
                name: "Speed" + e,
                loop: true
            })
        }
    };
    this.gameOver = function () {
        engine.audio.stopAllSound();
        engine.audio.request({
            name: "GameOver"
        });
        this.hideTouchNavigation();
        this.frameCounters.gameOver = 0;
        this.scene = "gameOver"
    };
    this.scanDungeon = function () {
        this.frameCounters.dungeon++;
        if (this.frameCounters.worlukDeathAnimation > 0) {
            this.frameCounters.worlukDeathAnimation--;
            if (this.frameCounters.worlukDeathAnimation <= 0) {
                this.wallType = "blue";
                this.bgColor = 0;
                document.body.style.background = "#000";
                this.endDungeon()
            } else {
                var e = this.frameCounters.worlukDeathAnimation % 8;
                var t = 0;
                if (e > 5) t = 6;
                else if (e > 3) t = 0;
                else if (e > 1) t = 2;
                if (this.bgColor != t) {
                    this.bgColor = t;
                    document.body.style.background = "#" + DATA.colors[t]
                }
            }
            return
        }
        if (this.frameCounters.worlukEscaped > 0) {
            this.frameCounters.worlukEscaped--;
            if (this.frameCounters.worlukEscaped <= 0) {
                if (this.players[0].status == "dead") this.players[0].lives--;
                if (this.players[1].status == "dead") this.players[1].lives--;
                if (this.players[0].lives < 1) this.players[0].status = "out";
                if (this.players[1].lives < 1) this.players[1].status = "out";
                if (this.players[0].status == "out" && this.players[1].status == "out") {
                    this.wallType = "red";
                    this.bgColor = 0;
                    document.body.style.background = "#000";
                    this.gameOver();
                    return
                }
                this.wallType = "blue";
                if ((this.players[0].status == "alive" || this.players[1].status == "alive") && this.wizardOfWor()) {} else {
                    this.endDungeon()
                }
            }
            return
        }
        if (this.frameCounters.wizardEscaped > 0) {
            this.frameCounters.wizardEscaped--;
            if (this.frameCounters.wizardEscaped <= 0) {
                if (!this.players[0].lives) this.players[0].status = "out";
                if (!this.players[1].lives) this.players[1].status = "out";
                if (this.players[0].status == "out" && this.players[1].status == "out") {
                    this.wallType = "red";
                    this.bgColor = 0;
                    document.body.style.background = "#000";
                    this.gameOver();
                    return
                } else {
                    this.wallType = "blue";
                    this.endDungeon()
                }
            } else {
                var e = this.frameCounters.wizardEscaped % 8;
                var t = 0;
                if (e > 5) t = 6;
                else if (e > 3) t = 0;
                else if (e > 1) t = 2;
                this.wallType = "red";
                if (this.bgColor != t) {
                    this.bgColor = t;
                    document.body.style.background = "#" + DATA.colors[t]
                }
            }
            return
        }
        if (this.frameCounters.wizardDeathAnimation > 0) {
            this.frameCounters.wizardDeathAnimation--;
            if (this.frameCounters.wizardDeathAnimation <= 0) {
                this.wallType = "blue";
                this.endDungeon()
            }
            return
        }
        if (this.frameCounters.dungeon % (25 * engine.scanFPS) == 0) this.speedUp();
        for (var n = 0; n < this.monsters.length; n++) this.monsters[n].scanRoutine();
        this.players[0].scanRoutine();
        this.players[1].scanRoutine();
        if (this.players[0].bullet) this.players[0].bullet.scanRoutine();
        if (this.players[1].bullet) this.players[1].bullet.scanRoutine();
        for (var n = 0; n < this.monsters.length; n++)
            if (this.monsters[n].bullet) this.monsters[n].bullet.scanRoutine();
        if (this.frameCounters.teleportOpenDelay > 0) {
            this.frameCounters.teleport++;
            if (this.frameCounters.teleport >= this.frameCounters.teleportOpenDelay) this.openTeleport()
        }
    }
}

function WizardOfWorAudio() {
    this.init = function () {
        this.audioContext = window.AudioContext || window.webkitAudioContext || false;
        this.context = this.audioContext ? new this.audioContext : false;
        this.neededResources = ["Speed1.ogg", "Speed2.ogg", "Speed3.ogg", "Speed4.ogg", "Speed5.ogg", "Speed6.ogg", "Speed7.ogg", "Death.ogg", "Doublescore.ogg", "EnemyFire.ogg", "Fire.ogg", "Enter.ogg", "GameOver.ogg", "GetReady.ogg", "Shooted.ogg", "Teleport.ogg", "Visible.ogg", "Worluk.ogg", "WorlukDeath.ogg", "WorlukEscape.ogg", "WizardDeath.ogg", "WizardEscape.ogg"];
        this.sounds = {};
        this.queue = [];
        this.activeSounds = []
    };
    this.request = function (e) {
        if (!this.context) return;
        for (var t = 0; t < this.queue.length; t++)
            if (this.queue[t].name == e.name && !e.offset) return;
        this.queue.push(e);
        return true
    };
    this.playQueue = function () {
        if (engine.options.sound == "off" || !this.context) return false;
        for (var e = 0; e < this.queue.length; e++) {
            var t = this.queue[e];
            if (!t.name) continue;
            if (t.loop === undefined) t.loop = false;
            if (t.offset === undefined) t.offset = 0;
            this.activeSounds.push({
                name: t.name,
                bufferSource: this.play(t.name, t.loop, t.offset)
            })
        }
    };
    this.stop = function (e) {
        if (!this.context) return;
        for (var t = 0; t < this.activeSounds.length; t++) {
            if (this.activeSounds[t].name.indexOf(e) === 0) {
                this.activeSounds[t].bufferSource.stop(0);
                this.activeSounds[t].name = "deleted"
            }
        }
    };
    this.stopAllSound = function () {
        if (!this.context) return;
        for (var e = 0; e < this.activeSounds.length; e++) this.activeSounds[e].bufferSource.stop(0);
        this.queue = [];
        this.activeSounds = []
    };
    this.loadAudioResource = function (e) {
        if (!this.context) {
            engine.loadedResourcesCount += engine.audio.neededResources.length;
            return
        }
        var t = this.neededResources[e];
        var n = t.split(".")[0];
        var r = new XMLHttpRequest;
        r.open("GET", "sounds/" + t, true);
        r.responseType = "arraybuffer";
        r.onload = function () {
            engine.audio.context.decodeAudioData(r.response, function (t) {
                engine.audio.sounds[n] = t;
                if (e + 1 < engine.audio.neededResources.length) engine.audio.loadAudioResource(e + 1);
                engine.loadedResourcesCount++
            }, function (e) {})
        };
        r.send()
    };
    this.play = function (e, t, n) {
        if (engine.options.sound == "off" || !this.context) return false;
        t = t ? true : false;
        var r = this.context.createBufferSource();
        r.buffer = this.sounds[e];
        r.loop = t;
        r.connect(this.context.destination);
        if (!n) r.start(0);
        else {
            setTimeout(function () {
                if (engine.options.sound == "off") return false;
                r.start(0)
            }, n)
        }
        return r
    }
}

function WizardOfWorEngine() {
    this.audio;
    this.options = {};
    this.pressedKeys = [];
    this.click = {
        x: false,
        y: false,
        btn: false
    };
    this.canvasElement;
    this.canvas;
    this.scaleToFit = 1;
    this.msg = document.getElementById("message");
    this.platform = "desktop";
    this.viewportOrientation = window.innerHeight > window.innerWidth ? "v" : "h";
    this.loadResourcesInterval = false;
    this.neededResources = ["images/sprite.png"];
    this.neededResourcesCount = this.neededResources.length;
    this.loadedResourcesCount = 0;
    this.sprite = new Image;
    this.init = function () {
        if (document.location.search != "") window.history.pushState(false, false, "/");
        this.detectPlatform();
        this.checkSystemRequirements(function () {
            if (engine.platform == "desktop")
            engine.audio = new WizardOfWorAudio;
            engine.audio.init();
            engine.neededResourcesCount += engine.audio.neededResources.length;
            engine.setOptions();
            engine.loadResources(function () {
                engine.msg.setAttribute("class", "hide");
                if (engine.platform == "desktop") engine.initKeyHandling();
                engine.initMouseEvents();
                game = new WizardOfWorGame;
                engine.initEngine()
            })
        }, function () {
            engine.msg.innerHTML = "UNSUPPORTED BROWSER";
            engine.msg.setAttribute("class", "error")
        })
    };
    this.detectPlatform = function () {
        var e = navigator.userAgent;
        this.platform = e.match(/Android/i) || e.match(/BlackBerry/i) || e.match(/iPhone|iPad|iPod/i) || e.match(/Opera Mini/i) || e.match(/IEMobile/i) ? "mobile" : "desktop"
    };
    this.checkSystemRequirements = function (e, t) {
        var n = true;
        if (typeof Storage === "undefined") n = false;
        var r = document.createElement("canvas");
        if (!(r.getContext && r.getContext("2d"))) n = false;
        window.animFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
        if (!window.animFrame) n = false;
        if (n) e();
        else t()
    };
    this.setOptions = function () {
        if (!this.audio.context) localStorage.setItem("sound", "off");
        if (localStorage.getItem("sound") === null) localStorage.setItem("sound", "on");
        engine.options.sound = localStorage.getItem("sound");
        engine.options.display = "window";
        if (localStorage.getItem("p1controls") === null) {
            if (engine.platform == "mobile") localStorage.setItem("p1controls", "touch");
            else localStorage.setItem("p1controls", "keyboard")
        }
        engine.options.p1controls = localStorage.getItem("p1controls");
        if (localStorage.getItem("p2controls") === null) {
            if (engine.platform == "mobile") localStorage.setItem("p2controls", "touch");
            else localStorage.setItem("p2controls", "keyboard")
        }
        engine.options.p2controls = localStorage.getItem("p2controls");
        if (localStorage.getItem("highScores") === null) localStorage.setItem("highScores", "0,0,0,0,0");
        var e = localStorage.getItem("highScores")
            .split(",");
        engine.options.highScores = [];
        for (var t = 0; t < e.length; t++) engine.options.highScores[t] = +e[t]
    };
    this.loadResources = function (e) {
        this.loadResourcesInterval = setInterval(function () {
            if (engine.loadedResourcesCount == engine.neededResourcesCount) {
                clearInterval(engine.loadResourcesInterval);
                e()
            }
        }, 100);
        this.sprite.src = this.neededResources[0];
        this.sprite.onload = function () {
            engine.loadedResourcesCount++
        };
        this.audio.loadAudioResource(0)
    };
    this.initKeyHandling = function () {
        document.onkeydown = function (e) {
            if (e.which == 123 || e.which == 116) return;
            e.preventDefault();
            e.stopPropagation();
            if (engine.pressedKeys[e.which] === false || engine.pressedKeys[e.which] === undefined) engine.pressedKeys[e.which] = true
        };
        document.onkeyup = function (e) {
            e.preventDefault();
            e.stopPropagation();
            engine.pressedKeys[e.which] = false
        }
    };
    this.initMouseEvents = function () {
        function e(e) {
            var t = e.offsetX || e.layerX;
            var n = e.offsetY || e.layerY;
            t = Math.round(t / 3);
            n = Math.round(n / 3);
            engine.click.x = t;
            engine.click.y = n;
            engine.click.btn = e.which;
            if (game.scene == "options" && engine.platform == "desktop") {
                if (t > 110 && t < 168 && n > 23 && n < 39) {
                    engine.options.display = "window";
                    if (document.cancelFullScreen) document.cancelFullScreen();
                    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                    else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen()
                } else if (t > 190 && t < 272 && n > 23 && n < 39) {
                    engine.options.display = "fullscreen";
                    var r = document.getElementById("gameScreen");
                    if (r.requestFullScreen) r.requestFullScreen();
                    else if (r.mozRequestFullScreen) r.mozRequestFullScreen();
                    else if (r.webkitRequestFullScreen) r.webkitRequestFullScreen()
                }
            }
        }
        document.getElementById("screen")
            .oncontextmenu = function (t) {
                t.preventDefault();
                e(t);
                return false
        };
        document.getElementById("screen")
            .onclick = function (t) {
                t.preventDefault();
                e(t);
                return false
        };
        if (engine.platform == "mobile") {
            function t(e) {
                e.preventDefault();
                var t = e.srcElement.id.substr(12)
                    .toLowerCase();
                engine.pressedKeys[DATA.keys[0][t]] = e.type == "touchstart" ? true : false;
                return false
            }
            for (var n in {
                Up: 0,
                Down: 0,
                Left: 0,
                Right: 0,
                Fire: 0
            }) {
                document.getElementById("touchControl" + n)
                    .addEventListener("touchstart", t);
                document.getElementById("touchControl" + n)
                    .addEventListener("touchend", t)
            }
        }
    };
    this.initEngine = function () {
        this.canvasElement = document.getElementById("screen");
        this.canvas = this.canvasElement.getContext("2d");
        this.canvas.webkitImageSmoothingEnabled = false;
        this.canvas.mozImageSmoothingEnabled = false;
        this.canvas.imageSmoothingEnabled = false;
        window.onresize = function () {
            var e = window.innerWidth;
            var t = window.innerHeight;
            var n = 0;
            if (e > 960 && t > 600) {
                n = 100;
                e = e - n;
                t = t - n
            }
            var r = e / engine.canvasElement.width;
            var i = t / engine.canvasElement.height;
            engine.scaleToFit = Math.min(r, i);
            engine.canvasElement.style.transformOrigin = "0 0";
            engine.canvasElement.style.webkitTransformOrigin = "0 0";
            engine.canvasElement.style.transform = "scale(" + engine.scaleToFit + ")";
            engine.canvasElement.style.webkitTransform = "scale(" + engine.scaleToFit + ")";
            var s = Math.round((e - 960 * engine.scaleToFit) / 2) + n / 2;
            var o = Math.round((t - 600 * engine.scaleToFit) / 2) + n / 2;
            engine.viewportOrientation = window.innerHeight > window.innerWidth ? "v" : "h";
            if (engine.platform == "mobile" && engine.viewportOrientation == "v") {
                o = 10;
                document.getElementById("touchControlMove")
                    .style.width = "49%";
                document.getElementById("touchControlFire")
                    .style.width = "49%";
                document.getElementById("touchControlMove")
                    .style.height = "45%";
                document.getElementById("touchControlFire")
                    .style.height = "45%"
            }
            if (engine.platform == "mobile" && engine.viewportOrientation == "h") {
                document.getElementById("touchControlMove")
                    .style.width = "23%";
                document.getElementById("touchControlFire")
                    .style.width = "23%";
                document.getElementById("touchControlMove")
                    .style.height = "60%";
                document.getElementById("touchControlFire")
                    .style.height = "60%"
            }
            engine.canvasElement.style.margin = o + "px " + s + "px 0px " + s + "px"
        };
        window.onresize();
        if (this.platform == "mobile") {
            window.addEventListener("orientationchange", function (e) {
                setTimeout("window.onresize();", 600)
            }, false)
        }
        this.canvasElement.setAttribute("class", "");
        this.scanFPS = 25;
        this.scanFrameTime = 1e3 / this.scanFPS;
        this.animationFrameCounter = 0;
        this.scanFrameCounter = 0;
        this.scanInterval = false;
        this.animation();
        this.startScan()
    };
    this.animation = function () {
        window.animFrame(function (e) {
            engine.animationRoutine();
            engine.animation()
        })
    };
    this.startScan = function () {
        this.scanInterval = setInterval(function () {
            engine.scanRoutine()
        }, this.scanFrameTime)
    };
    this.animationRoutine = function () {
        this.animationFrameCounter++;
        game.animationRoutine()
    };
    this.scanRoutine = function () {
        this.scanFrameCounter++;
        this.audio.queue = [];
        game.scanRoutine();
        this.audio.playQueue()
    }
}
var DATA = {
    colors: ["000000", "FCF9FC", "933A4C", "B6FAFA", "D27DED", "6ACF6F", "4F44D8", "FBFB8B", "D89C5B", "7F5307", "EF839F", "575753", "A3A7A7", "B7FBBF", "A397FF", "EFE9E7"],
    dungeons: {
        easy: ["1x3,4x3,8x3,11x3,3x4,9x4,5x5,7x5|1x2,2x2,3x2,4x2,5x2,6x2,7x2,8x2,9x2,10x2,3x3,5x3,6x3,8x3,2x4,9x4,1x5,3x5,5x5,6x5,8x5,10x5,2x6,9x6", "2x1,3x1,6x1,9x1,10x1,2x2,4x2,6x2,8x2,10x2,1x3,5x3,7x3,11x3,2x4,10x4,3x5,9x5|4x2,7x2,3x3,8x3,2x4,4x4,7x4,9x4,1x5,3x5,5x5,6x5,8x5,10x5,4x6,7x6", "2x1,3x1,9x1,10x1,3x2,4x2,8x2,9x2,1x3,5x3,7x3,11x3,5x4,6x4,7x4,5x5,7x5|4x1,7x1,1x2,5x2,6x2,10x2,2x3,9x3,2x4,3x4,8x4,9x4,1x5,10x5,3x6,8x6", "2x1,5x1,7x1,10x1,2x2,10x2,1x3,3x3,9x3,11x3,2x4,4x4,8x4,10x4,2x5,3x5,9x5,10x5|3x1,8x1,3x3,4x3,5x3,6x3,7x3,8x3,2x4,4x4,7x4,9x4,3x5,5x5,6x5,8x5,4x6,7x6", "2x1,5x1,7x1,10x1,2x2,3x2,6x2,9x2,10x2,1x3,11x3,2x4,10x4,2x5,5x5,7x5,10x5|3x1,8x1,4x2,7x2,2x4,3x4,4x4,5x4,6x4,7x4,8x4,9x4,4x5,7x5,3x6,8x6", "2x1,5x1,7x1,10x1,3x2,5x2,7x2,9x2,1x3,11x3,2x4,10x4,2x5,4x5,8x5,10x5|3x1,8x1,1x2,10x2,2x3,5x3,6x3,9x3,3x4,4x4,5x4,6x4,7x4,8x4,4x5,7x5,5x6,6x6", "2x1,5x1,7x1,10x1,3x2,6x2,9x2,1x3,6x3,11x3,2x4,5x4,7x4,10x4,2x5,6x5,10x5|1x2,4x2,7x2,10x2,2x3,9x3,3x4,4x4,7x4,8x4,3x5,8x5,4x6,7x6", "2x1,5x1,7x1,10x1,4x2,5x2,7x2,8x2,4x3,8x3,2x4,5x4,7x4,10x4,3x5,9x5|3x1,8x1,1x2,10x2,2x3,5x3,6x3,9x3,2x4,3x4,8x4,9x4,1x5,5x5,6x5,10x5,4x6,7x6", "2x1,6x1,10x1,2x2,5x2,7x2,10x2,1x3,6x3,11x3,2x4,3x4,6x4,9x4,10x4,2x5,6x5,10x5|3x1,8x1,3x2,4x2,7x2,8x2,2x3,9x3,3x4,4x4,7x4,8x4,4x6,7x6", "4x1,6x1,8x1,3x2,6x2,9x2,1x3,6x3,11x3,5x5,7x5|2x1,9x1,1x2,3x2,8x2,10x2,4x3,7x3,2x4,3x4,4x4,7x4,8x4,9x4,1x5,2x5,5x5,6x5,9x5,10x5,3x6,8x6", "4x1,6x1,8x1,4x2,6x2,8x2,1x3,5x3,7x3,11x3,3x4,6x4,9x4,5x5,7x5|2x1,9x1,1x2,10x2,2x3,4x3,7x3,9x3,2x4,4x4,7x4,9x4,1x5,10x5,3x6,8x6", "4x1,6x1,8x1,5x2,7x2,1x3,2x3,4x3,8x3,10x3,11x3,3x4,4x4,8x4,9x4,6x5|2x1,9x1,1x2,3x2,8x2,10x2,2x3,3x3,5x3,6x3,8x3,9x3,5x4,6x4,1x5,10x5,2x6,4x6,7x6,9x6"],
        hard: ["2x1,5x1,7x1,10x1,3x2,6x2,9x2,4x3,8x3,5x4,7x4|2x2,9x2,3x3,8x3,4x4,7x4,2x5,5x5,6x5,9x5", "2x1,6x1,10x1,3x2,6x2,9x2,4x3,8x3,3x4,6x4,9x4,2x5,6x5,10x5|4x2,7x2,1x3,10x3,1x4,10x4,4x5,7x5", "2x1,10x1,3x2,5x2,7x2,9x2,3x4,5x4,7x4,9x4,2x5,10x5|2x2,5x2,6x2,9x2,3x3,4x3,7x3,8x3,3x4,4x4,7x4,8x4,2x5,5x5,6x5,9x5", "2x1,10x1,4x2,5x2,7x2,8x2,2x3,10x3,3x4,4x4,8x4,9x4|2x2,5x2,6x2,9x2,2x3,3x3,8x3,9x3,4x4,7x4,2x5,9x5", "2x2,4x2,8x2,10x2,2x4,4x4,8x4,10x4|1x2,4x2,7x2,10x2,2x3,5x3,6x3,9x3,3x4,5x4,6x4,8x4,1x5,4x5,7x5,10x5", "5x1,7x1,2x2,3x2,9x2,10x2,4x3,5x3,7x3,8x3,2x4,10x4,3x5,4x5,8x5,9x5|2x2,5x2,6x2,9x2,2x3,4x3,7x3,9x3,1x4,4x4,7x4,10x4,2x5,9x5", "5x1,7x1,4x2,8x2,3x3,9x3,2x4,5x4,7x4,10x4,4x5,8x5|4x2,7x2,3x3,8x3,2x4,5x4,6x4,9x4,4x5,7x5", "|1x2,3x2,4x2,7x2,8x2,10x2,1x3,2x3,4x3,5x3,6x3,7x3,9x3,10x3,2x4,3x4,5x4,6x4,8x4,9x4,3x5,4x5,7x5,8x5"],
        fix: ["2x1,4x1,5x1,7x1,8x1,10x1,2x2,3x2,9x2,10x2,2x3,10x3,3x4,5x4,6x4,7x4,9x4,6x5|3x2,8x2,2x4,9x4,1x5,10x5,2x6,4x6,7x6,9x6", "|"]
    },
    sprite: {
        burwor: {
            up: [{
                x: 126,
                y: 0
            }, {
                x: 108,
                y: 0
            }, {
                x: 144,
                y: 0
            }],
            right: [{
                x: 72,
                y: 0
            }, {
                x: 54,
                y: 0
            }, {
                x: 90,
                y: 0
            }],
            down: [{
                x: 180,
                y: 0
            }, {
                x: 162,
                y: 0
            }, {
                x: 198,
                y: 0
            }],
            left: [{
                x: 18,
                y: 0
            }, {
                x: 0,
                y: 0
            }, {
                x: 36,
                y: 0
            }]
        },
        garwor: {
            up: [{
                x: 108,
                y: 18
            }, {
                x: 126,
                y: 18
            }, {
                x: 144,
                y: 18
            }],
            right: [{
                x: 54,
                y: 18
            }, {
                x: 72,
                y: 18
            }, {
                x: 90,
                y: 18
            }],
            down: [{
                x: 162,
                y: 18
            }, {
                x: 180,
                y: 18
            }, {
                x: 198,
                y: 18
            }],
            left: [{
                x: 0,
                y: 18
            }, {
                x: 18,
                y: 18
            }, {
                x: 36,
                y: 18
            }]
        },
        thorwor: {
            up: [{
                x: 126,
                y: 36
            }, {
                x: 108,
                y: 36
            }, {
                x: 144,
                y: 36
            }],
            right: [{
                x: 72,
                y: 36
            }, {
                x: 54,
                y: 36
            }, {
                x: 90,
                y: 36
            }],
            down: [{
                x: 180,
                y: 36
            }, {
                x: 162,
                y: 36
            }, {
                x: 198,
                y: 36
            }],
            left: [{
                x: 18,
                y: 36
            }, {
                x: 0,
                y: 36
            }, {
                x: 36,
                y: 36
            }]
        },
        worluk: [{
            x: 0,
            y: 108
        }, {
            x: 18,
            y: 108
        }, {
            x: 36,
            y: 108
        }],
        wizardOfWor: {
            up: [{
                x: 108,
                y: 90
            }, {
                x: 126,
                y: 90
            }, {
                x: 144,
                y: 90
            }],
            right: [{
                x: 54,
                y: 90
            }, {
                x: 72,
                y: 90
            }, {
                x: 90,
                y: 90
            }],
            down: [{
                x: 162,
                y: 90
            }, {
                x: 180,
                y: 90
            }, {
                x: 198,
                y: 90
            }],
            left: [{
                x: 0,
                y: 90
            }, {
                x: 18,
                y: 90
            }, {
                x: 36,
                y: 90
            }]
        },
        players: [{
            up: [{
                x: 108,
                y: 54
            }, {
                x: 126,
                y: 54
            }, {
                x: 144,
                y: 54
            }],
            right: [{
                x: 54,
                y: 54
            }, {
                x: 72,
                y: 54
            }, {
                x: 90,
                y: 54
            }],
            down: [{
                x: 162,
                y: 54
            }, {
                x: 180,
                y: 54
            }, {
                x: 198,
                y: 54
            }],
            left: [{
                x: 0,
                y: 54
            }, {
                x: 18,
                y: 54
            }, {
                x: 36,
                y: 54
            }],
            shoot: {
                up: {
                    x: 90,
                    y: 108
                },
                right: {
                    x: 72,
                    y: 108
                },
                down: {
                    x: 108,
                    y: 108
                },
                left: {
                    x: 54,
                    y: 108
                }
            },
            death: {
                up: [{
                    x: 0,
                    y: 152
                }, {
                    x: 18,
                    y: 152
                }, {
                    x: 36,
                    y: 152
                }],
                down: [{
                    x: 54,
                    y: 152
                }, {
                    x: 72,
                    y: 152
                }, {
                    x: 90,
                    y: 152
                }]
            }
        }, {
            up: [{
                x: 108,
                y: 72
            }, {
                x: 126,
                y: 72
            }, {
                x: 144,
                y: 72
            }],
            right: [{
                x: 54,
                y: 72
            }, {
                x: 72,
                y: 72
            }, {
                x: 90,
                y: 72
            }],
            down: [{
                x: 162,
                y: 72
            }, {
                x: 180,
                y: 72
            }, {
                x: 198,
                y: 72
            }],
            left: [{
                x: 0,
                y: 72
            }, {
                x: 18,
                y: 72
            }, {
                x: 36,
                y: 72
            }],
            shoot: {
                up: {
                    x: 162,
                    y: 108
                },
                right: {
                    x: 144,
                    y: 108
                },
                down: {
                    x: 180,
                    y: 108
                },
                left: {
                    x: 126,
                    y: 108
                }
            },
            death: {
                up: [{
                    x: 108,
                    y: 152
                }, {
                    x: 126,
                    y: 152
                }, {
                    x: 144,
                    y: 152
                }],
                down: [{
                    x: 162,
                    y: 152
                }, {
                    x: 180,
                    y: 152
                }, {
                    x: 198,
                    y: 152
                }]
            }
        }],
        hit: [{
            x: 0,
            y: 126
        }, {
            x: 106,
            y: 126
        }, {
            x: 142,
            y: 126
        }, {
            x: 178,
            y: 126
        }, {
            x: 18,
            y: 126
        }, {
            x: 124,
            y: 126
        }, {
            x: 160,
            y: 126
        }, {
            x: 196,
            y: 126
        }, {
            x: 0,
            y: 126
        }, {
            x: 106,
            y: 126
        }, {
            x: 142,
            y: 126
        }, {
            x: 178,
            y: 126
        }, {
            x: 18,
            y: 126
        }, {
            x: 124,
            y: 126
        }, {
            x: 160,
            y: 126
        }, {
            x: 196,
            y: 126
        }],
        texts: {
            get: {
                x: 0,
                y: 170,
                w: 88,
                h: 37
            },
            ready: {
                x: 88,
                y: 170,
                w: 152,
                h: 37
            },
            go: {
                x: 0,
                y: 207,
                w: 56,
                h: 37
            },
            "double": {
                x: 0,
                y: 244,
                w: 184,
                h: 37
            },
            score: {
                x: 56,
                y: 207,
                w: 152,
                h: 37
            },
            dungeon: {
                x: 0,
                y: 281,
                w: 216,
                h: 37
            },
            game: {
                x: 0,
                y: 318,
                w: 128,
                h: 37
            },
            over: {
                x: 128,
                y: 318,
                w: 120,
                h: 37
            }
        },
        enemyRosterPlayer2: {
            x: 198,
            y: 108
        },
        walls: {
            blue: {
                h: {
                    x: 36,
                    y: 126
                },
                v: {
                    x: 60,
                    y: 126
                }
            },
            red: {
                h: {
                    x: 36,
                    y: 132
                },
                v: {
                    x: 74,
                    y: 126
                }
            },
            worluk: {
                h: [{
                    x: 36,
                    y: 136
                }, {
                    x: 36,
                    y: 140
                }, {
                    x: 0,
                    y: 144
                }],
                v: [{
                    x: 66,
                    y: 126
                }, {
                    x: 70,
                    y: 126
                }, {
                    x: 214,
                    y: 126
                }]
            },
            wizardOfWor: {
                h: [{
                    x: 36,
                    y: 144
                }, {
                    x: 36,
                    y: 148
                }, {
                    x: 0,
                    y: 148
                }],
                v: [{
                    x: 78,
                    y: 126
                }, {
                    x: 82,
                    y: 126
                }, {
                    x: 218,
                    y: 126
                }]
            }
        },
        teleport: {
            wallOpen: {
                x: 86,
                y: 127,
                w: 2,
                h: 20
            },
            wallClose: {
                x: 88,
                y: 127,
                w: 2,
                h: 20
            },
            arrows: {
                left: {
                    x: 90,
                    y: 126,
                    w: 8,
                    h: 8
                },
                right: {
                    x: 98,
                    y: 126,
                    w: 8,
                    h: 8
                }
            }
        },
        bullets: {
            player: {
                h: {
                    x: 90,
                    y: 134,
                    w: 8,
                    h: 2
                },
                v: {
                    x: 90,
                    y: 136,
                    w: 2,
                    h: 8
                }
            },
            monster: {
                h: {
                    x: 98,
                    y: 134,
                    w: 8,
                    h: 2
                },
                v: {
                    x: 92,
                    y: 136,
                    w: 2,
                    h: 8
                }
            }
        }
    },
    scoring: {
        burwor: 100,
        garwor: 200,
        thorwor: 500,
        worluk: 1e3,
        worrior: 1e3,
        wizardOfWor: 2500
    },
    keys: [{
        up: 38,
        right: 39,
        down: 40,
        left: 37,
        fire: 13
    }, {
        up: 87,
        right: 68,
        down: 83,
        left: 65,
        fire: 16
    }],
    directions: ["up", "right", "down", "left"]
};
var UTIL = {
    rnd: function (e) {
        return Math.floor(Math.random() * e) + 1
    },
    fillStyle: function (e) {
        engine.canvas.fillStyle = "#" + DATA.colors[e]
    },
    collision: function (e, t, n, r, i, s, o, u) {
        return e + n < i || e > i + o || t + r < s || t > s + u ? false : true
    },
    rect: function (e, t, n, r, i) {
        UTIL.fillStyle(i);
        engine.canvas.fillRect(e * 3, t * 3, n * 3, r * 3)
    },
    draw: function (e, t, n, r, i, s) {
        engine.canvas.drawImage(engine.sprite, e, t, n, r, i * 3, s * 3, n * 3, r * 3)
    },
    cls: function () {
        UTIL.rect(0, 0, 320, 200, 0)
    },
    drawText: function (e, t, n, r, i, s) {
        e = e.toString()
            .toUpperCase();
        UTIL.fillStyle(r);
        if (i == "c64") engine.canvas.font = "25px C64ProRegular";
        else engine.canvas.font = "46px WizardOfWor";
        for (var o = 0; o < e.length; o++) {
            var u = e[o];
            if (u == " ") continue;
            var a = u == "I" && i == "c64" ? 3 : 0;
            if (s !== undefined) {
                UTIL.fillStyle(s);
                engine.canvas.fillRect(t * 3 + o * 24 - 3, n * 3, 25, -24);
                UTIL.fillStyle(r)
            }
            engine.canvas.fillText(u, t * 3 + o * 24 + a, n * 3)
        }
    },
    rightAlignedText: function (e, t) {
        e = e.toString();
        var n = t - e.length;
        if (n <= 0) return e.split("")
            .slice(0, t)
            .join("");
        do {
            e = " " + e
        } while (t > e.length);
        return e
    },
    getAFC: function () {
        return engine.animationFrameCounter
    },
    getSFC: function () {
        return engine.scanFrameCounter
    },
    analyticsEvent: function (e, t, n, r) {
        var i = [];
        i.push("_trackEvent");
        if (e !== undefined) {
            i.push(e);
            if (t !== undefined) {
                i.push(t);
                if (n !== undefined) {
                    i.push(n);
                    if (r !== undefined) {
                        i.push(r)
                    }
                }
            }
        }
        if (_gaq && i.length > 2) _gaq.push(i)
    }
};
var game;
var engine = new WizardOfWorEngine;
engine.init()