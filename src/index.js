// is there a way to read folder directory files without node.js?
const canvas = document.getElementById("gameCanvas");
let game = new App(canvas);

const levelBox = document.getElementById("levels");
const extraLevels = (function () {
  let saved = localStorage.getItem("local_levels");
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
})();
let levelsNum = -1;

async function updateLevelsNum() {
  // let dir = "levels/levelCount.txt";
  try {
    let rawFile = await fetch(`/zap-plot/levels/levelCount.txt`);
    if (rawFile.status === 404) {
      throw new Error("Load Failed!");
    } else {
      levelsNum = parseInt(await rawFile.text());
      console.log(levelsNum);  
    }
  } catch (err) {
    // console.log(err);
    levelsNum = parseInt(await (await fetch(`/levels/levelCount.txt`)).text());
  }
}

function renderLevels() {
  levelBox.innerHTML = "";
  for (let i = 0; i < levelsNum + extraLevels.length; i++) {
    levelBox.appendChild(
      str2elt(
        me(
          "div",
          {
            class: "level",
            "data-levelId": i,
            onclick: `playLevel(${i + 1});levelBox.style.display = 'none'`,
          },
          i + 1 + ""
        )
      )
    );
  }
  levelBox.appendChild(
    str2elt(
      me(
        "div",
        {
          class: "level",
          onclick: `showImportLevelMenu()`,
        },
        "+"
      )
    )
  );
}
(async function () {
  await updateLevelsNum();
  renderLevels();
  // playLevel(3)
})();

function showImportLevelMenu() {
  const w = str2elt(
    me("div", [
      me(
        "textarea",
        { style: "width: 100%;height: 7em;", placeholder: "Enter the level data here" },
        ""
      ),
      me("div", { class: "window-button", onclick: "importLevelData(this)" }, "Import"),
    ])
  );
  createWindow("Import level", w);
}

function importLevelData(elt) {
  let data;
  try {
    data = JSON.parse(elt.previousElementSibling.value);
  } catch (error) {
    console.log(error);
    return;
  }
  extraLevels.push(JSON.stringify(data));
  renderLevels();
  localStorage.setItem("local_levels", JSON.stringify(extraLevels));
  // console.log(extraLevels);
}

function showGameBox() {
  document.getElementById("game-box").style.display = "flex";
  document.getElementById("go-back").style.display = "flex";
}
function hideGameBox() {
  document.getElementById("game-box").style.display = "none";
  document.getElementById("go-back").style.display = "none";
}

function resetGame() {
  // game = null;
  // return new Promise((res, rej) => {
  // setTimeout(() => {
  // game = new App(canvas);
  // game.init();
  showGameBox();
  //     res();
  //   }, 0);
  // });
}

function goBack() {
  hideGameBox();
  levelBox.style.display = "flex";
}

async function loadLevelData(levelNum) {
  // console.log(levelsNum, levelNum);
  // console.log(levelNum - levelsNum);
  if (levelNum > levelsNum) {
    return JSON.parse(extraLevels[levelNum - levelsNum - 1]);
  }
  let l;
  // try {
  //   game.loadLevelJson(await (await fetch(`/levels/level${levelNum}.json`)).json());
  // } catch (err) {
  //   game.loadLevelJson(
  //     await (await fetch(`/zap-plot/levels/level${levelNum}.json`)).json()
  //   );
  // }
  try {
    l = await (await fetch(`/zap-plot/levels/level${levelNum}.json`)).json();
  } catch (err) {
    l = await (await fetch(`/levels/level${levelNum}.json`)).json();
  }
  return l;
}

function setGameRight() {
  // const gameB = document.getElementById("game-box");
  showGameBox();
  // console.log(game.isWon);
  game.init();
  // console.log(game.isWon);
  if (!game.startedGameLoop) {
    game.startGameLoop();
    // console.log('started game loop');
  }
}
async function playLevel(levelNum) {
  if (levelNum > levelsNum + extraLevels.length) {
    createWindow(
      "Finished All the levels",
      str2elt(me("div", "Congrats, you've completed all the levels!"))
    );
    playLevel(levelNum - 1);
    return true;
  }
  setGameRight();
  game.level = levelNum;
  // game.isWon = false
  game.loadLevelJson(await loadLevelData(levelNum));
}
// async function playLevel(levelNum) {
//   await resetGame();
//   game.level = levelNum;
//   try {
//     game.loadLevelJson(await (await fetch(`/levels/level${levelNum}.json`)).json());
//   } catch (err) {
//     game.loadLevelJson(
//       await (await fetch(`/zap-plot/levels/level${levelNum}.json`)).json()
//     );
//   }
// }
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
