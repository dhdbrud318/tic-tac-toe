const form = document.querySelector("form");
const gameBoard = document.querySelector(".play-game");
const gameBoardOverlay = document.querySelector(".play-game__overlay");
const overlay = document.querySelector(".overlay");
const boardBoxes = document.querySelectorAll(".play-game__box");

// to identify player tokens & turns
const tokenXSelected = document.querySelector('input[type="radio"]');

// to update score sections
const scoreBoard = document.querySelectorAll(".play-game__score");
let p1ScoreBoard, p2ScoreBoard;

// update & reset winner window
const playerResultMsg = document.querySelector(".overlay__msg");
const winnerText = document.querySelector(".overlay__winner-text");
const winnerIcon = document.querySelector(".overlay__winner-icon");

// game control buttons
const [quitBtn, nextBtn, cancelBtn, restartBtn] =
  document.querySelectorAll(".overlay__btn");

// for restart button set up
const restartToggle = document.querySelector(".play-game__restart-btn");
const [gameoverBtns, restartBtns] = document.querySelectorAll(".overlay__btns");

// to update player turns
const currentTurnIcon = document.querySelector("#play-game__current-icon");

let playWithCPU = false;
const tie = { score: 0, isTied: true };
let isWinner;
let currentTurn = "x";
let moveCount = 0;
let isGameOver = false;
let tieScore = 0;
let winner;

const filledIconPath = (path = currentTurn) => `./assets/icon-${path}.svg`;
const outlineIconPath = (path = currentTurn) =>
  `./assets/icon-${path}-outline.svg`;

const player1 = new Player("player1");
const player2 = new Player("player2");

// object to store player info
function Player(playername, isCPU = false) {
  this.playername = playername;
  this.board = [0, 0, 0, 0, 0, 0, 0, 0];
  this.winningScore = 0;
  this.isCPU = isCPU;
  let token;

  this.restart = () => {
    this.board = [0, 0, 0, 0, 0, 0, 0, 0];
  };

  this.reset = () => {
    this.board = [0, 0, 0, 0, 0, 0, 0, 0];
    this.winningScore = 0;
    token = false;
  };

  Object.defineProperty(this, "token", {
    get: () => token,
    set: (value) => {
      token = value;
    },
  });
}

// set up game
function setPlayerToken() {
  player1.token = tokenXSelected.checked ? "x" : "o";
  player2.token = tokenXSelected.checked ? "o" : "x";

  // cpu must be player2
  if (playWithCPU) player2.isCPU = true;
}

function setScoreBoard(player) {
  // match title with playername
  const obj = document.querySelector(`#score-${player.token}`);
  if (playWithCPU && player.isCPU) obj.innerText = "cpu";
  else if (playWithCPU && !player.isCPU) obj.innerText = "you";
  else obj.innerText = player.playername;

  // assign correct score boards for players
  p1ScoreBoard = player1.token === "x" ? scoreBoard[0] : scoreBoard[2];
  p2ScoreBoard = player2.token === "x" ? scoreBoard[0] : scoreBoard[2];
}

function switchTurn() {
  currentTurn = currentTurn === "x" ? "o" : "x";

  // match current player turn with board
  currentTurnIcon.setAttribute("src", filledIconPath());
}

// control mouse movement
function mouseEnterBox(box) {
  const image = document.createElement("img");
  image.setAttribute("src", outlineIconPath());
  image.setAttribute("alt", currentTurn);
  box.appendChild(image);
}

function mouseLeaveBox(box) {
  box.removeChild(box.lastElementChild);
}

function mouseClickBox(box) {
  box.disabled = true;
  box.lastElementChild.setAttribute("src", filledIconPath());
}

// evaluate game
function checkWinner() {
  if (player1.board.includes(3)) {
    isGameOver = true;
    winner = player1;
  } else if (player2.board.includes(3)) {
    isGameOver = true;
    winner = player2;
  } else if (moveCount === 9) {
    isGameOver = true;
    winner = "tie";
  }
}

function setWinnerMsg() {
  if (winner === "tie") {
    playerResultMsg.innerText = "";
    winnerIcon.style.display = "none";
    winnerText.innerText = "round tied";
    return;
  }

  if (playWithCPU)
    playerResultMsg.innerText =
      winner === player1 ? "YOU WON!" : "OH NO, YOU LOST…";
  else playerResultMsg.innerText = `${winner.playername} WINS!`;

  winnerIcon.firstElementChild.setAttribute(
    "src",
    filledIconPath(winner.token)
  );
  winnerText.classList.add(`p--player${winner.token.toUpperCase()}`);
}

// display selection on the board
function fillBoard(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  let pd, sd;

  if (index === 0 || index === 4 || index === 8) pd = true;
  if (index === 2 || index === 4 || index === 6) sd = true;

  if (currentTurn === player1.token) calcBoard(player1);
  else calcBoard(player2);

  moveCount++;

  function calcBoard(player) {
    player.board[row]++;
    player.board[col + 3]++;

    if (pd) player.board[6]++;
    if (sd) player.board[7]++;
  }
}

function updateScores() {
  p1ScoreBoard.lastElementChild.innerText = player1.winningScore;
  p2ScoreBoard.lastElementChild.innerText = player2.winningScore;
  scoreBoard[1].lastElementChild.innerText = tieScore;
}

// restart game
function restartGame(quit = false) {
  currentTurn = "x";
  moveCount = 0;
  winner = null;
  isGameOver = false;
  if (!quit) {
    player1.restart();
    player2.restart();
  } else {
    player1.reset();
    player2.reset();
  }

  boardBoxes.forEach((s) => {
    if (s.hasChildNodes()) s.firstChild.remove();
    s.disabled = false;
  });

  currentTurnIcon.setAttribute("src", filledIconPath());
}

function resetOverlay() {
  playerResultMsg.innerText = "";
  winnerText.innerText = "takes the round";
  winnerIcon.style.display = "block";
  if (winner)
    winnerText.classList.remove(`p--player${winner.token.toUpperCase()}`);
}

// for cpu play
function cpuPlayIndex() {
  let index = Math.floor(Math.random() * 9);
  while (boardBoxes[index].disabled) index = Math.floor(Math.random() * 9);

  return index;
}

function cpuPlay() {
  gameBoardOverlay.classList.remove("invisible");
  setTimeout(
    () => {
      const index = cpuPlayIndex();

      mouseEnterBox(boardBoxes[index]);
      mouseClickBox(boardBoxes[index]);
      fillBoard(index);
      checkWinner();

      if (isGameOver) {
        setWinnerMsg();
        setTimeout(
          () => {
            overlay.classList.toggle("invisible");
          },
          700,
          this
        );
      } else {
        switchTurn();
      }

      gameBoardOverlay.classList.add("invisible");
    },
    700,
    this
  );
}

function cpuStart() {
  if (playWithCPU && player1.token === "o") cpuPlay();
}

// select player token and start game
form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.classList.toggle("invisible");
  gameBoard.classList.toggle("invisible");

  playWithCPU = e.submitter.id === "play-cpu";
  setPlayerToken();

  // set up score display board
  setScoreBoard(player1);
  setScoreBoard(player2);

  cpuStart();
});

// control mouse over the board
boardBoxes.forEach((s) => {
  s.addEventListener("mouseenter", () => {
    mouseEnterBox(s);
  });

  s.addEventListener("mouseleave", () => {
    mouseLeaveBox(s);
  });

  // reflect player's selections
  s.addEventListener("mouseup", () => {
    // update interface
    mouseClickBox(s);
    // update board array
    fillBoard(parseInt(s.value));
    // check winner
    checkWinner();

    if (isGameOver) {
      setWinnerMsg();
      setTimeout(
        () => {
          overlay.classList.toggle("invisible");
        },
        700,
        this
      );
    } else {
      switchTurn();
      if (playWithCPU) cpuPlay();
    }
  });
});

// control buttons
restartToggle.addEventListener("click", () => {
  gameoverBtns.classList.add("invisible");
  restartBtns.classList.remove("invisible");
  winnerIcon.style.display = "none";
  winnerText.innerText = "restart game?";
  overlay.classList.toggle("invisible");
});

nextBtn.addEventListener("click", () => {
  overlay.classList.toggle("invisible");
  updateScores();
  restartGame();
  resetOverlay();
  cpuStart();
});

quitBtn.addEventListener("click", () => {
  player1.winningScore = 0;
  player2.winningScore = 0;
  restartGame(true);
  updateScores();
  resetOverlay();

  tokenXSelected.checked = false;
  overlay.classList.toggle("invisible");
  gameBoard.classList.toggle("invisible");
  form.classList.toggle("invisible");
});

cancelBtn.addEventListener("click", () => {
  // winnerText.innerText = "takes the round";
  // winnerIcon.style.display = "block";
  resetOverlay();
  overlay.classList.toggle("invisible");
  gameoverBtns.classList.remove("invisible");
  restartBtns.classList.add("invisible");
});

restartBtn.addEventListener("click", () => {
  overlay.classList.toggle("invisible");
  gameoverBtns.classList.remove("invisible");
  restartBtns.classList.add("invisible");
  isGameOver = true;
  resetOverlay();
  restartGame();
  cpuStart();
});
