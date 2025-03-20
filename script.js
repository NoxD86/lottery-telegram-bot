const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
const resultDiv = document.getElementById('result');

// Список изображений (должны быть в папке images)
const images = [
    'images/apple.png',
    'images/banana.png',
    'images/cherry.png'
];
const revealedImages = [];

// Генерация трёх случайных картинок
for (let i = 0; i < 3; i++) {
    revealedImages.push(images[Math.floor(Math.random() * images.length)]);
}

// Отрисовка билета
function draw() {
    revealedImages.forEach((img, index) => {
        const imgObj = new Image();
        imgObj.src = img;
        imgObj.onload = () => {
            ctx.drawImage(imgObj, index * 100, 0, 100, 100);
        };
    });
    // Защитный слой
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Логика царапания
let isDrawing = false;

canvas.addEventListener('mousedown', () => (isDrawing = true));
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    checkWin();
});
canvas.addEventListener('mousemove', scratch);

canvas.addEventListener('touchstart', () => (isDrawing = true));
canvas.addEventListener('touchend', () => {
    isDrawing = false;
    checkWin();
});
canvas.addEventListener('touchmove', scratchTouch);

function scratch(e) {
    if (isDrawing) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(e.offsetX, e.offsetY, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

function scratchTouch(e) {
    if (isDrawing) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Проверка выигрыша
function checkWin() {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const scratched = pixels.filter((p, i) => i % 4 === 3 && p === 0).length / (canvas.width * canvas.height);
    if (scratched > 0.7) { // Проверяем, стёрто ли 70% слоя
        if (revealedImages.every(img => img === revealedImages[0])) {
            resultDiv.textContent = 'Вы выиграли!';
            window.Telegram.WebApp.sendData(JSON.stringify({ result: 'win' }));
        } else {
            resultDiv.textContent = 'Попробуйте ещё раз!';
            window.Telegram.WebApp.sendData(JSON.stringify({ result: 'lose' }));
        }
    }
}

// Инициализация
draw();