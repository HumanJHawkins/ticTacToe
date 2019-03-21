// Initialize global constants/statics. Load word list, etc.
let GAME_STATE = Object.freeze({
    "ERROR": 0,
    "INPROGRESS": 1,
    "CATS": 2,
    "WIN": 10
});

let CELL_STATE = Object.freeze({
    "CATS": -10,    // Cannot contribute to a win
    "PLAYER_X": -1, // Also used for player turn
    "EMPTY": 0,
    "PLAYER_O": 1,  // Also used for player turn
    "WIN_X": 9,     // GAME_STATE.WIN + CELL_STATE.PLAYER_X
    "WIN_O": 11     // GAME_STATE.WIN + CELL_STATE.PLAYER_O
});


let cellClasses = ['top left', 'top', 'top right',
    'left', '', 'right',
    'bottom left', 'bottom', 'bottom right'];

let cellStates = [CELL_STATE.EMPTY, CELL_STATE.EMPTY, CELL_STATE.EMPTY,
    CELL_STATE.EMPTY, CELL_STATE.EMPTY, CELL_STATE.EMPTY,
    CELL_STATE.EMPTY, CELL_STATE.EMPTY, CELL_STATE.EMPTY];

let gameState;
let gameDifficulty;
let playerTurn;
let emptyCells;

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

// Function declarations
function newGame() {
    emptyCells = 9;
    playerTurn = CELL_STATE.PLAYER_X;
    setGameState(GAME_STATE.INPROGRESS);
    handleDisplaySize();        // Handles full screen draw.
    handleDisplayRefresh();
    updateEnabledState();       // Requires preference controls created in handleDisplaySize().

    logOut('newGame playerTurn', playerTurn);
    logOut('newGame gameState', gameState);
    logOut('newGame windowWidth', windowWidth);
    logOut('newGame windowHeight', windowHeight);
}

function logOut(desc = '', data = '') {
    let seperator = ': ';
    if (desc === '' || data === '') {
        seperator = '';
    }
    console.log(desc + seperator + data)
}


function handleDisplaySize() {
    // Window dimensions in pixels. Although we use view width for almost everything, most decisions about layout are
    //   best made based on actual pixel count, or aspect ratio.
    windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}

function handleDisplayRefresh() {
    // Theory: Gameboard is square, so ideal layout depends only on which screen/window dimwension is larger.
    //   of height / width.
    //
    // See also:
    //   https://docs.microsoft.com/en-us/windows/uwp/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    let pageHTML;

    // TO DO: There is a race condition between loading the css and updating it. Make this wait until css is available.
    // Temp kluge:
    sleep(250);

    if (windowHeight > windowWidth) {
        // Tall Layout
        logOut('Using tall layout.');

        updateStylesheet("#divGameboard", "float", "none");
        updateStylesheet("#divGameboard", "margin-right", "0vw");
        pageHTML =
            '<h1>Tic-Tac-Toe' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/preferences.png" alt="Preferences" onClick="showPreferences()" class="iconButtonImage"/>' +
            '<img src="image/help.png" alt="Help" onClick="showHelp()" class="iconButtonImage"/>' +
            '<img src="image/about.png" alt="About" onClick="showAbout()" class="iconButtonImage"/>' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/newGame.png" alt="New Game" onClick="resetGame()" class="iconButtonImage"/>' +
            '</h1><div id="divGameboard"></div>';
    } else {
        // Wide Layout
        logOut('Using wide layout.');
        updateStylesheet("#divGameboard", "float", "left");
        updateStylesheet("#divGameboard", "margin-right", "2vw");
        pageHTML = '<div id="divGameboard"></div>' +
            '<h1>Tic-Tac-Toe' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/preferences.png" alt="Preferences" onClick="showPreferences()" class="iconButtonImage"/>' +
            '<img src="image/help.png" alt="Help" onClick="showHelp()" class="iconButtonImage"/>' +
            '<img src="image/about.png" alt="About" onClick="showAbout()" class="iconButtonImage"/>' +
            '<img src="image/blank.png" alt="" class="iconButtonSpacer"/>' +
            '<img src="image/newGame.png" alt="New Game" onClick="resetGame()" class="iconButtonImage"/>' +
            '</h1>';
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
    console.log(document.getElementById('divGameboard').innerHTML);

}

function updateGameboard() {
    logOut('updateGameboard gameState', gameState);
    for (let i = 0; i < cellStates.length; i++) {
        logOut('updateGameboard cellStates[' + i + ']', cellStates[i]);
    }

    let gameboardHTML = '<grid-container>\n';
    if (gameState === GAME_STATE.INPROGRESS) {
        for (let i = 0; i < cellStates.length; i++) {
            if (cellStates[i] === CELL_STATE.EMPTY) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div class="hidden">-</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.PLAYER_X) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div>X</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.PLAYER_O) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div>O</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.CATS) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '" class="hidden"><div>:</div></grid-item>\n';
            } else {
                alert('Error: GAME_STATE === IN_PROGRESS, but CELL_STATE shows game is won (or other incompatible ' +
                    'state).');
            }
        }
    } else if (gameState === GAME_STATE.WIN) {
        for (let i = 0; i < cellStates.length; i++) {
            if (cellStates[i] === CELL_STATE.EMPTY) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div class="hidden">-</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.PLAYER_X) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div>X</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.PLAYER_O) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div>O</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.WIN_X) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter gameWin" id="cell' + i + '"><div>X</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.WIN_O) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter gameWin" id="cell' + i + '"><div>O</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.CATS) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '" class="hidden"><div>:</div></grid-item>\n';
            }
        }
    } else if (gameState === GAME_STATE.CATS) {
        for (let i = 0; i < cellStates.length; i++) {
            // There should be no case where a cell is empty at this point.
            if (cellStates[i] === CELL_STATE.EMPTY) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div class="hidden">-</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.PLAYER_X) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div>X</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.PLAYER_O) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div>O</div></grid-item>\n';
            } else if (cellStates[i] === CELL_STATE.CATS) {
                gameboardHTML = gameboardHTML +
                    '<grid-item onclick="handleMark(' + i + ')" class="' + cellClasses[i] +
                    ' gameLetter" id="cell' + i + '"><div>:</div></grid-item>\n';
            } else {
                alert('Error: GAME_STATE === CATS, but CELL_STATE shows game is won (or other incompatible ' +
                    'state).');
            }
        }
    }

    gameboardHTML = gameboardHTML + '</grid-container>';
    document.getElementById('divGameboard').innerHTML = gameboardHTML;
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

function setGameState(newGameState) {
    // Add error check that input is actually a game state.
    gameState = newGameState;
}

function updateEnabledState() {
    // Relying on the preferences button handling to prevent getting here without warning. So default to enabled.
    document.getElementById("gameDifficulty").disabled = false;
}

function handleMark(cellNumber) {
    logOut('handleMark gameState', gameState);
    logOut('handleMark cellStates[' + cellNumber + ']', cellStates[cellNumber]);

    // Ignore marks when game over or the cell is already marked, etc.
    if (gameState !== GAME_STATE.INPROGRESS ||
        (cellStates[cellNumber] !== CELL_STATE.EMPTY && cellStates[cellNumber] !== CELL_STATE.CATS)) {
        return;
    }

    cellStates[cellNumber] = playerTurn;    // Player turn is tracked by giving the player an appropriate CELL_STATE.
    emptyCells--;

    if (!updateWinStates()) {
        playerTurn = -playerTurn;
    }

    updateCatsStates();
    handleDisplayRefresh();
}

function updateWinStates() {
    // Marked cellStates are either 1 or -1, and no CELL_STATE is 2 or 3. So, if the absolute value of the sum of any
    //   row is 3, it is a winning row.
    //
    // playerTurn contains CELL_STATE for player. Adding GAME_STATE to this number results in CELL_STATE.WIN for
    // appropriate player.
    if (Math.abs(cellStates[0] + cellStates[1] + cellStates[2]) === 3) {
        cellStates[0] = cellStates[1] = cellStates[2] = playerTurn + GAME_STATE.WIN;
    }

    if (Math.abs(cellStates[0] + cellStates[3] + cellStates[6]) === 3) {
        cellStates[0] = cellStates[3] = cellStates[6] = playerTurn + GAME_STATE.WIN;
    }

    if (Math.abs(cellStates[0] + cellStates[4] + cellStates[8]) === 3) {
        cellStates[0] = cellStates[4] = cellStates[8] = playerTurn + GAME_STATE.WIN;
    }

    if (Math.abs(cellStates[1] + cellStates[4] + cellStates[7]) === 3) {
        cellStates[1] = cellStates[4] = cellStates[7] = playerTurn + GAME_STATE.WIN;
    }

    if (Math.abs(cellStates[2] + cellStates[4] + cellStates[6]) === 3) {
        cellStates[2] = cellStates[4] = cellStates[6] = playerTurn + GAME_STATE.WIN;
    }

    if (Math.abs(cellStates[2] + cellStates[5] + cellStates[8]) === 3) {
        cellStates[2] = cellStates[5] = cellStates[8] = playerTurn + GAME_STATE.WIN;
    }

    if (Math.abs(cellStates[3] + cellStates[4] + cellStates[5]) === 3) {
        cellStates[3] = cellStates[4] = cellStates[5] = playerTurn + GAME_STATE.WIN;
    }

    if (Math.abs(cellStates[6] + cellStates[7] + cellStates[8]) === 3) {
        cellStates[6] = cellStates[7] = cellStates[8] = playerTurn + GAME_STATE.WIN;
    }

    if (cellStates.find(function (el) {
        return el >= CELL_STATE.WIN_X;
    }) >= CELL_STATE.WIN_X) {
        updateGameState(GAME_STATE.WIN);
        return true;
    } else {
        return false;
    }
}

function updateCatsStates() {
    // If the game is won, all empty cells become equivalent to CATS cells (not potentially winning).
    if (cellStates.find(function (el) {
        return el === CELL_STATE.WIN;
    }) !== undefined) {
        for (let i = 0; i < cellStates.length; i++) {
            if (cellStates[i] === CELL_STATE.EMPTY) {
                cellStates[i] = CELL_STATE.CATS
            }
        }
    }

    // TO DO: Also handle the case where two cells are empty in a row, but due to player turn and limited moves, there
    // is no case where the game can be won.

    // For the purpose of this game, we'll define "CATS" CELL_STATUS to mean a cell that cannot be used to win the game.
    // Therefore, a cell where all related rows contain one of each mark is a "CATS" cell, to be used to determine if
    // this is a "CATS" game.
    //
    // NOTE: Due to CELL_STATE.PLAYER_X and CELL_STATE.PLAYER_O being 1 and -1, if either cell on the same row is not
    // empty, and the sum of those two other cell states is not zero, then we know the row in question has one of each
    // mark, therefore is a CATS cell.

    // Cell 0 concerns (1,2) (3,6) (4,8)
    if (cellStates[0] === CELL_STATE.EMPTY &&
        (cellStates[1] !== CELL_STATE.EMPTY && cellStates[1] + cellStates[2] === 0) &&
        (cellStates[3] !== CELL_STATE.EMPTY && cellStates[3] + cellStates[6] === 0) &&
        (cellStates[4] !== CELL_STATE.EMPTY && cellStates[4] + cellStates[8] === 0)
    ) {
        cellStates[0] = CELL_STATE.CATS;
    }

    // Cell 1 concerns (0,2) (4,7)
    if (cellStates[1] === CELL_STATE.EMPTY &&
        (cellStates[0] !== CELL_STATE.EMPTY && cellStates[0] + cellStates[2] === 0) &&
        (cellStates[4] !== CELL_STATE.EMPTY && cellStates[4] + cellStates[7] === 0)
    ) {
        cellStates[1] = CELL_STATE.CATS;
    }

    // Cell 2 concerns (0,1) (5,8) (4,6)
    if (cellStates[2] === CELL_STATE.EMPTY &&
        (cellStates[0] !== CELL_STATE.EMPTY && cellStates[0] + cellStates[1] === 0) &&
        (cellStates[5] !== CELL_STATE.EMPTY && cellStates[5] + cellStates[8] === 0) &&
        (cellStates[4] !== CELL_STATE.EMPTY && cellStates[4] + cellStates[6] === 0)
    ) {
        cellStates[2] = CELL_STATE.CATS;
    }

    // Cell 3 concerns (0,6) (4,7)
    if (cellStates[3] === CELL_STATE.EMPTY &&
        (cellStates[0] !== CELL_STATE.EMPTY && cellStates[0] + cellStates[6] === 0) &&
        (cellStates[4] !== CELL_STATE.EMPTY && cellStates[4] + cellStates[7] === 0)
    ) {
        cellStates[3] = CELL_STATE.CATS;
    }

    // Cell 4 concerns (0,8) (1,7) (2,6) (3,5)
    if (cellStates[4] === CELL_STATE.EMPTY &&
        (cellStates[0] !== CELL_STATE.EMPTY && cellStates[0] + cellStates[8] === 0) &&
        (cellStates[1] !== CELL_STATE.EMPTY && cellStates[1] + cellStates[7] === 0) &&
        (cellStates[2] !== CELL_STATE.EMPTY && cellStates[2] + cellStates[6] === 0) &&
        (cellStates[3] !== CELL_STATE.EMPTY && cellStates[3] + cellStates[5] === 0)
    ) {
        cellStates[4] = CELL_STATE.CATS;
    }

    // Cell 5 concerns (2,8) (3,4)
    if (cellStates[5] === CELL_STATE.EMPTY &&
        (cellStates[2] !== CELL_STATE.EMPTY && cellStates[2] + cellStates[8] === 0) &&
        (cellStates[3] !== CELL_STATE.EMPTY && cellStates[3] + cellStates[4] === 0)
    ) {
        cellStates[5] = CELL_STATE.CATS;
    }

    // Cell 6 concerns (0,3) (2,4) (7,8)
    if (cellStates[6] === CELL_STATE.EMPTY &&
        (cellStates[0] !== CELL_STATE.EMPTY && cellStates[0] + cellStates[3] === 0) &&
        (cellStates[2] !== CELL_STATE.EMPTY && cellStates[2] + cellStates[4] === 0) &&
        (cellStates[7] !== CELL_STATE.EMPTY && cellStates[7] + cellStates[8] === 0)
    ) {
        cellStates[6] = CELL_STATE.CATS;
    }

    // Cell 7 concerns (1,4) (6,8)
    if (cellStates[7] === CELL_STATE.EMPTY &&
        (cellStates[1] !== CELL_STATE.EMPTY && cellStates[1] + cellStates[4] === 0) &&
        (cellStates[6] !== CELL_STATE.EMPTY && cellStates[6] + cellStates[8] === 0)
    ) {
        cellStates[7] = CELL_STATE.CATS;
    }

    // Cell 8 concerns (0,4) (2,5) (6,7)
    if (cellStates[8] === CELL_STATE.EMPTY &&
        (cellStates[0] !== CELL_STATE.EMPTY && cellStates[0] + cellStates[4] === 0) &&
        (cellStates[2] !== CELL_STATE.EMPTY && cellStates[2] + cellStates[5] === 0) &&
        (cellStates[6] !== CELL_STATE.EMPTY && cellStates[6] + cellStates[7] === 0)
    ) {
        cellStates[8] = CELL_STATE.CATS;
    }

    if (cellStates.find(function (el) {
        return el === CELL_STATE.EMPTY;
    }) === CELL_STATE.EMPTY) {
        return false;
    } else {
        updateGameState(GAME_STATE.CATS);
        return true;
    }
}

function updateGameState(newGameState) {
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

function updateStylesheet(selector, property, value) {
    // Adds or changes style in highest index of stylesheet.
    let theStylesheet = document.styleSheets[(document.styleSheets.length - 1)];
    for (let i = 0; i < theStylesheet.cssRules.length; i++) {
        let rule = theStylesheet.cssRules[i];
        if (rule.selectorText === selector) {
            rule.style[property] = value;
            return;
        }
    }
    theStylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
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


// We'll probably need this later...
function randIntBetween(randMin, randMax) {
    return Math.floor(Math.random() * (randMax - randMin + 1) + randMin);
}

function sleep(ms) {
    // From: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
    return new Promise(resolve => setTimeout(resolve, ms));
}

