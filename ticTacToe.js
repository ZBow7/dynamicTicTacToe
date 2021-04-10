let turnTracker;
function gameStart() {
    turnTracker = true;
    //Button functionality
    document.getElementById("boardSize").addEventListener("change", boardPreview);
    document.getElementById("boardScaling").addEventListener("change", boardPreview);
    document.getElementById("resetBoard").addEventListener("click", resetBoard);
    document.getElementById("sizeDown").addEventListener("click", function() {
        handleSize("down");
    });
    document.getElementById("sizeUp").addEventListener("click", function() {
        handleSize("up");
    });
    document.getElementById("scaleDown").addEventListener("click", function() {
        handleScaling("down");
    });
    document.getElementById("scaleUp").addEventListener("click", function() {
        handleScaling("up");
    });
    window.addEventListener("resize", boardPreview);
}

function handleSize (direction) {
    let currentValue = document.getElementById("boardSize").value;
    if (direction == "up") {
        currentValue++;
    }
    else {
        currentValue--;
    }
    if (currentValue > 10) {
        currentValue = 10;
    }
    else if (currentValue < 3) {
        currentValue = 3;
    }
    document.getElementById("boardSize").value = currentValue;
    boardPreview();
}

function handleScaling (direction) {
    let currentValue = document.getElementById("boardScaling").value;
    if (direction == "up") {
        currentValue++;
    }
    else {
        currentValue--;
    }
    if (currentValue > 10) {
        currentValue = 10;
    }
    else if (currentValue < 1) {
        currentValue = 1;
    }
    document.getElementById("boardScaling").value = currentValue;
    boardPreview();
}

function boardPreview() {
    document.getElementById("board").innerHTML = "";
    //Getting and correcting board size & scaling if either inputs are outside of acceptable range
    let rowColumnCount = determinePreviewBoardSize();
    let boardScaling = determinePreviewBoardScaling();
    //Math for working out board size & scaling based on their related inputs
    let minCellCount = 3;
    let maxCellCount = 10;
    const minBoardSizeMod = 120; //Minimum size of board with boardScaling of 1 and square count of 3 - absolute smallest board size.  Final value is ultimately modified by scalingMod and the window width / height
    const maxBoardSizeMod = 132; //Maximum size of board with boardScaling of 1 and square count of 10.  Smallest board size given highest square count.  Final value is ultimately modified by scalingMod and the window width / height
    let minBoardSize = boardScaling * minBoardSizeMod;
    let maxBoardSize = boardScaling * maxBoardSizeMod;
    let cellSizeScaling = (maxBoardSize-minBoardSize)/(maxCellCount-minCellCount)/minBoardSize;
    let newBoardSize = Math.round(minBoardSize*(1+cellSizeScaling*(rowColumnCount-minCellCount)));
    let newCellSize = newBoardSize/rowColumnCount;
    //Adding squares and assigning appropriate classes for border shadows during the board preview stage (before lock in)
    let newCells;
    for (i = 0; i < Math.pow(rowColumnCount, 2); i++) {
        let newCellClass = "cell ";
        if (i < rowColumnCount) {
            newCellClass += "top ";
                if (i > 0) {
                    newCellClass += "topShadow ";
                }
        }
        if (i >= Math.pow(rowColumnCount, 2) - rowColumnCount) {
            newCellClass += "bottom ";
            if (i > Math.pow(rowColumnCount, 2) - rowColumnCount) {
                newCellClass += "bottomShadow ";
            }
        }
        if (i % rowColumnCount == 0) {
            newCellClass += "left ";
        }
        if (i % rowColumnCount == rowColumnCount - 1) {
            newCellClass += "right ";
        }
        newCellClass = newCellClass.trim();
        newCells = '<div id="' + i + '" class="' + newCellClass + '"></div>';
        document.getElementById("board").innerHTML += newCells;
    }
    document.querySelector(":root").style.setProperty("--numColumns", rowColumnCount);
    document.querySelector(":root").style.setProperty("--cellSize", newCellSize + "px");
    document.querySelector(":root").style.setProperty("--boardSize", newBoardSize + "px");
}
function determinePreviewBoardSize () {
    let rowColumnCount = document.getElementById("boardSize").value;
    if (rowColumnCount > 10) {
        rowColumnCount = 10;
        document.getElementById("boardSize").value = 10;
    }
    if (rowColumnCount < 3) {
        rowColumnCount = 3;
        document.getElementById("boardSize").value = 3;
    }
    return rowColumnCount;
}

function determinePreviewBoardScaling () {
    let boardScaling = document.getElementById("boardScaling").value;
    if (boardScaling > 10) {
        boardScaling = 10;
        document.getElementById("boardScaling").value = 10;
    }
    if (boardScaling < 1) {
        boardScaling = 1;
        document.getElementById("boardScaling").value = 1;
    }
    let scalingMod = window.innerWidth / 980;
    let heightWidthRatio = (window.innerHeight / window.innerWidth > 1.5) ? 1.5 : window.innerHeight / window.innerWidth;
    heightWidthRatio = (heightWidthRatio < .6) ? .6 : heightWidthRatio;
    return boardScaling * scalingMod * heightWidthRatio;
}

function lockIn() {
    let rowColumnCount = document.getElementById("boardSize").value;
    document.getElementById("gameHeader").innerText = "Tic Tac Toe " + rowColumnCount + " in a row";
    document.getElementById("turnMsg").innerText = "It is X's turn";
    const cellElements = [...document.getElementsByClassName("cell")];
    cellElements.forEach(cell => {
        cell.addEventListener("click", handleClick, {once: true});
    })
    updateVisuals("lockIn");
}

function handleClick(e) {
    //Handling when user makes a selection on the board
    const cell = e.target;
    const currentClass = turnTracker ? "x" : "o";
    const nextTurn = turnTracker ? "o" : "x";
    cell.classList.add(currentClass);
    cell.innerHTML = currentClass.toUpperCase();
    if (!checkWin(currentClass, e.target.id)) {
        turnTracker = !turnTracker;
        document.getElementById("turnMsg").innerText = "It is " + nextTurn + "'s turn";
    }
}

function checkWin(currentClass, id) {
    //Can you condense / rework the math here?
    let rowColumnCount = parseInt(document.getElementById("boardSize").value);
    let column = id % rowColumnCount;
    let row = Math.floor(id / rowColumnCount);
    let vertStart = id - row * rowColumnCount;
    let horStart = id - column;
    if (checkVertical(vertStart, currentClass, rowColumnCount) || checkHorizontal(horStart, currentClass, rowColumnCount) || checkDiagonal(id, currentClass, rowColumnCount)) {
        handleWin(currentClass);
        return 1;
    }
    else {
        return 0;
    }
}

function checkVertical(vertStart, currentClass, rowColumnCount) {
    for (let i = 0; i <= rowColumnCount; i++) {
        if (i == rowColumnCount) {
            console.log("Win Vertical");
            verticalHighlight(vertStart, rowColumnCount);
            return 1;
        }
        if (!document.getElementById(vertStart + i * rowColumnCount).classList.contains(currentClass)) {
            return 0;
        }
    }
}

function checkHorizontal(horStart ,currentClass, rowColumnCount) {
    for (let i = 0; i <= rowColumnCount; i++) {
        if (i == rowColumnCount) {
            console.log("Win horizontal");
            horizontalHighlight(horStart, rowColumnCount);
            return 1;
        }
        if (!document.getElementById(horStart + i).classList.contains(currentClass)) {
            return 0;
        }
    }
}

function checkDiagonal(id, currentClass, rowColumnCount) {
    if (id % (rowColumnCount + 1) == 0 || id % (rowColumnCount - 1) == 0) {
        for (let i = 0; i < rowColumnCount; i++) {
            if (!document.getElementById(i*(rowColumnCount+1)).classList.contains(currentClass)) {
                for (let j = 0; j < rowColumnCount; j++) {
                    if (!document.getElementById((j+1)*(rowColumnCount-1)).classList.contains(currentClass)) {
                        return 0;
                    }
                    if (j == rowColumnCount - 1) {
                        diagonalHighlight(2, rowColumnCount);
                        return 1;
                    }
                }
            }
            if (i == rowColumnCount - 1) {
                diagonalHighlight(1, rowColumnCount);
                return 1;
            }
        }
    }
}

function verticalHighlight(vertStart, rowColumnCount) {
    for (let i = 0; i < rowColumnCount; i++) {
        document.getElementById(vertStart + i * rowColumnCount).style.color = "green";
    }
}

function horizontalHighlight (horStart, rowColumnCount) {
    for (let i = 0; i < rowColumnCount; i++) {
        document.getElementById(horStart + i).style.color = "green";
    }
}

function diagonalHighlight (direction, rowColumnCount) {
    if (direction == 1) {
        for (let i = 0; i < rowColumnCount; i++) {
            document.getElementById(i*(rowColumnCount+1)).style.color = "green";
        }
    }
    else {
        for (let i = 0; i < rowColumnCount; i++) {
            document.getElementById((i+1)*(rowColumnCount-1)).style.color = "green";
        }
    }
}

function handleWin (currentClass) {
    document.getElementById("turnMsg").innerHTML = currentClass + " has won! <button id=playAgain>Play again</button>";
    document.getElementById("playAgain").addEventListener("click", resetBoard, {once: true});
    document.getElementById("resetBoard").style.display = "none";
    const cellElements = [...document.getElementsByClassName("cell")];
    cellElements.forEach(cell => {
        cell.removeEventListener("click", handleClick, {once: true});
    })
}

function resetBoard() {
    const cellElements = [...document.getElementsByClassName("cell")];
    cellElements.forEach(cell => {
        cell.classList.remove("x");
        cell.classList.remove("o");
        cell.innerText = "";
        cell.removeEventListener("click", handleClick, {once: true});
        cell.style.color = "black";
    })
    turnTracker = true;
    updateVisuals("reset");
}

function updateVisuals (action) {
    if (action == "lockIn") {
        document.querySelector(":root").style.setProperty("--cellPreviewOffset", "0px");
        document.querySelector(":root").style.setProperty("--cellTopMidPreviewShadow", "0px");
        document.querySelector(":root").style.setProperty("--cellBottomPreviewShadow", "0px");
        document.querySelector(":root").style.setProperty("--cellRightPreviewShadow", "0px");
        document.getElementById("boardMsg").style.display = "none";
        document.getElementById("turnMsg").style.display = "block";
        document.getElementById("resetBoard").style.display = "block";
        document.getElementById("gameHeader").style.display = "block";
    }
    else {
        document.querySelector(":root").style.setProperty("--cellPreviewOffset", "-15px");
        document.querySelector(":root").style.setProperty("--cellTopMidPreviewShadow", "5px 5px 5px #888888");
        document.querySelector(":root").style.setProperty("--cellBottomPreviewShadow", "9px 0px 4px -4px #888888");
        document.querySelector(":root").style.setProperty("--cellRightPreviewShadow", "0px 9px 4px -4px #888888");
        document.getElementById("gameHeader").style.display = "none";
        document.getElementById("turnMsg").style.display = "none";
        document.getElementById("resetBoard").style.display = "none";
        document.getElementById("boardMsg").style.display = "block";
    }
}

gameStart();
boardPreview();