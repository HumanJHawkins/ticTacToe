// Global Variables
let windowHeight;
let windowWidth;
let boardCell;
let xTurn;

// Constants
const X = {value: -1, mark: 'X'};
const Empty = {value: 0, mark: ''};
const O = {value: 1, mark: 'O'};

initialize();

function initialize() {
    boardCell = [[Empty, Empty, Empty], [Empty, Empty, Empty], [Empty, Empty, Empty]];
    xTurn = true;
    drawGameBoard();
}

function handleDisplaySize() {
    // Window dimensions in pixels. Although we use view width for almost everything, most decisions about layout are
    //   best made based on actual pixel count, or aspect ratio.
    windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    // handleDisplayRefresh();
}


function drawGameBoard() {
    handleDisplaySize();
    let boardHTML = '<table>';
    for (let boardRow = 0; boardRow < 3; boardRow++) {
        boardHTML += '<tr>';
        for (let boardColumn = 0; boardColumn < 3; boardColumn++) {
            boardHTML += '<td onclick="handleTurn(' + boardRow + ', ' + boardColumn + ')">' +
                boardCell[boardRow][boardColumn].mark + '</td>';
        }
        boardHTML += '</tr>';
    }

    document.getElementById('spanGameboard').innerHTML = boardHTML;
}

function handleTurn(row, column) {
    if (boardCell[row][column] === Empty) {
        boardCell[row][column] = getPlayer();
    } else {
        // Ignore clicks on cells that are already claimed.
        return;
    }

    drawGameBoard();
    if (testWinner()) {
        celebrate();
        return;
    }
    xTurn = !xTurn;
}

function getPlayer() {
    if (xTurn) {
        return X;
    }
    return O;
}

function celebrate() {
    celebrateHTML = '<p class="celebrate">Congratulations Player ' + getPlayer().mark + '!!! You Won!</p><br />' +
        '<button onclick="initialize()">Play again</button>';
    document.getElementById('spanResult').innerHTML = celebrateHTML;
}

function testWinner() {
    let win = false;
    // Test rows for Win
    win = (Math.abs(boardCell[0][0].value + boardCell[0][1].value + boardCell[0][2].value) === 3);
    win = win || (Math.abs(boardCell[1][0].value + boardCell[1][1].value + boardCell[1][2].value) === 3);
    win = win || (Math.abs(boardCell[2][0].value + boardCell[2][1].value + boardCell[2][2].value) === 3);
    // Test columns for win
    win = win || (Math.abs(boardCell[0][0].value + boardCell[1][0].value + boardCell[2][0].value) === 3);
    win = win || (Math.abs(boardCell[0][1].value + boardCell[1][1].value + boardCell[2][1].value) === 3);
    win = win || (Math.abs(boardCell[0][2].value + boardCell[1][2].value + boardCell[2][2].value) === 3);
    // Test diagonals for win
    win = win || (Math.abs(boardCell[0][0].value + boardCell[1][1].value + boardCell[2][2].value) === 3);
    win = win || (Math.abs(boardCell[2][0].value + boardCell[1][1].value + boardCell[0][2].value) === 3);

    return win;
}

