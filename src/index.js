const canvas = document.getElementById("gameCanvas");
let game;

async function resetGame() {
  game = null;
  return new Promise((res, rej) => {
    setTimeout(() => {
      game = new App(canvas);
      game.init();
      document.getElementById("game-box").style.display = "flex";
      res();
    }, 0);
  });
}

async function playLevel(levelNum) {
  await resetGame();
  game.level = levelNum;
  console.log(levelNum);
  try {
    game.loadLevelJson(await (await fetch(`/levels/level${levelNum}.json`)).json());
  } finally {
    game.loadLevelJson(
      await (await fetch(`zap-plot/levels/level${levelNum}.json`)).json()
    );
  }
  console.log(game);
}
// playLevel(10)

// resetGame()
// game.loadLevelJson(
//   // JSON.parse(
//   //   `{"mirrors":[{"angle":2.356194490192345,"x":400,"y":200},{"angle":0.7853981633974483,"x":350,"y":200},{"angle":0.7853981633974483,"x":350,"y":100},{"angle":2.356194490192345,"x":300,"y":100}],"winPoint":{"x":300,"y":200,"radius":10}}`
//   // )
//   // JSON.parse(
//   //   `{"mirrors":[{"angle":2.356194490192345,"x":400,"y":200},{"angle":2.356194490192345,"x":200,"y":200},{"angle":0.31851257326823323,"x":-150,"y":0},{"angle":0.7853981633974483,"x":200,"y":300},{"angle":2.356194490192345,"x":400,"y":300},{"angle":2.356194490192345,"x":500,"y":300},{"angle":0.7853981633974483,"x":500,"y":200},{"angle":0.5280744484263598,"x":400,"y":450},{"angle":0,"x":600,"y":200},{"angle":0.9255770066340583,"x":700,"y":150},{"angle":0,"x":300,"y":150},{"angle":2.356194490192345,"x":200,"y":100},{"angle":1.9870656246518383,"x":100,"y":200},{"angle":2.659928976034932,"x":150,"y":250},{"angle":2.7032560937318353,"x":150,"y":100}],"winPoint":{"x":550,"y":350,"radius":10}}`
//   // )
//   JSON.parse(
//     `{"mirrors":[{"angle":2.356194490192345,"x":400,"y":200},{"angle":2.356194490192345,"x":200,"y":200},{"angle":0.31851257326823323,"x":-150,"y":0},{"angle":0.7853981633974483,"x":200,"y":300},{"angle":2.356194490192345,"x":400,"y":300},{"angle":2.356194490192345,"x":500,"y":300},{"angle":0.7853981633974483,"x":500,"y":200},{"angle":0.5280744484263598,"x":400,"y":450},{"angle":0,"x":600,"y":200},{"angle":0.9255770066340583,"x":700,"y":150},{"angle":0,"x":300,"y":150},{"angle":2.356194490192345,"x":200,"y":100},{"angle":1.9870656246518383,"x":100,"y":200},{"angle":2.659928976034932,"x":150,"y":250},{"angle":2.7032560937318353,"x":150,"y":100},{"angle":-0.5475799799646954,"x":0,"y":600},{"angle":0,"x":550,"y":300}],"winPoint":{"x":550,"y":350,"radius":10}}`
//   )
// );
