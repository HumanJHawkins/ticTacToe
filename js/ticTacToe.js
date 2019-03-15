// Initialize global constants/statics. Load word list, etc.
let GAME_STATE = Object.freeze({
    "ERROR": 0,
    "INPROGRESS": 1,
    "GAMEOVER": 2
});

let PLAYER = Object.freeze({  // Allows playerTurn = -playerTurn for switching turns.
    "PLAYER_X": -1,
    "PLAYER_O": 1
});

let gameMarks = ['','','','','','','','',''];

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
    playerTurn = PLAYER.PLAYER_X;
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
        '    <grid-item onclick="handleMark(0)" class="top left"><span id="cell0"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(1)" class="top"><span id="cell1"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(2)" class="top right"><span id="cell2"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(3)" class="left"><span id="cell3"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(4)" ><span id="cell4"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(5)" class="right"><span id="cell5"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(6)" class="bottom left"><span id="cell6"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(7)" class="bottom"><span id="cell7"></span></grid-item>\n' +
        '    <grid-item onclick="handleMark(8)" class="bottom right"><span id="cell8"></span></grid-item>\n' +
        '</grid-container>';

    updateMarks();
}

function updateMarks() {
    for(let i = 0; i < gameMarks.length; i++) {
        document.getElementById('cell' + i).innerHTML = gameMarks[i];
    }
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

function randIntBetween(randMin, randMax) {
    return Math.floor(Math.random() * (randMax - randMin + 1) + randMin);
}

function handleMark(cellNumber) {
    // Ignore marks when game over, etc.
    if (gameState === GAME_STATE.ERROR ||
        gameState === GAME_STATE.GAMEOVER) {
        return;
    }

    cellID = 'cell' + cellNumber;
    if(document.getElementById(cellID).innerHTML !== '') {
        return;
    }

    let theMark = 'X';
    if(playerTurn === PLAYER.PLAYER_O) {
        theMark = 'O';
    }

    gameMarks[cellNumber] = theMark;

    playerTurn = -playerTurn;
    // setGameState(); // Each guess can change the game state.

    handleDisplayRefresh();
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
            handleMark(theKey);
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
    if (gameState === GAME_STATE.PROGRESSING || gameState === GAME_STATE.IMPERILED) {
        if (confirm("Apply this difficulty change to the current game?\n\nClick 'Cancel' to finish this game " +
            "first. Your changes will apply to the next game.")) {
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




