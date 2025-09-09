class Piece {
    constructor(color) {
        this.element = document.createElement('span');
        this.element.style.backgroundColor = color;
        this.element.classList.add('piece');
        this.element.style.width = (cellSize - 10) + 'px';
        this.element.style.height = (cellSize - 10) + 'px';
        // this.element.style.width = '20px'
        // this.element.style.height = '20px'
    }
}


class Cell {
    constructor(x, y, row, col) {
        this.row = row;
        this.col = col;

        this.element = document.createElement('div');
        if ((row + col) % 2 == 0) {
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
                // this.toggleColor();
                this.piece = this.addPiece(player);
                swapPlayer();
                console.log(`Clicked cell at row: ${this.row}, col: ${this.col}`);
                this.playableCell = false;
                // gridDiv.style.pointerEvents = "none";
                // console.log('grid disabled');
                // setTimeout(() => {
                //     gridDiv.style.pointerEvents = 'auto';
                //     console.log('grid enabled');
                //   }, 2000);
            } else {
                console.log('invalid cell')
                this.swapPieceColor();
            }
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
        return piece
    }

    swapPieceColor() {
        const currentColor = this.piece.element.style.backgroundColor;
        console.log(currentColor)
        this.piece.element.style.backgroundColor = currentColor === 'black' ? 'white' : 'black';
    }
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

let player = 'white';
const cellcolor1 = '#7a3704'
const cellcolor2 = '#de9849'
const rows = 8;
const cols = rows;
const gridDiv = document.getElementById("grid")
const cellSize = (gridDiv.clientWidth)/rows;
let grid = [];

for (let row = 0; row < rows; row++) {
    const rowArray = [];
    for (let col = 0; col < cols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;
        const cell = new Cell(x, y, row, col); // Pass row and col
        cell.render(gridDiv);
        rowArray.push(cell);
    }
    grid.push(rowArray);
}  


let white = (1n << 27n) | (1n << 36n);
let black = (1n << 28n) | (1n << 35n) | (1n << 34n) | (1n << 33n) | (1n << 42n);

printBitboard(new Map([["W", white],["B", black]]));
let validMoves = findValidMoves(white, black);
printBitboard(new Map([["V", validMoves],["W", white],["B", black]]))


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
    let validMovesArray = [];
    // validMoves = validMoves | checkright(playerPos, enemyPos);
    // validMoves = validMoves | checkleft(playerPos, enemyPos);
    // validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 1n, leftEdgeMask));
    // validMoves = validMoves | validMovesArray[validMovesArray.length - 1]
    // validMoves = validMoves | checkDirection(playerPos, enemyPos, 'right', 1n, leftEdgeMask);
    // validMoves = validMoves | checkDirection(playerPos, enemyPos, 'right', 7n, rightEdgeMask);
    // validMoves = validMoves | checkDirection(playerPos, enemyPos, 'right', 9n, leftEdgeMask);
    // validMoves = validMoves | checkDirection(playerPos, enemyPos, 'left', 1n, rightEdgeMask);
    // validMoves = validMoves | checkDirection(playerPos, enemyPos, 'left', 7n, leftEdgeMask);
    // validMoves = validMoves | checkDirection(playerPos, enemyPos, 'left', 9n, rightEdgeMask);
    // validMoves = validMoves | checkDirection(playerPos, enemyPos, 'both', 8n, boardMask);
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 9n, rightEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 8n, boardMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 7n, leftEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'left', 1n, rightEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 1n, leftEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 7n, rightEdgeMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 8n, boardMask));
    validMovesArray.push(checkDirection(playerPos, enemyPos, 'right', 9n, leftEdgeMask));
    validMovesArray.forEach((value, index) => {
        console.log('index is ' + index);
        printBitboard(new Map([["A", value]]));
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
        printBitboard(new Map([["P", potentialMoves]]))
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
        printBitboard(new Map([["P", potentialMoves]]))
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
            printBitboard(new Map([["P", potentialMoves]]))
            potentialMoves = (potentialMoves << shiftAmount) & mask;
            validMoves = (potentialMoves & empty) | validMoves;
            potentialMoves = potentialMoves & enemyPos;
        }
    }
    if(shiftdir == 'right' || shiftdir == 'both') {
        let potentialMoves = ((playerPos >> shiftAmount) & enemyPos) & mask;
        while(potentialMoves != 0n) {
            printBitboard(new Map([["P", potentialMoves]]))
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



// NOTE: using the edgemasks will fix this but for some reason bigInts allow bits above the 63rd position.