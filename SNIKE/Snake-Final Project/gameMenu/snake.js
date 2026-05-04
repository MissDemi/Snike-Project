const gameBoard = document.getElementById('gameBoard');
// div ul unde afisam jocul, scorul, viteza, etc.
//Folosim document.getElementById pentru a crea legături între codul JavaScript și elementele din HTML.
// Așa putem scrie text în ele sau adăuga elemente vizuale.
const scoreBoard = document.getElementById('scoreBoard');
const speedIndicator = document.getElementById('speedIndicator');
const boardSize = 15; // Dimensiunea tablei de joc 15x15
const pixels = []; // Array pentru a stoca referințele la fiecare celulă a tablei de joc

let snake = [{x: 5, y: 10}, {x:5, y: 10}]; //pozitia initiala
let direction = {x: 1, y: 0}; //direcția inițială a șarpelui, care indică faptul că se va mișca spre dreapta
let apple = {x: 20, y: 20};
let speedApple = {x: 12, y: 11};
let luckyApple = {x: 1000, y: 1000};
let gameInterval;
let gameSpeed = 220; // Viteza inițială a jocului în milisecunde (cu cât este mai mic, cu atât jocul este mai rapid)

let score = 0;
let speedLevel=1;
let refusedLuckyApple=false;
//daca jucatorul a refuzat marul norocos, atunci la urmatoarea aparitie a unui mar normal exista o sansa de 30% sa se termine jocul,
//adaugand un element de risc pentru a face jocul mai interesant.

// se creeaza un element div pt fiecare celula
function createBoard() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const pixel = document.createElement('div');
            gameBoard.appendChild(pixel);
            pixels.push(pixel);
        }
    }
}

//sarpele 🐍
function drawSnake() {
    pixels.forEach(pixel => pixel.classList.remove('snake'));//curata toate patratelele
    snake.forEach(segment => {
        const index = segment.y * boardSize + segment.x;
        //formula mate pt a transforma coordonatele 2D intr o pozitie 1D in array ul de pixeli
        pixels[index].classList.add('snake');//se coloreaza patratelele care corespund segmentelor sarpelui adaugand clasa snake la ele
        
    });
}
//am adaugat o clasa snake la fiecare segment al sarpelui pentru a-l face vizibil pe tabla de joc,
//  iar inainte de a desena sarpele, am eliminat clasa snake de la toate pixelii pentru a preveni desenarea unor
//  segmente vechi care nu mai fac parte din sarpe.


function moveSnake() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    //creăm un nou obiect head care reprezintă noua poziție a capului șarpelui,
    //calculată adăugând direcția curentă la poziția actuală a capului (primul element din array-ul snake).
    snake.unshift(head);
    //adaugam capul nou la inceputul listei sarpelui folosind unshift,
    //  astfel încât să devină noul cap al șarpelui.
    if (head.x === apple.x && head.y === apple.y) {
        generateApple();
        score += 10; // Când șarpele mănâncă un măr, scorul crește cu 10 puncte
        updateScore();
        if(score==100)
            {
                generateLuckyApple()
                drawLuckyApple();
            }
        else if(score == 110) {
            hideLuckyApple();
            refusedLuckyApple = true;
        }
    } else if (head.x === speedApple.x && head.y === speedApple.y) {
        generateSpeedApple();
        newTick();
        snake.pop();
    } else if (head.x === luckyApple.x && head.y === luckyApple.y) {
        whatLuckyApple();
    } else {
        snake.pop();
        // Dacă șarpele nu a mâncat un măr, eliminăm ultimul segment pentru a menține lungimea constantă
    }
    if (checkCollision()) { // Verificăm dacă șarpele a lovit un perete sau pe el însuși
        clearInterval(gameInterval);
        alert('Game Over');
        location.reload();
    }
}

// Verifică coliziunea cu pereții și cu corpul șarpelui
function checkCollision() {
    const head = snake[0];//coordonatele capului 
    //verifica daca capul sarpelui a lovit peretele
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
        return true;
    }
    //verifica daca capul sarpelui are acelseasi coordonate cu orice segment din corp
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

//Generează o poziție aleatorie pentru măr, asigurându-se că nu apare pe marginea tablei și că nu se suprapune cu șarpele
function generateApple() {
    let validPosition = false;
    while (!validPosition) {
        apple.x = Math.floor(Math.random() * (boardSize-5));
        apple.y = Math.floor(Math.random() * (boardSize-5));
        apple.x += 2;
        apple.y += 2;
        //Am folosit Math.random pentru a genera o poziție aleatorie pentru măr,
        // limitată astfel încât să nu apară pe marginea tablei, ci doar în interiorul acesteia
        validPosition = true;
        snake.forEach(segment => {
            if (segment.x === apple.x && segment.y === apple.y) {
                validPosition = false;
            }
        });
    }
    if(refusedLuckyApple)
    {
        generateRandom=Math.floor(Math.random() * 100);
        if( generateRandom < 30)
            {
                clearInterval(gameInterval);
                alert('Game Over | Your score is: '  + score);
                location.reload();
            }
    }
    //Dacă refusedLuckyApple este adevărat, la fiecare măr nou generat,
    // există o șansă de 30% (Math.random() < 30) ca jocul să se termine brusc.
}

// Desenează mărul pe tabla de joc, adăugând clasa apple la pixelul corespunzător poziției mărului
function drawApple() {
    pixels.forEach(pixel => pixel.classList.remove('apple'));
    const index = apple.y * boardSize + apple.x;
    pixels[index].classList.add('apple');
}



//Generează o poziție aleatorie pentru mărul de viteză
function generateSpeedApple() {
        let validSpeedPosition = false;
        while (!validSpeedPosition) {
            speedApple.x = Math.floor(Math.random() * boardSize);
            speedApple.y = Math.floor(Math.random() * boardSize);
            validSpeedPosition = true;
            snake.forEach(segment => {
            if (segment.x === speedApple.x && segment.y === speedApple.y) {
                validSpeedPosition = false;
            }
        });
        }
}

// Desenează mărul de viteză pe tabla de joc
function drawSpeedApple() {
    pixels.forEach(pixel => pixel.classList.remove('speedApple'));
    const index = speedApple.y * boardSize + speedApple.x;
    pixels[index].classList.add('speedApple');
}




//Generează o poziție aleatorie pentru mărul norocos
function generateLuckyApple() {
    let validSpeedPosition = false;
    while (!validSpeedPosition) {
        luckyApple.x = Math.floor(Math.random() * boardSize);
        luckyApple.y = Math.floor(Math.random() * boardSize);
        validSpeedPosition = true;

         snake.forEach(segment => {
            if (segment.x === luckyApple.x && segment.y === luckyApple.y) {
                validSpeedPosition = false;
            }
        });
    }
}

// Desenează mărul norocos pe tabla de joc
function drawLuckyApple() {
    pixels.forEach(pixel => pixel.classList.remove('luckyApple'));
    const index = luckyApple.y * boardSize + luckyApple.x;
    pixels[index].classList.add('luckyApple');
}

// Ascunde mărul norocos de pe tabla de joc și îl mută într-o poziție inexistentă pentru a preveni coliziunea accidentală
function hideLuckyApple() {
    pixels.forEach(pixel => pixel.classList.remove('luckyApple'));
    luckyApple.x = 1000;
    luckyApple.y = 1000;
}

// Funcția whatLuckyApple este apelată atunci când șarpele mănâncă mărul norocos
function whatLuckyApple() {
        clearInterval(gameInterval);
        alert('You won with ' + score + ' points!');
        location.reload();
}//Daca jucatorul alege sa manance lucky apple, jocul se termina cu o victorie, iar scorul final este afisat intr un alert



function updateScore() {
    scoreBoard.innerHTML = `Score: ${score}`;// Actualizează scorul afișat pe inter
}

function update() {
    moveSnake();
    drawSnake();
    drawApple();
    drawSpeedApple();
}// Funcția update este apelată la fiecare tick al jocului și se ocupă de logica principală a jocului:
//  mutarea șarpelui, redrawing sarpelui, și actualizarea poziției mărului și a mărului de viteză.


started=false;// Variabilă pentru a verifica dacă jocul a început sau nu

// Funcția changeDirection este apelată atunci când utilizatorul apasă o tastă săgeată și actualizează direcția șarpelui în consecință,
//  asigurându-se că șarpele nu poate să se întoarcă direct în direcția opusă (de exemplu, dacă merge în sus, nu poate să meargă direct în jos)
function changeDirection(event) {
    if(!started)
        { 
            ticks();
            started=true;
        }
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = {x: 1, y: 0};
            break;
    }
}


function newTick() // functia este apelată atunci când șarpele mănâncă un măr de viteză 
{
    clearInterval(gameInterval);
    speedLevel++;
    speedIndicator.innerHTML = "Speed Level: " + speedLevel;
    gameSpeed-=10;
    ticks();
}

// Funcția ticks este responsabilă pentru inițierea intervalului de joc, care apelează funcția update la fiecare gameSpeed milisecunde,
// astfel încât jocul să se actualizeze și să se miște șarpele în mod constant.\
// Când newTick este apelată, intervalul este resetat cu o viteză mai mare, făcând jocul mai rapid.
function ticks() {
    gameInterval = setInterval(update, gameSpeed); 
}

// Funcția loadGame este apelată la încărcarea paginii și se ocupă de inițializarea jocului, creând tabla de joc,
// desenând șarpele și mărul pentru prima dată
//și pregătind totul pentru a începe jocul atunci când utilizatorul apasă o tastă.
function loadGame() {
    createBoard();
    drawSnake();
    generateApple();
    drawApple();
    drawSpeedApple();
    //ticks();
}
document.addEventListener('keydown', changeDirection);
//Am folosit un event listener pentru a detecta input-ul de la tastatură și a controla direcția șarpelui

loadGame();// Apelăm funcția loadGame pentru a inițializa jocul atunci când pagina se încarcă