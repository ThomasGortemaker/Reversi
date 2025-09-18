class Piece {
    constructor(color) {
        this.element = document.createElement('span');
        this.setColor(color);
        this.element.classList.add('piece');
        this.element.style.width = (cellSize - 10) + 'px';
        this.element.style.height = (cellSize - 10) + 'px';
        // this.element.style.width = '20px'
        // this.element.style.height = '20px'
    }

    setColor(color) {
        if (this.color != color) {
            this.color = color;
            this.element.style.backgroundColor = color;
        }
    }
}


class Cell {
    constructor(x, y, row, col) {
        this.row = row;
        this.col = col;

        this.element = document.createElement('div');
        if ((Number(row) + Number(col)) % 2 == 0) {
            this.element.style.backgroundColor = cellcolor1;
        } else {
            this.element.style.backgroundColor = cellcolor2;
        }
        this.element.classList.add('cell');
        this.element.style.width = (cellSize - 4) + 'px';
        this.element.style.height = (cellSize - 4) + 'px';
        this.element.style.position = 'absolute';
        this.element.style.top = y + 'px';
        this.element.style.left = x + 'px';
        this.playableCell = true;

        this.element.addEventListener('click', () => {
            if (this.playableCell) {
                console.log(`clicked [${this.row},${this.col}]`)
                // this.toggleColor();
                // this.piece = this.addPiece(player);
                console.log(`Clicked cell at row: ${this.row}, col: ${this.col}`);
                if (player == 'white') {
                    whiteBitBoard = whiteBitBoard | (1n << row * 8n + col)
                } else {
                    blackBitBoard = blackBitBoard | (1n << row * 8n + col)
                }
                this.playableCell = false;
                flipPieces(1n << (row * 8n + col));
                swapPlayer();
                // gridDiv.style.pointerEvents = "none";
                // console.log('grid disabled');
                // setTimeout(() => {
                //     gridDiv.style.pointerEvents = 'auto';
                //     console.log('grid enabled');
                //   }, 2000);
            } else {
                // if (this.piece.element.style.backgroundColor == 'black') {
                //     blackBitBoard = blackBitBoard ^ ((1n << (63n - BigInt(row * 8 + col))))
                //     whiteBitBoard = whiteBitBoard | ((1n << (63n - BigInt(row * 8 + col))))
                // } else {
                //     whiteBitBoard = whiteBitBoard ^ ((1n << (63n - BigInt(row * 8 + col))))
                //     blackBitBoard = blackBitBoard | ((1n << (63n - BigInt(row * 8 + col))))
                // }
                // this.swapPieceColor();
                console.log(`invalid cell [${this.row},${this.col}]`)
                console.log(grid[this.row][this.col])
            }
            updateBoard();
        });
    }

    toggleColor() {
        const current = this.element.style.backgroundColor;
        this.element.style.backgroundColor = current === 'black' ? 'blue' : 'black';
    }

    render(parent) {
        parent.append(this.element);
    }

    addPiece(color) {
        const piece = new Piece(color);
        this.element.append(piece.element);
        this.enable(false)
        return piece
    }

    swapPieceColor() {
        const currentColor = this.piece.element.style.backgroundColor;
        console.log(currentColor)
        this.piece.element.style.backgroundColor = currentColor === 'black' ? 'white' : 'black';
    }

    enable(enabled) {
        this.playableCell = enabled;
        if (this.playableCell) {
            console.log(`[${this.row},${this.col}] playable set to: ${this.playableCell}`)
        }
        return this.playableCell;
    }

    isEnabled() {
        return this.playableCell;
    }

    hasPiece() {
        return this.element.querySelector('.piece') !== null
    }
}

function updateBoard() {
    let validMoves = 0n
    let shift = 63n
    if (player == 'white') {
        validMoves = findValidMoves(whiteBitBoard, blackBitBoard)
    } else {
        validMoves = findValidMoves(blackBitBoard, whiteBitBoard)
    }
    printBitboard(new Map([["B", blackBitBoard], ["W", whiteBitBoard], ["V", validMoves]]))
    for (let row = rows; row >= 0n; row--) {
        for (let col = cols; col >= 0n; col--) {
            if ((validMoves >> (row * 8n + col * 1n)) & 1n) {
                grid[row][col].enable(true)
            } else {
                grid[row][col].enable(false)
            }
            if ((whiteBitBoard >> shift) & 1n) {
                if (!grid[row][col].hasPiece()) {
                    console.log('adding white piece');
                    grid[row][col].addPiece('white');
                }
            } else if ((blackBitBoard >> shift) & 1n) {
                if (!grid[row][col].hasPiece()) {
                    console.log('adding black piece');
                    grid[row][col].addPiece('black');
                }
            }
            shift--;
        }
    }
}

function flipPieces(addedPiece) {
    let piecesToSwap = 0n;
    let dirMapping = [9n, 8n, 7n, 1n, -1n, -7n, -8n, -9n];
    validMovesArray.forEach((value, index) => {
        // printBitboard(new Map([["M",(value & addedPiece)]]))
        // printBitboard(new Map([["P",value]]))
        if ((value & addedPiece) != 0n) {
            printBitboard(new Map([["a",(addedPiece >> dirMapping[index])]]))
        }
    });
}

function printBitboard(boards) {
    let position = "";
    let charachterPrinted = false;
    let shift = 63n;
        while(shift >= 0n) {
            for(key of boards.keys()) {
                if((boards.get(key) >> shift) & 1n) {
                    position += key;
                    charachterPrinted = true;
                    break;
                }
            }
            if(!charachterPrinted) {
                position+='.';
            } else {
                charachterPrinted = false
            }
            if(shift % 8n == 0n){
                position+='\n';
            } else {
                position += ' ';
            }
            shift -= 1n;
        }
    console.log(position);
}

let blackBitBoard = 0x0000000810000000n;
let whiteBitBoard = 0x0000001008000000n;
let player = 'white';
const cellcolor1 = '#7a3704'
const cellcolor2 = '#de9849'
const rows = 7n;
const cols = rows;
const gridDiv = document.getElementById("grid")
const cellSize = (gridDiv.clientWidth)/Number(rows);
let grid = [];
let validMovesArray = [];
for (let row = rows; row >= 0n; row--) {
    const rowArray = [];
    for (let col = cols; col >= 0n; col--) {
        const x = Number(cols - col) * cellSize;
        const y = Number(rows - row) * cellSize;
        const cell = new Cell(x, y, row, col); // Pass row and col
        cell.render(gridDiv);
        rowArray[col] = cell;
    }
    grid[row] = rowArray
}
console.log(`${grid[7][3].row},${grid[7][3].col}`)
updateBoard()

/*  shift direction: potential moves = (player pos & enemy pos) & edge mask), this will become potential moves
    shift direction: potential moves = (potential moves & edgemask)
    actual moves = (potential moves & empty map) | actual moves, actual will start out as 0n and will become the final complete bitmap containing all valid moves in the given direction
    potential moves = (potential moves & enemy pos), we do this to avoid the misconception that placing a stone next to a stone of your own color can be valid
    we shift until potential moves == 0n;
    NOTE: we can put everything in one loop if we start potential moves at 0n.
*/

function findValidMoves(playerPos, enemyPos) {
    const boardMask = 0xffffffffffffffffn;
    const leftEdgeMask = 0x7f7f7f7f7f7f7f7fn;
    const rightEdgeMask = 0xfefefefefefefefen;
    let validMoves = 0n;
    validMovesArray = [];
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 9n, rightEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 8n, boardMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 7n, leftEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 1n, rightEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 1n, leftEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 7n, rightEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 8n, boardMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 9n, leftEdgeMask));
    validMovesArray.forEach((value) => {
        // console.log('index is ' + index);
        // printBitboard(new Map([["A", value]]));
        validMoves = validMoves | value

    });
    // for (validMove in validMovesArray) {
    //     printBitboard(new Map([["a", validMove]]))
    //     validMoves = validMoves | validMove
    // }

    return validMoves;
}

function checkright(playerPos, enemyPos) {
    const leftEdgeMask = 0x7f7f7f7f7f7f7f7fn;
    let validMoves = 0n;
    const empty = ~(playerPos | enemyPos);
    let potentialMoves = ((playerPos >> 1n) & enemyPos) & leftEdgeMask;
    while(potentialMoves != 0n) {
        // printBitboard(new Map([["P", potentialMoves]]))
        potentialMoves = (potentialMoves >> 1n) & leftEdgeMask;
        validMoves = (potentialMoves & empty) | validMoves;
        potentialMoves = potentialMoves & enemyPos;
    }
    return validMoves;
}

function checkleft(playerPos, enemyPos) {
    const rightEdgeMask = 0xfefefefefefefefen;
    let validMoves = 0n;
    const empty = ~(playerPos | enemyPos);
    let potentialMoves = ((playerPos << 1n) & enemyPos) & rightEdgeMask;
    while(potentialMoves != 0n) {
        // printBitboard(new Map([["P", potentialMoves]]))
        potentialMoves = (potentialMoves << 1n) & rightEdgeMask;
        validMoves = (potentialMoves & empty) | validMoves;
        potentialMoves = potentialMoves & enemyPos;
    }
    return validMoves;
}

function checkDirection(playerPos, enemyPos, shiftdir, shiftAmount, mask){
    const empty = ~(playerPos | enemyPos);
    let validMoves = 0n;
    if(!(shiftdir == 'left' || shiftdir == 'right' || shiftdir == 'both')) {
        throw 'invalid shiftdir used in checkDirection function!';
    }
    if(shiftdir == 'left' || shiftdir == 'both') {
        let potentialMoves = ((playerPos << shiftAmount) & enemyPos) & mask;
        while(potentialMoves != 0n) {
            // printBitboard(new Map([["P", potentialMoves]]))
            potentialMoves = (potentialMoves << shiftAmount) & mask;
            validMoves = (potentialMoves & empty) | validMoves;
            potentialMoves = potentialMoves & enemyPos;
        }
    }
    if(shiftdir == 'right' || shiftdir == 'both') {
        let potentialMoves = ((playerPos >> shiftAmount) & enemyPos) & mask;
        while(potentialMoves != 0n) {
            // printBitboard(new Map([["P", potentialMoves]]))
            potentialMoves = (potentialMoves >> shiftAmount) & mask;
            validMoves = (potentialMoves & empty) | validMoves;
            potentialMoves = potentialMoves & enemyPos;
        }
    }
    return validMoves;
}

function swapPlayer() {
    player = player === 'black' ? 'white' : 'black';
}