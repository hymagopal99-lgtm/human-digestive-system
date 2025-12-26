const digestiveData = [
    { id: 1, organ: "Mouth", function: "Chews food and mixes it with saliva" },
    { id: 2, organ: "Salivary Glands", function: "Produces a liquid that makes food wet" },
    { id: 3, organ: "Oesophagus", function: "A tube that carries food to the stomach" },
    { id: 4, organ: "Stomach", function: "A muscular bag that churns and digests food" },
    { id: 5, organ: "Liver", function: "Makes bile to help digest fats" },
    { id: 6, organ: "Pancreas", function: "Makes juices to break down sugars and fats" },
    { id: 7, organ: "Small Intestine", function: "Absorbs nutrients into the blood" },
    { id: 8, organ: "Large Intestine", function: "Absorbs water from undigested food" },
    { id: 9, organ: "Rectum", function: "Stores waste before it leaves the body" },
    { id: 10, organ: "Anus", function: "Opening where waste leaves the body" }
];

const colA = document.getElementById('col-a');
const colB = document.getElementById('col-b');
const svgLayer = document.getElementById('connections');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const solveBtn = document.getElementById('solve-btn');
const exitBtn = document.getElementById('exit-btn');
const scoreDisplay = document.getElementById('score-display');

let selectedLeft = null;
let connections = new Map(); // Stores Left ID -> Right ID
let isMobile = window.innerWidth <= 768;

// Initialize Game
function initGame() {
    renderColumns();
    resetState();
}

function resetState() {
    selectedLeft = null;
    connections.clear();
    scoreDisplay.classList.add('hidden');
    scoreDisplay.textContent = '';

    // Reset visual states
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('selected', 'correct', 'wrong', 'disabled');
        // Clear color coding connections
        item.style.backgroundColor = '';
        item.style.borderColor = '';
    });

    clearLines();

    // Re-enable interactions
    colA.style.pointerEvents = 'auto';
    colB.style.pointerEvents = 'auto';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderColumns() {
    colA.innerHTML = '';
    colB.innerHTML = '';

    // Column A: Organs (Fixed Order usually is better for learning, or shuffled? Let's keep Organs fixed for clarity)
    // Actually, shuffling both is fun, but usually Col A is fixed in worksheets.
    digestiveData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = item.organ;
        div.dataset.id = item.id;
        div.dataset.type = 'left';
        div.addEventListener('click', handleItemClick);
        colA.appendChild(div);
    });

    // Column B: Functions (Shuffled)
    const shuffledFunctions = shuffleArray([...digestiveData]);
    shuffledFunctions.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = item.function;
        div.dataset.id = item.id; // The ID connects it to the organ
        div.dataset.type = 'right';
        div.addEventListener('click', handleItemClick);
        colB.appendChild(div);
    });
}

function handleItemClick(e) {
    // If game is checked, don't allow changes until reset
    if (scoreDisplay.innerHTML !== '' && !scoreDisplay.classList.contains('hidden')) return;

    const item = e.target;
    // const type = item.dataset.type;
    // const id = item.dataset.id;

    if (item.classList.contains('disabled')) return;

    if (item.dataset.type === 'left') {
        // If clicking same left item, optimize toggle? No, standard logic:
        if (selectedLeft === item) {
            item.classList.remove('selected');
            selectedLeft = null;
        } else {
            if (selectedLeft) selectedLeft.classList.remove('selected');
            item.classList.add('selected');
            selectedLeft = item;
        }
    } else if (item.dataset.type === 'right') {
        if (selectedLeft) {
            // Create connection
            createConnection(selectedLeft, item);
            selectedLeft.classList.remove('selected');
            selectedLeft = null;
        } else {
            // Maybe give feedback "Select an organ first"
            // Or allow Right-First selection? Let's stick to Left-First for simplicity
            // actually, better UX: Highlight right selected if we want to support Right->Left
        }
    }
}

function createConnection(leftItem, rightItem) {
    const leftId = leftItem.dataset.id;
    // Remove existing connection for this left item if any
    if (connections.has(leftId)) {
        // Find the old right item and clear its visual
        // Actually, we just redraw lines.
    }

    connections.set(leftId, rightItem);

    // Visual feedback
    drawLines();
}

function drawLines() {
    clearLines();
    if (isMobile) {
        // Mobile: Color code matching pairs instead of lines
        // Reset all colors first
        document.querySelectorAll('.item').forEach(el => {
            if (!el.classList.contains('correct') && !el.classList.contains('wrong')) {
                el.style.backgroundColor = '';
                el.style.borderColor = '';
            }
        });

        // Apply colors pairs
        let hueStep = 360 / digestiveData.length;
        let index = 0;
        connections.forEach((rightItem, leftId) => {
            const leftItem = Array.from(colA.children).find(el => el.dataset.id === leftId);
            const rightEl = rightItem;

            const color = `hsl(${index * hueStep}, 70%, 90%)`;
            const borderColor = `hsl(${index * hueStep}, 70%, 50%)`;

            if (leftItem) {
                leftItem.style.backgroundColor = color;
                leftItem.style.borderColor = borderColor;
            }
            if (rightEl) {
                rightEl.style.backgroundColor = color;
                rightEl.style.borderColor = borderColor;
            }
            index++;
        });

    } else {
        // Desktop: SVG Lines
        connections.forEach((rightItem, leftId) => {
            const leftItem = Array.from(colA.children).find(el => el.dataset.id === leftId);
            if (leftItem && rightItem) {
                drawLine(leftItem, rightItem);
            }
        });
    }
}

function drawLine(startElem, endElem) {
    const startRect = startElem.getBoundingClientRect();
    const endRect = endElem.getBoundingClientRect();
    const containerRect = document.querySelector('.game-area').getBoundingClientRect();

    const x1 = startRect.right - containerRect.left;
    const y1 = startRect.top + startRect.height / 2 - containerRect.top;
    const x2 = endRect.left - containerRect.left;
    const y2 = endRect.top + endRect.height / 2 - containerRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);

    svgLayer.appendChild(line);
}

function clearLines() {
    svgLayer.innerHTML = '';
}

function checkAnswers() {
    let correctCount = 0;

    // Clear previous visual states that might conflict
    document.querySelectorAll('.item').forEach(i => {
        i.classList.remove('correct', 'wrong');
    });

    connections.forEach((rightItem, leftId) => {
        const leftItem = Array.from(colA.children).find(el => el.dataset.id === leftId);

        if (rightItem.dataset.id === leftId) {
            correctCount++;
            leftItem.classList.add('correct');
            rightItem.classList.add('correct');
        } else {
            leftItem.classList.add('wrong');
            rightItem.classList.add('wrong');
        }
    });

    // Re-draw lines with classes
    clearLines();
    if (isMobile) {
        // Colors update based on correct/wrong
    } else {
        connections.forEach((rightItem, leftId) => {
            const leftItem = Array.from(colA.children).find(el => el.dataset.id === leftId);
            drawLine(leftItem, rightItem);
            // Add class to the last added line
            const line = svgLayer.lastElementChild;
            if (rightItem.dataset.id === leftId) {
                line.classList.add('correct');
            } else {
                line.classList.add('wrong');
            }
        });
    }

    scoreDisplay.textContent = `You got ${correctCount} out of ${digestiveData.length} correct!`;
    scoreDisplay.classList.remove('hidden');
}

function showAnswerKey() {
    resetState(); // clear user lines

    // Connect everything correctly
    connections.clear();

    // Iterate through all left items
    Array.from(colA.children).forEach(leftItem => {
        const id = leftItem.dataset.id;
        // Find corresponding right item
        const rightItem = Array.from(colB.children).find(el => el.dataset.id === id);

        if (rightItem) {
            connections.set(id, rightItem);
            leftItem.classList.add('correct');
            rightItem.classList.add('correct');
        }
    });

    drawLines();

    if (!isMobile) {
        // Color lines green
        Array.from(svgLayer.children).forEach(line => line.classList.add('correct'));
    }

    colA.style.pointerEvents = 'none';
    colB.style.pointerEvents = 'none';

    scoreDisplay.textContent = "Answer Key Shown";
    scoreDisplay.classList.remove('hidden');
}

// Event Listeners
resetBtn.addEventListener('click', () => {
    initGame();
});

checkBtn.addEventListener('click', checkAnswers);
solveBtn.addEventListener('click', showAnswerKey);
exitBtn.addEventListener('click', handleExit);

function handleExit() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.close();
    }
}

window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
    drawLines();
});

// Start
initGame();
