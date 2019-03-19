// Initialize global constants/statics. Load word list, etc.
let GAME_STATE = Object.freeze({
    "ERROR": 0,
    "INPROGRESS": 1,
    "CATS": 2,
    "WIN": 3
});

let CELL_STATE = Object.freeze({
    "CATS": -10,    // Cannot contribute to a win
    "PLAYER_X": -1, // Also used for player turn
    "EMPTY": 0,
    "PLAYER_O": 1,  // Also used for player turn
    "WIN": 10
});


let cellStates = [CELL_STATE.EMPTY,CELL_STATE.EMPTY,CELL_STATE.EMPTY,
                    CELL_STATE.EMPTY,CELL_STATE.EMPTY,CELL_STATE.EMPTY,
                    CELL_STATE.EMPTY,CELL_STATE.EMPTY,CELL_STATE.EMPTY];

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

// Function declarations
function newGame() {
    playerTurn = CELL_STATE.PLAYER_X;
    setGameState(GAME_STATE.INPROGRESS);
    handleDisplaySize();        // Handles full screen draw.
    handleDisplayRefresh();
    updateEnabledState();       // Requires preference controls created in handleDisplaySize().
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
    if (windowHeight > windowWidth) {
        // Tall Layout
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

    document.getElementById('divGameboard').innerHTML =
        '<grid-container>\n' +
        '    <grid-item onclick="handleMark(0)" class="top left"><span id="cell0" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(1)" class="top"><span id="cell1" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(2)" class="top right"><span id="cell2" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(3)" class="left"><span id="cell3" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(4)" ><span id="cell4" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(5)" class="right"><span id="cell5" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(6)" class="bottom left"><span id="cell6" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(7)" class="bottom"><span id="cell7" class="gameLetter"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(8)" class="bottom right"><span id="cell8" class="gameLetter"></span></grid-item>\n' +
        '</grid-container>';

    updateMarks();
}

function updateMarks() {
    if(gameState = GAME_STATE.INPROGRESS) {
        for (let i = 0; i < cellStates.length; i++) {
            if (cellStates[i] === CELL_STATE.EMPTY) {
                document.getElementById('cell' + i).parentElement.innerHTML =
                    '<span id="cell' + i + '" class="gameLetter hidden">-</span>';
            } else if (cellStates[i] === CELL_STATE.PLAYER_X) {
                document.getElementById('cell' + i).parentElement.innerHTML =
                    '<span id="cell' + i + '" class="gameLetter">X</span>';
            } else if (cellStates[i] === CELL_STATE.PLAYER_O) {
                document.getElementById('cell' + i).parentElement.innerHTML =
                    '<span id="cell' + i + '" class="gameLetter">O</span>';
            } else if (cellStates[i] === CELL_STATE.CATS) {
                document.getElementById('cell' + i).parentElement.innerHTML =
                    '<span id="cell' + i + '" class="gameLetter">:</span>';
            } else if (cellStates[i] === CELL_STATE.WIN) {
                document.getElementById('cell' + i).parentElement.innerHTML =
                    '<span id="cell' + i + '" class="gameLetter gameWin">:</span>';
            }
        }
    }
    // else if(gameState = GAME_STATE.WIN) {
    //     for (let i = 0; i < cellStates.length; i++) {
    //         if (cellStates[i] === CELL_STATE.EMPTY) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter hidden">-</span>';
    //         } else if (cellStates[i] === CELL_STATE.PLAYER_X) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter">X</span>';
    //         } else if (cellStates[i] === CELL_STATE.PLAYER_O) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter">O</span>';
    //         } else if (cellStates[i] === CELL_STATE.CATS) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter">:</span>';
    //         } else if (cellStates[i] === CELL_STATE.WIN) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter gameWin">:</span>';
    //         }
    //     }
    // } else if(gameState = GAME_STATE.CATS) {
    //     for (let i = 0; i < cellStates.length; i++) {
    //         if (cellStates[i] === CELL_STATE.EMPTY) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter hidden">-</span>';
    //         } else if (cellStates[i] === CELL_STATE.PLAYER_X) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter">X</span>';
    //         } else if (cellStates[i] === CELL_STATE.PLAYER_O) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter">O</span>';
    //         } else if (cellStates[i] === CELL_STATE.CATS) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter">:</span>';
    //         } else if (cellStates[i] === CELL_STATE.WIN) {
    //             document.getElementById('cell' + i).parentElement.innerHTML =
    //                 '<span id="cell' + i + '" class="gameLetter gameWin">:</span>';
    //         }
    //     }

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
    // Ignore marks when game over or the cell is already marked, etc.
    if (gameState !== GAME_STATE.INPROGRESS ||
        cellStates[cellNumber] === CELL_STATE.PLAYER_X ||
        cellStates[cellNumber] === CELL_STATE.PLAYER_O) {
        alert('cellStates[' + i + ']: ' + cellStates[cellNumber]);
        alert('gameState: ' + gameState);
        return;
    }

    cellStates[cellNumber] = playerTurn;    // Player turn is tracked by giving the player an appropriate CELL_STATE.

    if(!updateWinStates()) { playerTurn = -playerTurn; }

    updateCatsStates();
    handleDisplayRefresh();
}

function updateWinStates() {
    // Marked cellStates are either 1 or -1, and no CELL_STATE is 2 or 3. So, if the absolute value of the sum of any
    //   row is 3, it is a winning row.
    if(Math.abs(cellStates[0] + cellStates[1] + cellStates[2]) === 3) {
        cellStates[0] = cellStates[1] = cellStates[2] = CELL_STATE.WIN;
    }

    if(Math.abs(cellStates[0] + cellStates[3] + cellStates[6]) === 3) {
        cellStates[0] = cellStates[3] = cellStates[6] = CELL_STATE.WIN;
    }

    if(Math.abs(cellStates[0] + cellStates[4] + cellStates[8]) === 3) {
        cellStates[0] = cellStates[4] = cellStates[8] = CELL_STATE.WIN;
    }

    if(Math.abs(cellStates[1] + cellStates[4] + cellStates[7]) === 3) {
        cellStates[1] = cellStates[4] = cellStates[7] = CELL_STATE.WIN;
    }

    if(Math.abs(cellStates[2] + cellStates[4] + cellStates[6]) === 3) {
        cellStates[2] = cellStates[4] = cellStates[6] = CELL_STATE.WIN;
    }

    if(Math.abs(cellStates[2] + cellStates[5] + cellStates[8]) === 3) {
        cellStates[2] = cellStates[5] = cellStates[8] = CELL_STATE.WIN;
    }

    if(Math.abs(cellStates[3] + cellStates[4] + cellStates[5]) === 3) {
        cellStates[3] = cellStates[4] = cellStates[5] = CELL_STATE.WIN;
    }

    if(Math.abs(cellStates[6] + cellStates[7] + cellStates[8]) === 3) {
        cellStates[6] = cellStates[7] = cellStates[8] = CELL_STATE.WIN;
    }

    if(cellStates.find(function(el) { return el===CELL_STATE.WIN; }) === CELL_STATE.WIN) {
        updateGameState(GAME_STATE.WIN);
        return true;
    } else {
        return false;
    }
}

function updateCatsStates() {
    // If the game is won, all empty cells become equivalent to CATS cells (not potentially winning).
    if(cellStates.find(function(el) { return el===CELL_STATE.WIN; }) === CELL_STATE.WIN) {
        for(let i = 0; i < cellStates.length; i++) {
            if(cellStates[i] === CELL_STATE.EMPTY) {
                cellStates[i] = CELL_STATE.CATS
            }
        }
    }

    // It is impossible for two cells on a winnable line to both be "CATS" cells, or for "CATS" to exist with an empty
    //   cell. So only empty cells need to be tested, and only need to look for nearby empty cells to determins "CATS".
    if(cellStates[0] === CELL_STATE.EMPTY &&
        ((cellStates[1] !== CELL_STATE.EMPTY || cellStates[2] !== CELL_STATE.EMPTY) && cellStates[1] + cellStates[2] === 0) &&
        ((cellStates[3] !== CELL_STATE.EMPTY || cellStates[6] !== CELL_STATE.EMPTY) && cellStates[3] + cellStates[6] === 0) &&
        ((cellStates[4] !== CELL_STATE.EMPTY || cellStates[8] !== CELL_STATE.EMPTY) && cellStates[4] + cellStates[8] === 0)
    ) {
        cellStates[0] = CELL_STATE.CATS;
    }

    if(cellStates[1] === CELL_STATE.EMPTY &&
        ((cellStates[0] !== CELL_STATE.EMPTY || cellStates[2] !== CELL_STATE.EMPTY) && cellStates[0] + cellStates[2] === 0) &&
        ((cellStates[4] !== CELL_STATE.EMPTY || cellStates[7] !== CELL_STATE.EMPTY) && cellStates[4] + cellStates[7] === 0)
    ) {
        cellStates[1] = CELL_STATE.CATS;
    }

    if(cellStates[2] === CELL_STATE.EMPTY &&
        ((cellStates[0] !== CELL_STATE.EMPTY || cellStates[1] !== CELL_STATE.EMPTY) && cellStates[0] + cellStates[1] === 0) &&
        ((cellStates[5] !== CELL_STATE.EMPTY || cellStates[8] !== CELL_STATE.EMPTY) && cellStates[5] + cellStates[8] === 0) &&
        ((cellStates[4] !== CELL_STATE.EMPTY || cellStates[6] !== CELL_STATE.EMPTY) && cellStates[4] + cellStates[6] === 0)
    ) {
        cellStates[2] = CELL_STATE.CATS;
    }

    if(cellStates[3] === CELL_STATE.EMPTY &&
        ((cellStates[0] !== CELL_STATE.EMPTY || cellStates[6] !== CELL_STATE.EMPTY) && cellStates[0] + cellStates[6] === 0) &&
        ((cellStates[4] !== CELL_STATE.EMPTY || cellStates[7] !== CELL_STATE.EMPTY) && cellStates[4] + cellStates[7] === 0)
    ) {
        cellStates[3] = CELL_STATE.CATS;
    }

    if(cellStates[4] === CELL_STATE.EMPTY &&
        ((cellStates[0] !== CELL_STATE.EMPTY || cellStates[8] !== CELL_STATE.EMPTY) && cellStates[0] + cellStates[8] === 0) &&
        ((cellStates[1] !== CELL_STATE.EMPTY || cellStates[7] !== CELL_STATE.EMPTY) && cellStates[1] + cellStates[7] === 0) &&
        ((cellStates[2] !== CELL_STATE.EMPTY || cellStates[6] !== CELL_STATE.EMPTY) && cellStates[2] + cellStates[6] === 0) &&
        ((cellStates[3] !== CELL_STATE.EMPTY || cellStates[5] !== CELL_STATE.EMPTY) && cellStates[3] + cellStates[5] === 0)
    ) {
        cellStates[4] = CELL_STATE.CATS;
    }

    if(cellStates[5] === CELL_STATE.EMPTY &&
        ((cellStates[2] !== CELL_STATE.EMPTY || cellStates[8] !== CELL_STATE.EMPTY) && cellStates[2] + cellStates[8] === 0) &&
        ((cellStates[3] !== CELL_STATE.EMPTY || cellStates[4] !== CELL_STATE.EMPTY) && cellStates[3] + cellStates[4] === 0)
    ) {
        cellStates[5] = CELL_STATE.CATS;
    }

    if(cellStates[6] === CELL_STATE.EMPTY &&
        ((cellStates[0] !== CELL_STATE.EMPTY || cellStates[3] !== CELL_STATE.EMPTY) && cellStates[0] + cellStates[3] === 0) &&
        ((cellStates[2] !== CELL_STATE.EMPTY || cellStates[4] !== CELL_STATE.EMPTY) && cellStates[2] + cellStates[4] === 0) &&
        ((cellStates[7] !== CELL_STATE.EMPTY || cellStates[8] !== CELL_STATE.EMPTY) && cellStates[7] + cellStates[8] === 0)
    ) {
        cellStates[6] = CELL_STATE.CATS;
    }

    if(cellStates[7] === CELL_STATE.EMPTY &&
        ((cellStates[1] !== CELL_STATE.EMPTY || cellStates[4] !== CELL_STATE.EMPTY) && cellStates[1] + cellStates[4] === 0) &&
        ((cellStates[6] !== CELL_STATE.EMPTY || cellStates[8] !== CELL_STATE.EMPTY) && cellStates[6] + cellStates[8] === 0)
    ) {
        cellStates[7] = CELL_STATE.CATS;
    }

    if(cellStates[8] === CELL_STATE.EMPTY &&
        ((cellStates[0] !== CELL_STATE.EMPTY || cellStates[4] !== CELL_STATE.EMPTY) && cellStates[0] + cellStates[4] === 0) &&
        ((cellStates[2] !== CELL_STATE.EMPTY || cellStates[5] !== CELL_STATE.EMPTY) && cellStates[2] + cellStates[5] === 0) &&
        ((cellStates[6] !== CELL_STATE.EMPTY || cellStates[7] !== CELL_STATE.EMPTY) && cellStates[6] + cellStates[7] === 0)
    ) {
        cellStates[8] = CELL_STATE.CATS;
    }

    if(cellStates.find(function (el) { return el === CELL_STATE.EMPTY; }) === CELL_STATE.EMPTY) {
        return false;
    } else {
        updateGameState(GAME_STATE.CATS);
        return true;
    }
}

function updateGameState(newGameState) {
    gameState = GAME_STATE.contains(newGameState) ? newGameState : GAME_STATE.ERROR;
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
    } else if (event.keyCode !== undefined) {
        // Where 'key' is unsupported, the deprecated 'keyCode' will usually work.
        alert('Key Code: ' + event.keyCode);
        if (event.keyCode === 13) {
            theKey = 'ENTER';
        } else {
            theKey = String.fromCharCode(event.keyCode);
        }
    } else {
        // In theory, implementing handling by event.keyIdentifier could be required in some
        //  environments. But there is no evidence that this is needed, and no environment
        //  to test it has been identified.
    }

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


