// Globals
let GAME_STATE = Object.freeze({
    "ERROR": 0,
    "INPROGRESS": 1,
    "CATS": 2,
    "WIN": 10
});

let CELL_STATE = Object.freeze({
    "PLAYER_X": -1,   // Also used for player turn
    "EMPTY": 0,
    "PLAYER_O": 1,    // Also used for player turn
    "WIN_X": 9,    // GAME_STATE.WIN + CELL_STATE.PLAYER_X
    "WIN_O": 11    // GAME_STATE.WIN + CELL_STATE.PLAYER_O
});

let cells = [
    {state: CELL_STATE.EMPTY, class: 'top left', inRows: [[1, 2], [3, 6], [4, 8]]},
    {state: CELL_STATE.EMPTY, class: 'top', inRows: [[0, 1], [4, 7]]},
    {state: CELL_STATE.EMPTY, class: 'top right', inRows: [[0, 1], [4, 6], [5, 8]]},
    {state: CELL_STATE.EMPTY, class: 'left', inRows: [[0, 6], [4, 5]]},
    {state: CELL_STATE.EMPTY, class: '', inRows: [[0, 8], [1, 7], [2, 6], [3, 5]]},
    {state: CELL_STATE.EMPTY, class: 'right', inRows: [[2, 8], [3, 4]]},
    {state: CELL_STATE.EMPTY, class: 'bottom left', inRows: [[0, 3], [7, 8]]},
    {state: CELL_STATE.EMPTY, class: 'bottom', inRows: [[1, 4], [6, 8]]},
    {state: CELL_STATE.EMPTY, class: 'bottom right', inRows: [[0, 4], [2, 5], [6, 7]]},
];

let gameState;
let gameDifficulty;
let playerTurn;

let windowHeight;
let windowWidth;

let dialogPreferences;
let buttonPreferences;
let buttonClosePreferences;
let dialogHelp;
let buttonHelp;
let buttonCloseHelp;
let dialogAbout;
let buttonAbout;
let buttonCloseAbout;

newGame();

function newGame() {
    playerTurn = CELL_STATE.PLAYER_X;

    for (let i = 0; i < cells.length; i++) {
        cells[i].state = CELL_STATE.EMPTY;
    }

    setGameState(GAME_STATE.INPROGRESS);
    handleDisplaySize();        // Handles full screen draw.
    handleDisplayRefresh();
    updateEnabledState();       // Requires preference controls created in handleDisplaySize().
}

function logOut(desc = '', data = '') {
    let separator = ': ';
    if (desc === '' || data === '') {
        separator = '';
    }
    console.log(desc + separator + data)
}


function handleDisplaySize() {
    // Window dimensions in pixels. Although we use view width for almost everything, most decisions about layout are
    //   best made based on actual pixel count, or aspect ratio.
    windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}

function handleDisplayRefresh() {
    let pageHTML;
    let controlsHTML = '<h1>Tic-Tac-Toe' +
        '<span class="nowrap"><img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
        '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
        '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
        '<img src="image/preferences.png" alt="Preferences" onClick="showPreferences()" class="iconButtonImage"/>' +
        '<img src="image/help.png" alt="Help" onClick="showHelp()" class="iconButtonImage"/>' +
        '<img src="image/about.png" alt="About" onClick="showAbout()" class="iconButtonImage"/>' +
        '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
        '<img src="image/newGame.png" alt="New Game" onClick="resetGame()" class="iconButtonImage"/>' +
        '</span></h1>';

    //   https://docs.microsoft.com/en-us/windows/uwp/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    let heightWidthRatio = windowHeight / windowWidth;
    if (heightWidthRatio > .5) {
        // Tall Layout
        logOut('Using tall layout.');
        updateStylesheet("grid-container", "float", "none");
        updateStylesheet("grid-container", "width", "80vw");
        updateStylesheet("grid-container", "height", "80vw");
        updateStylesheet("grid-container", "max-width", "70vh");
        updateStylesheet("grid-container", "max-height", "70vh");
        updateStylesheet("grid-container", "margin", "auto");
        updateStylesheet("grid-container", "padding-top", "5vw");
        pageHTML = controlsHTML + '<grid-container id="gridGameboard"></grid-container>';
    } else {
        // Wide Layout
        logOut('Using wide layout.');
        updateStylesheet("grid-container", "float", "left");
        updateStylesheet("grid-container", "width", "80vh");
        updateStylesheet("grid-container", "height", "80vh");
        updateStylesheet("grid-container", "max-width", "50vw");
        updateStylesheet("grid-container", "max-height", "50vw");
        updateStylesheet("grid-container", "margin", "5vh default 10vh 5vh");
        updateStylesheet("grid-container", "padding-top", "5vh");
        pageHTML = '<grid-container id="gridGameboard"></grid-container>' + controlsHTML;
    }

    document.getElementById('entirePage').innerHTML = pageHTML;

    dialogPreferences = document.getElementById('preferences');
    buttonPreferences = document.getElementById("btnPreferences");
    buttonClosePreferences = document.getElementById("btnClosePreferences");
    dialogHelp = document.getElementById('help');
    buttonHelp = document.getElementById("btnHelp");
    buttonCloseHelp = document.getElementById("btnCloseHelp");
    dialogAbout = document.getElementById('about');
    buttonAbout = document.getElementById("btnAbout");
    buttonCloseAbout = document.getElementById("btnCloseAbout");

    updateGameboard();
}

function updateGameboard() {
    let addClass = '';
    if (gameState === GAME_STATE.CATS) {
        addClass = ' gameTie';
    }

    let gameboardHTML = '';
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].state === CELL_STATE.EMPTY) {
            gameboardHTML += '<grid-item onclick="handleMark(' + i + ')" class="' + cells[i].class + ' gameLetter' + addClass + '" id="cell' + i + '"><div class="hidden">W</div></grid-item>\n';
        } else if (cells[i].state === CELL_STATE.PLAYER_X) {
            gameboardHTML +=
                '<grid-item onclick="handleMark(' + i + ')" class="' + cells[i].class +
                ' gameLetter' + addClass + '" id="cell' + i + '"><div>X</div></grid-item>\n';
        } else if (cells[i].state === CELL_STATE.PLAYER_O) {
            gameboardHTML = gameboardHTML +
                '<grid-item onclick="handleMark(' + i + ')" class="' + cells[i].class +
                ' gameLetter' + addClass + '" id="cell' + i + '"><div>O</div></grid-item>\n';
        } else if (cells[i].state === CELL_STATE.WIN_X) {
            gameboardHTML = gameboardHTML +
                '<grid-item onclick="handleMark(' + i + ')" class="' + cells[i].class +
                ' gameLetter gameWin" id="cell' + i + '"><div>X</div></grid-item>\n';
        } else if (cells[i].state === CELL_STATE.WIN_O) {
            gameboardHTML = gameboardHTML +
                '<grid-item onclick="handleMark(' + i + ')" class="' + cells[i].class +
                ' gameLetter gameWin" id="cell' + i + '"><div>O</div></grid-item>\n';
        } else {
            alert('Error: GAME_STATE === WIN, but CELL_STATE is ' + cells[i].state + ').');
        }
    }

logOut(gameboardHTML);
document.getElementById('gridGameboard').innerHTML = gameboardHTML;
}

function showPreferences() {
    dialogPreferences.style.display = 'block';
}

function showHelp() {
    dialogHelp.style.display = 'block';
}

function showAbout() {
    dialogAbout.style.display = 'block';
}

function updateEnabledState() {
    // Relying on the preferences button handling to prevent getting here without warning. So default to enabled.
    document.getElementById("gameDifficulty").disabled = false;
}

function handleMark(cellNumber) {
    logOut('handleMark gameState', gameState);
    logOut('handleMark cells[' + cellNumber + '].state', cells[cellNumber].state);

    // Ignore marks when game over or the cell is already marked, etc.
    if (gameState !== GAME_STATE.INPROGRESS ||
        (cells[cellNumber].state !== CELL_STATE.EMPTY)) {
        return;
    }

    cells[cellNumber].state = playerTurn;    // Player turn is tracked by giving the player an appropriate CELL_STATE.

    if (!updateWinStates()) {
        playerTurn = -playerTurn;
    }

    updateCatsState();
    handleDisplayRefresh();
}

function updateWinStates() {
    setRowWin(0, 1, 2);
    setRowWin(0, 3, 6);
    setRowWin(0, 4, 8);
    setRowWin(1, 4, 7);
    setRowWin(2, 4, 6);
    setRowWin(2, 5, 8);
    setRowWin(3, 4, 5);
    setRowWin(6, 7, 8);
}

function setRowWin(cellA, cellB, cellC) {
    // Marked cell states are either 1 or -1, and no CELL_STATE is 2 or 3. So, if the absolute value of the sum of any
    //   row is 3, it is a winning row.
    if (Math.abs(cells[cellA].state + cells[cellB].state + cells[cellC].state) === 3) {
        // playerTurn contains CELL_STATE for player. Adding GAME_STATE to this number results in CELL_STATE.WIN for
        // appropriate player.
        cells[cellA].state = cells[cellB].state = cells[cellC].state = playerTurn + GAME_STATE.WIN;
        setGameState(GAME_STATE.WIN);
    }
}

function updateCatsState() {
    // A winning game cannot be a cats game.
    if (gameState === GAME_STATE.WIN) return false;

    // See commits prior to 2019/03/26 for function identifying useless rows. Turned out not to be fun.
    // Players like to play to the end without the computer telling them it's going to be a cats game.
    // So, if any cell is not empty, it is not yet a cats game.
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].state === CELL_STATE.EMPTY) {
            return false;
        }
    }

    setGameState(GAME_STATE.CATS);
    return true;
}


function setGameState(newGameState) {
    // TO DO: Add check that the GAME_STATE input is valid.
    //  gameState = GAME_STATE.contains(newGameState) ? newGameState : GAME_STATE.ERROR;
    gameState = newGameState;
}


function resetGame() {
    // If game is in progress, confirm reset.
    let reset = true;
    if (gameState === GAME_STATE.INPROGRESS) {
        if (!confirm("This will reset your game in progress. Click 'OK' to confirm.")) {
            reset = false;
        }
    }

    if (reset) {
        // Don't reload the page. That would wipe preferences.
        newGame();
    }
}

// Based on https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Should do nothing if the default action has been cancelled
    }

    let handled = false;
    let theKey;

    if (event.key !== undefined) {
        // Use "key' if available as this is most standard.
        theKey = event.key.toUpperCase();
    }
    // else if (event.keyCode !== undefined) {
    //     // Where 'key' is unsupported, the deprecated 'keyCode' will usually work.
    //     alert('Key Code: ' + event.keyCode);
    //     if (event.keyCode === 13) {
    //         theKey = 'ENTER';
    //     } else {
    //         theKey = String.fromCharCode(event.keyCode);
    //     }
    // } else {
    //     // In theory, implementing handling by event.keyIdentifier could be required in some
    //     //  environments. But there is no evidence that this is needed, and no environment
    //     //  to test it has been identified.
    // }

    if (theKey.length === 1) {
        if (theKey >= "1" && theKey <= "9") {
            handleMark(theKey - 1); // Make cells 0-8 correspond to keypad 1-9
            handled = true;
        }
    } else if (theKey === 'ENTER' && event.shiftKey && event.ctrlKey) {
        resetGame();
    }

    if (handled) {
        // Suppress "double action" if event handled
        event.preventDefault();
    }
}, true);


addEventListener('resize', function () {
    handleDisplaySize();
    handleDisplayRefresh();
    // updateEnabledState();
});

window.onclick = function (event) {
    // When the user clicks anywhere outside of the dialogPreferences, close it
    if (event.target === dialogPreferences) {
        dialogPreferences.style.display = "none";
    }
    // Or help window
    if (event.target === dialogHelp) {
        dialogHelp.style.display = "none";
    }
    // Or about window
    if (event.target === dialogAbout) {
        dialogAbout.style.display = "none";
    }
};

function updateDifficulty() {
    if (gameState === GAME_STATE.INPROGRESS) {
        if (confirm("Apply this difficulty change to the current game?")) {
            // Dismiss the preferences dialog.
            dialogPreferences.style.display = "none";
            gameDifficulty = parseInt(document.getElementById('gameDifficulty').value);
            handleDisplayRefresh();
            return;
        } else {
            return;
        }
    }

    gameDifficulty = parseInt(document.getElementById('gameDifficulty').value);
    // drawHangman();
}


function updateStylesheet(selector, property, value) {
    // Adds or changes style in highest index of stylesheet.
    let theStylesheet = document.styleSheets[(document.styleSheets.length - 1)];
    let waitCount = 0;
    while (theStylesheet === undefined && waitCount < 4) {
        // Try again for up to 1 second if stylesheet wasn't loaded yet.
        waitCount++;
        sleep(250);
        theStylesheet = document.styleSheets[(document.styleSheets.length - 1)];
    }

    logOut('theStylesheet', theStylesheet);
    if (theStylesheet === undefined) {
        return false;
    }

    for (let i = 0; i < theStylesheet.cssRules.length; i++) {
        let rule = theStylesheet.cssRules[i];
        if (rule.selectorText === selector) {
            rule.style[property] = value;
            return true;
        }
    }
    theStylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
    return true;
}

// We'll probably need this later...
function randIntBetween(randMin, randMax) {
    return Math.floor(Math.random() * (randMax - randMin + 1) + randMin);
}
