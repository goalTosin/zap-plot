const me = makeElt; //The available modes are:To to anything, you must be in a mode.

function showInstructions() {
  const instructions = str2elt(
    me("div", {style: 'width: 18em;'}, [
      me("p", "To make anything in the game, you need to choose an edit mode."),
      me("p", "This is the list of edit modes you can use:"),
      me("ul", [
        me("li", "Make a Mirror"),
        me("li", "Delete a Mirror"),
        me("li", "Move the Winning Point"),
      ]),
      me(
        "p",
        "There is also a Play mode, but it's just for playing the game you made, not for editing it."
      ),
      me("p", "Play mode is the default mode."),
      me("p", "To switch modes, press these keys:"),
      me("ul", [
        me("li", "Play: P"),
        me("li", "Make a Mirror: M"),
        me("li", "Delete Mirror: D"),
        me("li", "Move Winning Point: W"),
        me("li", "No mode: Escape"),
      ]),
    ])
  );
  createWindow("Instructions", instructions);
}
// showInstructions();

function showDoneMenu() {
  const doneMenu = str2elt(
    me("div", [
      me("p", "This is the level data:"),
      me("textarea", {style: "width: 100%;height:max-content;resize:vertical;"}, game.compileLevelData()),
      me("div", { class: 'window-button', onclick: "game.copyLevelData(); this.innerHTML = 'Copied!'; this.disabled = true; setTimeout((() => {this.innerHTML = 'Copy'; this.disabled = false}).bind(this), 2000)" }, "Copy"),
    ])
  );
  createWindow("Level Data", doneMenu);
}

function showBotMenu() {
  const botMenu = str2elt(
    me("div", { id: "bot-info" }, [
      me("div", {id: 'difflev'}, [
        me("label", { for: "diff" }, "Difficulty Level:"),
        // easy, medium, difficult, hard, pro, legend
        me("input", { id: "diff", type: "range", name: "diff", step: 1, max: 6 }),
      ]),
      me("div", {id: 'bot-info-action'}, [
        me("div", {class: 'window-button', onclick: 'game.winPoint = (generateLevel(game.tileSize, game.tilesX, game.tilesY, game.player.x, game.player.y)).winPoint'}, "Generate"),
      ]),
    ])
  );
  createWindow("Generation options", botMenu);
}
// showImportMenu()
function showImportMenu() {
  const impMenu = str2elt(
    me('div', {id: 'imp-menu'}, [
      me("textarea", {style: "width: 100%;height:max-content;resize:vertical;", placeholder: 'Data'}, ''),
      me('div', {class: 'window-button'}, 'Load File'),
      me('div', {class: 'window-button'}, 'Import')
    ])
  )
  createWindow("Import Level Data", impMenu);
}

let mode = {
  play: true,
  createMirror: false,
  deleteMirror: false,
  moveWinPoint: false,
};

// createWindow('Welcome')
class App {
  constructor(canvas) {
    /**
     * @type {HTMLCanvasElement} canvas
     */
    this.canvas = canvas;
    /**
     * @type {CanvasRenderingContext2D} canvas
     */
    this.ctx = this.canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.tileSize = 50;
    this.tilesX = Math.floor(this.width / this.tileSize);
    this.tilesY = Math.floor(this.height / this.tileSize);
    this.player = {
      x: (this.tilesX * this.tileSize) / 2,
      y: this.tileSize,
      size: 30,
      angle: 0,
      locked: false,
      sprite: new Sprite("../images/happy.webp"),
    };
    this.winPoint = {
      x: NaN,
      y: NaN,
      radius: 10,
    };
    this.lasers = [new Laser()];
    this.laserLimit = 10;
    this.latestLaserIdx = 0;
    this.mirrors = [];
    this.creationMirror = null;
    this.futureWinPoint = null;
    this.keysDown = {};
    // this.mirrors = [
    //   { x: 300, y: 200, width: 50, height: 10, angle: deg2Rad(60) },
    //   { x: 500, y: 300, width: 50, height: 10, angle: deg2Rad(-45) },
    //   {
    //     x: Math.floor(Math.random() * this.tilesX) * this.tileSize,
    //     y: Math.floor(Math.random() * this.tilesY) * this.tileSize,
    //     width: 50,
    //     height: 10,
    //     angle: deg2Rad(-45),
    //   },
    // ];
    // console.log(this.tilesX);
    // for (let i = 0; i < this.tilesY + 1; i++) {
    //   for (let j = 0; j < this.tilesX + 1; j++) {
    //     if (Math.round(Math.random() * 10) !== 0) {
    //       continue;
    //     }
    //     // const element = array[j];
    //     this.mirrors.push({
    //       x: j * this.tileSize,
    //       y: i * this.tileSize,
    //       width: 50,
    //       height: 10,
    //       angle: deg2Rad(Math.random() * 180),
    //     });
    //     // console.log('d');
    //   }
    //   // this.mirrors.push({
    //   //   x: Math.floor(Math.random() * this.tilesX) * this.tileSize,
    //   //   y: Math.floor(Math.random() * this.tilesY) * this.tileSize,
    //   //   width: 50,
    //   //   height: 10,
    //   //   angle: deg2Rad(Math.random() * 180),
    //   // });
    // }
    this.gameStartTime = Date.now();
    this.mirrorHeight = 10;
    this.mirrorWidth = 50;
    this.init();
  }

  mode2none() {
    Object.keys(mode).forEach((m) => {
      mode[m] = false;
    });
  }

  handleModeChange(e) {
    let modeTamper = true;
    switch (e.key) {
      case "p":
        this.mode2none();
        mode.play = true;
        break;
      case "m":
        this.mode2none();
        mode.createMirror = true;
        break;
      case "d":
        this.mode2none();
        mode.deleteMirror = true;
        break;
      case "w":
        this.mode2none();
        mode.moveWinPoint = true;
        break;
      case "Escape":
        this.mode2none();
        break;
      default:
        modeTamper = false;
        break;
    }
    if (modeTamper) {
      this.creationMirror = null;
    }
  }

  keyed(e) {
    this.keysDown[e.key] = e.type === "keydown";
    // console.log(e);
    // console.log(this.keysDown);
  }

  init() {
    this.loadData()
    addEventListener("mousemove", this.handleMouseMove.bind(this));
    addEventListener("mousedown", this.handleLaserCreation.bind(this));
    addEventListener("mouseup", this.handleLaserCreation.bind(this));
    addEventListener("click", this.handleClick.bind(this));
    addEventListener("keydown", this.handleModeChange.bind(this));
    addEventListener("keydown", this.keyed.bind(this));
    addEventListener("keyup", this.keyed.bind(this));
    // setTimeout(this.laser.release.bind(this.laser), 1000)
    requestAnimationFrame(this.update.bind(this));
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (!this.player.locked) {
      this.player.angle = Math.atan2(mouseY - this.player.y, mouseX - this.player.x);
    }
    if (mode.createMirror) {
      this.updateTempMirror(mouseX, mouseY);
    } else if (mode.deleteMirror) {
      this.updateTempMirrorDeletion(mouseX, mouseY);
    } else if (mode.moveWinPoint) {
      this.updateTempWinPoint(mouseX, mouseY);
    }
  }
  updateTempWinPoint(x, y) {
    let tx = Math.round(x / this.tileSize) * this.tileSize;
    let ty = Math.round(y / this.tileSize) * this.tileSize;
    this.futureWinPoint = { x: tx, y: ty };
  }

  adiquifyLasers() {
    if (this.lasers[this.latestLaserIdx] == null) {
      this.lasers[this.latestLaserIdx] = new Laser();
    }
  }
  updateTempMirrorDeletion(x, y) {
    let tx = Math.round(x / this.tileSize) * this.tileSize;
    let ty = Math.round(y / this.tileSize) * this.tileSize;
    for (let i = 0; i < this.mirrors.length; i++) {
      const m = this.mirrors[i];
      if (tx === m.x && ty === m.y) {
        m.mirrorToDel = true;
      } else {
        m.mirrorToDel = false;
      }
    }
  }

  updateTempMirror(x, y) {
    if (this.creationMirror === null) {
      this.creationMirror = {
        angle: 0,
      };
    }
    const angle = Math.atan2(y - this.creationMirror.y, x - this.creationMirror.x);
    if (this.creationMirror && !this.creationMirror.toBeRotated) {
      this.creationMirror.x = Math.round(x / this.tileSize) * this.tileSize;
      this.creationMirror.y = Math.round(y / this.tileSize) * this.tileSize;
      this.creationMirror.angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    }
    if (this.creationMirror.toBeRotated) {
      this.creationMirror.angle = this.keysDown.Control
        ? Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
        : angle;
    }
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (mode.createMirror) {
      if (!this.creationMirror) {
        return;
      }
      if (!this.creationMirror.toBeRotated) {
        this.creationMirror.toBeRotated = true;

        console.debug("clicked once");
      } else {
        console.debug("clicked twice");
        this.mirrors.push(this.creationMirror);
        this.creationMirror = null;
      }
    } else if (mode.deleteMirror) {
      let tx = Math.round(x / this.tileSize) * this.tileSize;
      let ty = Math.round(y / this.tileSize) * this.tileSize;

      let mirrorToDel = this.mirrors.findIndex((m) => tx === m.x && ty === m.y);
      if (mirrorToDel !== -1) {
        this.mirrors.splice(mirrorToDel, 1);
      }
    } else if (mode.moveWinPoint) {
      this.winPoint.x = this.futureWinPoint.x;
      this.winPoint.y = this.futureWinPoint.y;
    }
    this.saveData()
  }

  handleLaserCreation(e) {
    if (mode.play) {
      this.adiquifyLasers();
      if (e.type === "mousedown") {
        this.lasers[this.latestLaserIdx].hold(
          {
            x: this.player.x + Math.cos(this.player.angle) * this.player.size,
            y: this.player.y + Math.sin(this.player.angle) * this.player.size,
          },
          this.player.angle
        );
        this.player.locked = true;
      } else {
        this.lasers[this.latestLaserIdx].release();
        this.latestLaserIdx++;
        this.player.locked = false;
      }
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawTiles();
    this.drawPlayer();
    this.drawPoint();
    this.drawMirrors();
    this.updateLaserMirrorBounce();
    this.lasers.forEach((laser) => laser.render(this.ctx));
    this.deleteUnecessaryLasers();
    this.updateWinStatus();
    requestAnimationFrame(this.update.bind(this));
  }

  deleteUnecessaryLasers() {
    let uselessLasers = [];
    this.lasers.forEach((laser, i) => {
      if (this.isLaserOutOfSight(laser)) {
        uselessLasers.push(i);
      }
    });
    this.deleteLasers(uselessLasers);
  }

  deleteLasers(idxs) {
    idxs.forEach((idx) => {
      this.lasers.splice(idx, 1);
      this.latestLaserIdx -= 1;
    });
  }

  updateWinStatus() {
    for (let i = 0; i < this.lasers.length; i++) {
      const laser = this.lasers[i];
      if (laser.points) {
        let lastpoint = laser.points[laser.points.length - 1];
        if (
          lineCircIntersection(
            [
              { x: lastpoint.x, y: lastpoint.y },
              { x: laser.x, y: laser.y },
            ],
            { x: this.winPoint.x, y: this.winPoint.y, r: this.winPoint.radius }
          )
        ) {
          !this.isWon && createWindow("You win!!!");
          this.isWon = true
          setTimeout((() => this.isWon = false).bind(this), 3000)
        }
      }
    }
  }

  drawTiles() {
    this.ctx.strokeStyle = "white";
    for (let x = 0; x < this.tilesX; x++) {
      for (let y = 0; y < this.tilesY; y++) {
        this.ctx.strokeRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }

  drawPlayer() {
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.rotate(this.player.angle + Math.PI / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.player.size);
    this.ctx.lineTo(7, 0);
    this.ctx.lineTo(-7, 0);
    this.ctx.closePath();
    this.ctx.fillStyle = "green";
    this.ctx.fill();
    if (this.player.sprite.loaded) {
      this.ctx.drawImage(
        this.player.sprite.img,
        -this.player.sprite.img.width / 2,
        -this.player.sprite.img.height / 2
      );
    } else {
      this.ctx.font = `${this.player.size}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("😃", 0, 0);
    }

    this.ctx.restore();
  }

  drawPoint() {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(this.winPoint.x, this.winPoint.y, this.winPoint.radius, 0, Math.PI * 2);
    this.ctx.fill();
    if (mode.moveWinPoint && this.futureWinPoint) {
      this.ctx.fillStyle = "#ff000080";
      this.ctx.beginPath();
      this.ctx.arc(
        this.futureWinPoint.x,
        this.futureWinPoint.y,
        this.winPoint.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }

  drawMirrors() {
    const drawMirror = (mirror, opacity) => {
      this.ctx.save();
      this.ctx.translate(mirror.x, mirror.y);
      this.ctx.rotate(mirror.angle);
      if (mirror.mirrorToDel) {
        this.ctx.fillStyle = "#ff0000";
      } else this.ctx.fillStyle = "#c0c0c0" + (opacity ? opacity : "ff");
      // console.log(this.ctx.fillStyle);
      this.ctx.fillRect(
        -this.mirrorWidth / 2,
        -this.mirrorHeight / 2,
        this.mirrorWidth,
        this.mirrorHeight
      );
      this.ctx.restore();
    };
    // console.log(this.ctx.fillStyle);
    this.mirrors.forEach((m) => drawMirror(m));
    if (this.creationMirror) {
      drawMirror(this.creationMirror, !this.creationMirror.toBeRotated ? "80" : "f0");
    }
  }

  checkCollision(laser, point) {
    const dx = laser.x - point.x;
    const dy = laser.y - point.y;
    return Math.sqrt(dx * dx + dy * dy) < point.size;
  }

  getLaserMirrorCollision(laser) {
    return this.mirrors.find((mirror) => {
      return isPointInPolygon(
        box2points(mirror.x, mirror.y, this.mirrorWidth, this.mirrorHeight, mirror.angle),
        { x: laser.x, y: laser.y }
      );
    });
  }

  updateLaserMirrorBounce() {
    // if (Date.now() - this.gameStartTime >= 1000) {
    //   this.laser.bounce(deg2Rad(-45))
    // }
    this.lasers.forEach((laser) => {
      let mirror = this.getLaserMirrorCollision(laser);
      if (mirror) {
        const intersectionData = getIntersectionData(
          [
            {
              x: laser.points[laser.points.length - 1].x,
              y: laser.points[laser.points.length - 1].y,
            },
            {
              x: laser.x,
              y: laser.y,
            },
          ],
          {
            x: mirror.x,
            y: mirror.y,
            r: mirror.angle,
            width: this.mirrorWidth,
            height: this.mirrorHeight,
          }
        );
        if (intersectionData) {
          laser.x = intersectionData.point.x;
          laser.y = intersectionData.point.y;
          laser.bounce(
            this.reflectAngle(
              Math.atan2(
                laser.points[laser.points.length - 1].y - laser.y,
                laser.points[laser.points.length - 1].x - laser.x
              ),
              intersectionData.faceAngle
              // mirror.angle
            )
          );
        }
      }
      if (laser.released) {
        let mirror = this.getLaserMirrorCollision(laser.points[0]);
        if (mirror) {
          laser.points.shift();
          if (laser.points && laser.points[0]) {
            laser.points[0].moving = true;
          }
        }
      }
    });
  }

  reflectAngle(reflectAngle, baseAngle) {
    return baseAngle * 2 + Math.PI - reflectAngle;
    // return reflectAngle + Math.PI - 2 * baseAngle + Math.PI;
  }

  isLaserOutOfSight(laser = this.lasers[0]) {
    if (laser.points) {
      return laser.points.every((p) => {
        return p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height;
      });
    }
  }
  compileLevelData() {
    return JSON.stringify({
      mirrors: this.mirrors.map((m) => {
        delete m.toBeRotated;
        delete m.mirrorToDel;
        return m;
      }),
      winPoint: this.winPoint,
    });
  }

  copyLevelData() {
    navigator.clipboard.writeText(this.compileLevelData());
    console.debug("copied!");
  }

  loadLevelJson(
    json = {
      mirrors: [{ angle: 0.3142318990843383, "x": 400, "y": 250 }],
      winPoint: { x: 500, y: 100, radius: 10 },
    }
  ) {
    this.winPoint = json.winPoint;
    this.mirrors = json.mirrors;
  }

  loadData() {
    let data = localStorage.getItem('zap-pot-level-maker')
    if (data) {
      this.loadLevelJson(JSON.parse(data))
    }
  }

  saveData() {
    localStorage.setItem('zap-pot-level-maker', this.compileLevelData())
    console.debug('saved level data to the localStorage successfully')
  }
}

class Laser {
  hold(startPoint = { x: 0, y: 0 }, angle = deg2Rad(-45)) {
    if (!this.laserStarted) {
      this.x = startPoint.x;
      this.y = startPoint.y;
      this.points = [{ ...startPoint, moving: false, angle }];
      this.laserStarted = true;
      this.angle = angle;
      this.speed = 5;
    }
  }
  release() {
    if (this.laserStarted) {
      this.points[0].moving = true;
      this.released = true;
    }
  }
  render(ctx) {
    if (this.laserStarted) {
      this.directLaser();
      this.renderLaser(ctx);
    }
  }
  directLaser() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }
  directPoint(p) {
    p.x += Math.cos(p.angle) * this.speed * p.moving;
    p.y += Math.sin(p.angle) * this.speed * p.moving;
  }
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  renderLaser(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.directPoint(this.points[0]);
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      ctx.lineTo(p.x, p.y);
      this.directPoint(p);
    }
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.lineJoin = "bevel";
    ctx.stroke();
    ctx.shadowColor = "green";
    ctx.shadowBlur = 12;
    ctx.s;
    ctx.restore();
  }
  bounce(angle) {
    this.points.push({ angle: angle, moving: false, x: this.x, y: this.y });
    this.angle = angle;
  }
}

class Sprite {
  constructor(imgsrc, anonymousCrossorigin) {
    this.img = new Image();
    this.img.src = imgsrc;
    if (anonymousCrossorigin == null || anonymousCrossorigin === true) {
      this.img.crossOrigin = "anonymous";
    }
    this.img.onload = (() => {
      this.loaded = true;
    }).bind(this);
  }
}

const canvas = document.getElementById("gameCanvas");
const game = new App(canvas);
// game.loadLevelJson(
//   JSON.parse(
//     `{"mirrors":[{"angle":2.356194490192345,"x":400,"y":200},{"angle":2.356194490192345,"x":200,"y":200},{"angle":0.31851257326823323,"x":-150,"y":0},{"angle":0.7853981633974483,"x":200,"y":300},{"angle":2.356194490192345,"x":400,"y":300}],"winPoint":{"x":450,"y":300,"radius":10}}`
//   )
// );
  // JSON.parse(
  //   `{"mirrors":[{"angle":2.356194490192345,"x":400,"y":200},{"angle":0.7853981633974483,"x":350,"y":200},{"angle":0.7853981633974483,"x":350,"y":100},{"angle":2.356194490192345,"x":300,"y":100}],"winPoint":{"x":350,"y":600,"radius":10}}`
  // )
// showDoneMenu()
