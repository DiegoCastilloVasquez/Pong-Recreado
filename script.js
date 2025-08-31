const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
let maxPuntuacion = 5;
let velocidadJugador = 8;
let velocidadPelota = 5;
let controlesP1 = { arriba: 'w', abajo: 's' };
let controlesP2 = { arriba: 'ArrowUp', abajo: 'ArrowDown' };
let juegoEnPausa = true;
let juegoTerminado = false;

const anchoPaleta = 10;
let altoPaleta;
let anchoCanvas;
let altoCanvas;
let pelota;
let paleta1;
let paleta2;
let puntuacion1 = 0;
let puntuacion2 = 0;

let teclasPresionadas = {};

function redimensionarCanvas() {
    anchoCanvas = window.innerWidth * 0.8;
    altoCanvas = anchoCanvas * 0.6;
    if (altoCanvas > window.innerHeight * 0.7) {
        altoCanvas = window.innerHeight * 0.7;
        anchoCanvas = altoCanvas / 0.6;
    }
    canvas.width = anchoCanvas;
    canvas.height = altoCanvas;
    altoPaleta = altoCanvas / 5;

    if (pelota) {
        pelota.reiniciar();
    }
}

window.addEventListener('resize', redimensionarCanvas);
redimensionarCanvas();

class Paleta {
    constructor(x, y, ancho, alto) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.velocidad = velocidadJugador;
    }

    dibujar() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);
    }

    moverArriba() {
        this.y = Math.max(0, this.y - this.velocidad);
    }

    moverAbajo() {
        this.y = Math.min(altoCanvas - this.alto, this.y + this.velocidad);
    }
}

class Pelota {
    constructor(x, y, radio) {
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.velocidad = velocidadPelota;
        this.dx = this.velocidad * (Math.random() > 0.5 ? 1 : -1);
        this.dy = this.velocidad * (Math.random() * 2 - 1);
    }

    dibujar() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fill();
    }

    mover() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.y - this.radio < 0 || this.y + this.radio > altoCanvas) {
            this.dy *= -1;
        }
    }

    reiniciar() {
        this.x = anchoCanvas / 2;
        this.y = altoCanvas / 2;
        this.velocidad = velocidadPelota;
        this.dx = this.velocidad * (Math.random() > 0.5 ? 1 : -1);
        this.dy = this.velocidad * (Math.random() * 2 - 1);
    }
}

function mostrarOpciones() {
    document.getElementById('menu-pantalla').classList.add('oculto');
    document.getElementById('opciones-pantalla').classList.remove('oculto');
}

function manejarTeclaAbajo(event, inputElement) {
    event.preventDefault();
    inputElement.value = event.key;
}

function iniciarJuego() {
    maxPuntuacion = parseInt(document.getElementById('max-score').value, 10) || 5;
    velocidadJugador = parseInt(document.getElementById('paddle-speed').value, 10) || 8;
    velocidadPelota = parseInt(document.getElementById('ball-speed').value, 10) || 5;

    controlesP1.arriba = document.getElementById('p1-up').value.toLowerCase();
    controlesP1.abajo = document.getElementById('p1-down').value.toLowerCase();
    controlesP2.arriba = document.getElementById('p2-up').value.toLowerCase();
    controlesP2.abajo = document.getElementById('p2-down').value.toLowerCase();

    document.getElementById('opciones-pantalla').classList.add('oculto');
    document.getElementById('juego-contenedor').classList.remove('oculto');

    prepararJuego();
}

function prepararJuego() {
    puntuacion1 = 0;
    puntuacion2 = 0;
    juegoTerminado = false;
    juegoEnPausa = true;
    actualizarPuntuacion();

    paleta1 = new Paleta(10, altoCanvas / 2 - altoPaleta / 2, anchoPaleta, altoPaleta);
    paleta2 = new Paleta(anchoCanvas - anchoPaleta - 10, altoCanvas / 2 - altoPaleta / 2, anchoPaleta, altoPaleta);
    pelota = new Pelota(anchoCanvas / 2, altoCanvas / 2, 7);

    document.getElementById('start-mensaje').style.display = 'block';
    window.requestAnimationFrame(bucleJuego);
}

function actualizarPuntuacion() {
    document.getElementById('score1').innerText = puntuacion1;
    document.getElementById('score2').innerText = puntuacion2;
}

function mostrarFinDelJuego(ganador) {
    juegoTerminado = true;
    juegoEnPausa = true;
    const overlayFinDeJuego = document.createElement('div');
    overlayFinDeJuego.classList.add('juego-over-overlay');
    overlayFinDeJuego.innerHTML = `<div class="juego-over-content">
                                        <h2 class="juego-over-title">${ganador === 'jugador1' ? '¡Jugador 1 Ganó!' : '¡Jugador 2 Ganó!'}</h2>
                                        <button class="juego-button" onclick="location.reload()">Continuar</button>
                                    </div>`;
    document.body.appendChild(overlayFinDeJuego);
}

function manejarEntrada() {
    if (teclasPresionadas[controlesP1.arriba]) {
        paleta1.moverArriba();
    }
    if (teclasPresionadas[controlesP1.abajo]) {
        paleta1.moverAbajo();
    }

    if (teclasPresionadas[controlesP2.arriba]) {
        paleta2.moverArriba();
    }
    if (teclasPresionadas[controlesP2.abajo]) {
        paleta2.moverAbajo();
    }
}

function verificarColision() {
    if (pelota.x - pelota.radio < paleta1.x + paleta1.ancho &&
        pelota.y + pelota.radio > paleta1.y &&
        pelota.y - pelota.radio < paleta1.y + paleta1.alto) {

        const interseccionYRelativa = (paleta1.y + (paleta1.alto / 2)) - pelota.y;
        const interseccionYRelativaNormalizada = (interseccionYRelativa / (paleta1.alto / 2));
        const anguloRebote = interseccionYRelativaNormalizada * (Math.PI / 4);

        pelota.dx = pelota.velocidad * Math.cos(anguloRebote);
        pelota.dy = pelota.velocidad * -Math.sin(anguloRebote);
        pelota.velocidad += 0.5;
    }

    if (pelota.x + pelota.radio > paleta2.x &&
        pelota.y + pelota.radio > paleta2.y &&
        pelota.y - pelota.radio < paleta2.y + paleta2.alto) {

        const interseccionYRelativa = (paleta2.y + (paleta2.alto / 2)) - pelota.y;
        const interseccionYRelativaNormalizada = (interseccionYRelativa / (paleta2.alto / 2));
        const anguloRebote = interseccionYRelativaNormalizada * (Math.PI / 4);

        pelota.dx = pelota.velocidad * -Math.cos(anguloRebote);
        pelota.dy = pelota.velocidad * -Math.sin(anguloRebote);
        pelota.velocidad += 0.5;
    }
}

function verificarPuntuacion() {
    if (pelota.x + pelota.radio < 0) {
        puntuacion2++;
        pelota.reiniciar();
        actualizarPuntuacion();
        juegoEnPausa = true;
        document.getElementById('start-mensaje').innerText = `¡Punto para el Jugador 2! Presiona cualquier tecla para continuar.`;
        document.getElementById('start-mensaje').style.display = 'block';
        if (puntuacion2 >= maxPuntuacion) {
            mostrarFinDelJuego('jugador2');
            return false;
        }
    } else if (pelota.x - pelota.radio > anchoCanvas) {
        puntuacion1++;
        pelota.reiniciar();
        actualizarPuntuacion();
        juegoEnPausa = true;
        document.getElementById('start-mensaje').innerText = `¡Punto para el Jugador 1! Presiona cualquier tecla para continuar.`;
        document.getElementById('start-mensaje').style.display = 'block';
        if (puntuacion1 >= maxPuntuacion) {
            mostrarFinDelJuego('jugador1');
            return false;
        }
    }
    return true;
}

function bucleJuego() {
    if (juegoTerminado) {
        return;
    }

    ctx.clearRect(0, 0, anchoCanvas, altoCanvas);

    paleta1.dibujar();
    paleta2.dibujar();
    pelota.dibujar();

    if (!juegoEnPausa) {
        manejarEntrada();
        pelota.mover();
        verificarColision();
        if (!verificarPuntuacion()) {
            return;
        }
    }

    window.requestAnimationFrame(bucleJuego);
}

window.addEventListener('keydown', (e) => {
    if (juegoEnPausa && !juegoTerminado) {
        juegoEnPausa = false;
        document.getElementById('start-mensaje').style.display = 'none';
        pelota.reiniciar();
    }
    teclasPresionadas[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    teclasPresionadas[e.key.toLowerCase()] = false;
});

const previewCanvas = document.getElementById('pong-preview-canvas');
const previewCtx = previewCanvas.getContext('2d');
const anchoP = 10;
const altoP = 50;
const radioB = 6;
const velocidadP = 1.5;
const velocidadB = 2;

let yP1 = previewCanvas.height / 2 - altoP / 2;
let yP2 = previewCanvas.height / 2 - altoP / 2;
let xB = previewCanvas.width / 2;
let yB = previewCanvas.height / 2;
let dxB = velocidadB * (Math.random() > 0.5 ? 1 : -1);
let dyB = velocidadB * (Math.random() * 2 - 1);

function dibujarPreview() {
    previewCtx.fillStyle = '#010409';
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.fillStyle = '#c9d1d9';
    previewCtx.fillRect(10, yP1, anchoP, altoP);
    previewCtx.fillRect(previewCanvas.width - anchoP - 10, yP2, anchoP, altoP);
    previewCtx.beginPath();
    previewCtx.arc(xB, yB, radioB, 0, Math.PI * 2);
    previewCtx.fill();
}

function actualizarPreview() {
    xB += dxB;
    yB += dyB;

    if (xB < previewCanvas.width / 2) {
        yP1 += (yB - (yP1 + altoP / 2)) * 0.05;
    }

    if (xB > previewCanvas.width / 2) {
        yP2 += (yB - (yP2 + altoP / 2)) * 0.05;
    }

    if (yB - radioB < 0 || yB + radioB > previewCanvas.height) {
        dyB *= -1;
    }

    if (xB - radioB < 10 + anchoP && yB > yP1 && yB < yP1 + altoP) {
        dxB *= -1;
    }

    if (xB + radioB > previewCanvas.width - 10 - anchoP && yB > yP2 && yB < yP2 + altoP) {
        dxB *= -1;
    }

    if (xB < 0 || xB > previewCanvas.width) {
        xB = previewCanvas.width / 2;
        yB = previewCanvas.height / 2;
        dxB = velocidadB * (Math.random() > 0.5 ? 1 : -1);
        dyB = velocidadB * (Math.random() * 2 - 1);
    }
}

function buclePreview() {
    actualizarPreview();
    dibujarPreview();
    requestAnimationFrame(buclePreview);
}

buclePreview();