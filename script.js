const palos = ["♠", "♥", "♦", "♣"];
const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const cartasCpu1HTML = document.getElementById("cartas-cpu-1");
const cartasCpu2HTML = document.getElementById("cartas-cpu-2");
const cartasComunitariasHTML = document.getElementById("cartas-comunitarias");
const cartasJugadorHTML = document.getElementById("cartas-jugador");

const resultadoHTML = document.getElementById("resultado");
const mensajeGrandeHTML = document.getElementById("mensaje-grande");
const pozoHTML = document.getElementById("pozo");
const dineroActualHTML = document.getElementById("dinero-actual");
const apuestaActualHTML = document.getElementById("apuesta-actual");
const deudaActualHTML = document.getElementById("deuda-actual");
const dineroCpu1HTML = document.getElementById("dinero-cpu-1");
const dineroCpu2HTML = document.getElementById("dinero-cpu-2");
const estadoCasaHTML = document.getElementById("estado-casa");
const mazoCasaHTML = document.getElementById("mazo-casa");

const btnRepartir = document.getElementById("btn-repartir");
const btnPrestamo = document.getElementById("btn-prestamo");
const btnFold = document.getElementById("btn-fold");
const btnCheck = document.getElementById("btn-check");
const btnCall = document.getElementById("btn-call");
const btnRaise = document.getElementById("btn-raise");
const btnAllIn = document.getElementById("btn-all-in");

let dinero = 500;
let dineroCpu1 = 5100;
let dineroCpu2 = 5100;
let deuda = 0;
let prestamoUsado = false;

let pozo = 0;
let apuestaActual = 0;
let apuestaBase = 10;

let jugador = [];
let cpu1 = [];
let cpu2 = [];
let comunitarias = [];
let cartasVisibles = 3;
let partidaActiva = false;
let repartiendo = false;

btnRepartir.addEventListener("click", repartirCartas);
btnPrestamo.addEventListener("click", pedirPrestamo);
btnFold.addEventListener("click", fold);
btnCheck.addEventListener("click", check);
btnCall.addEventListener("click", call);
btnRaise.addEventListener("click", raise);
btnAllIn.addEventListener("click", allIn);

prepararMesa();

function prepararMesa() {
  mostrarCartasOcultas(cartasCpu1HTML, 2);
  mostrarCartasOcultas(cartasCpu2HTML, 2);
  mostrarCartasOcultas(cartasJugadorHTML, 2);
  mostrarCartasOcultas(cartasComunitariasHTML, 5);
  actualizarPantalla();
}

function pedirPrestamo() {
  if (dinero > 0 || partidaActiva || repartiendo || prestamoUsado) {
    return;
  }

  dinero += 500;
  deuda += 525;
  prestamoUsado = true;

  mostrarMensajeGrande("Préstamo recibido<br>$500");
  resultadoHTML.textContent = "Recibiste un préstamo de $500. Debes devolver $525.";
  actualizarPantalla();
}

function crearMazo() {
  const mazo = [];

  for (let palo of palos) {
    for (let valor of valores) {
      mazo.push({
        valor: valor,
        palo: palo,
        texto: valor + palo
      });
    }
  }

  return mazo;
}

function mezclarMazo(mazo) {
  for (let i = mazo.length - 1; i > 0; i--) {
    const posicionAleatoria = Math.floor(Math.random() * (i + 1));
    const cartaTemporal = mazo[i];

    mazo[i] = mazo[posicionAleatoria];
    mazo[posicionAleatoria] = cartaTemporal;
  }

  return mazo;
}

async function repartirCartas() {
  if (partidaActiva || repartiendo || dinero <= 0) {
    if (dinero <= 0) {
      resultadoHTML.textContent = prestamoUsado
        ? "No tienes dinero para empezar otra mano."
        : "No tienes dinero. Puedes pedir un préstamo.";
    }
    return;
  }

  repartiendo = true;
  actualizarPantalla();

  const mazo = mezclarMazo(crearMazo());

  jugador = [mazo.pop(), mazo.pop()];
  cpu1 = [mazo.pop(), mazo.pop()];
  cpu2 = [mazo.pop(), mazo.pop()];
  comunitarias = [mazo.pop(), mazo.pop(), mazo.pop(), mazo.pop(), mazo.pop()];

  pozo = 0;
  apuestaActual = 0;
  cartasVisibles = 3;

  limpiarMesa();
  cobrarApuestaATodos(apuestaBase);

  estadoCasaHTML.textContent = "Repartiendo...";
  mazoCasaHTML.classList.add("repartiendo");

  await repartirOculta(cartasCpu1HTML);
  await repartirOculta(cartasCpu2HTML);
  await repartirCarta(cartasJugadorHTML, jugador[0]);

  await repartirOculta(cartasCpu1HTML);
  await repartirOculta(cartasCpu2HTML);
  await repartirCarta(cartasJugadorHTML, jugador[1]);

  await repartirCarta(cartasComunitariasHTML, comunitarias[0]);
  await repartirCarta(cartasComunitariasHTML, comunitarias[1]);
  await repartirCarta(cartasComunitariasHTML, comunitarias[2]);
  await repartirOculta(cartasComunitariasHTML);
  await repartirOculta(cartasComunitariasHTML);

  estadoCasaHTML.textContent = "Cartas repartidas";
  mazoCasaHTML.classList.remove("repartiendo");

  partidaActiva = true;
  repartiendo = false;

  resultadoHTML.textContent = "Todos apostaron $10. Puedes jugar la mano.";
  actualizarPantalla();
}

function limpiarMesa() {
  cartasCpu1HTML.innerHTML = "";
  cartasCpu2HTML.innerHTML = "";
  cartasJugadorHTML.innerHTML = "";
  cartasComunitariasHTML.innerHTML = "";
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function repartirCarta(contenedor, carta) {
  crearCartaHTML(contenedor, carta);
  await esperar(170);
}

async function repartirOculta(contenedor) {
  crearCartaOcultaHTML(contenedor);
  await esperar(170);
}

function cobrarApuestaATodos(cantidad) {
  const pagoJugador = Math.min(cantidad, dinero);
  const pagoCpu1 = Math.min(cantidad, dineroCpu1);
  const pagoCpu2 = Math.min(cantidad, dineroCpu2);

  dinero -= pagoJugador;
  dineroCpu1 -= pagoCpu1;
  dineroCpu2 -= pagoCpu2;

  pozo += pagoJugador + pagoCpu1 + pagoCpu2;
  apuestaActual += pagoJugador;
}

function fold() {
  if (!partidaActiva) {
    return;
  }

  mostrarCartas(cartasCpu1HTML, cpu1);
  mostrarCartas(cartasCpu2HTML, cpu2);

  const ganadorCpu = Math.random() < 0.5 ? "Computadora 1" : "Computadora 2";

  if (ganadorCpu === "Computadora 1") {
    dineroCpu1 += pozo;
  } else {
    dineroCpu2 += pozo;
  }

  mostrarMensajeGrande("Fold<br>Pozo para " + ganadorCpu);
  resultadoHTML.textContent = "Fold. El pozo de $" + pozo + " fue para " + ganadorCpu + ".";
  pozo = 0;
  apuestaActual = 0;
  partidaActiva = false;
  estadoCasaHTML.textContent = "Mano terminada";
  actualizarPantalla();
}

function check() {
  if (!partidaActiva) {
    resultadoHTML.textContent = "Primero reparte las cartas.";
    return;
  }

  resultadoHTML.textContent = "Check. Nadie subió la apuesta.";
  revelarCarta();
  actualizarPantalla();
}

function call() {
  pagarRonda(apuestaBase, "Call. Todos igualaron $10.");
}

function raise() {
  pagarRonda(50, "Raise. Todos igualaron tu subida de $50.");
}

function allIn() {
  if (!partidaActiva) {
    resultadoHTML.textContent = "Primero reparte las cartas.";
    return;
  }

  const cantidad = dinero;
  cobrarApuestaATodos(cantidad);
  resultadoHTML.textContent = "All-in. Apostaste todas tus fichas.";
  revelarCartasRestantes();
  actualizarPantalla();
}

function pagarRonda(cantidad, mensaje) {
  if (!partidaActiva) {
    resultadoHTML.textContent = "Primero reparte las cartas.";
    return;
  }

  if (dinero <= 0) {
    resultadoHTML.textContent = "Ya estás all-in. Se revelan las cartas restantes.";
    revelarCartasRestantes();
    return;
  }

  cobrarApuestaATodos(cantidad);
  resultadoHTML.textContent = mensaje;

  if (dinero === 0) {
    revelarCartasRestantes();
  } else {
    revelarCarta();
  }

  actualizarPantalla();
}

function revelarCarta() {
  if (cartasVisibles < 5) {
    cartasVisibles++;
    mostrarComunitarias();

    if (cartasVisibles === 4) {
      resultadoHTML.textContent += " Se reveló la cuarta carta.";
    } else {
      terminarMano();
    }
  } else {
    terminarMano();
  }
}

async function revelarCartasRestantes() {
  actualizarPantalla();

  while (cartasVisibles < 5 && partidaActiva) {
    await esperar(600);
    cartasVisibles++;
    mostrarComunitarias();
  }

  if (partidaActiva) {
    await esperar(500);
    terminarMano();
  }
}

function terminarMano() {
  mostrarCartas(cartasCpu1HTML, cpu1);
  mostrarCartas(cartasCpu2HTML, cpu2);

  const jugadaJugador = obtenerJugada(jugador.concat(comunitarias));
  const jugadaCpu1 = obtenerJugada(cpu1.concat(comunitarias));
  const jugadaCpu2 = obtenerJugada(cpu2.concat(comunitarias));

  const ganador = obtenerGanador([
    { nombre: "Jugador", jugada: jugadaJugador },
    { nombre: "Computadora 1", jugada: jugadaCpu1 },
    { nombre: "Computadora 2", jugada: jugadaCpu2 }
  ]);

  if (ganador.nombre === "Jugador") {
    const pozoGanado = pozo;
    dinero += pozoGanado;
    const pagoDeuda = pagarDeudaAutomatica();

    mostrarMensajeGrande("Ganaste $" + pozoGanado + "<br>" + jugadaJugador.nombre);

    resultadoHTML.textContent = "Ganaste $" + pozoGanado + " con " + jugadaJugador.nombre + ".";
    if (pagoDeuda > 0) {
      resultadoHTML.textContent += " Pagaste $" + pagoDeuda + " de deuda.";
    }
  } else if (ganador.nombre === "Computadora 1") {
    dineroCpu1 += pozo;
    mostrarMensajeGrande("Perdiste<br>Ganó Computadora 1");
    resultadoHTML.textContent = "Perdiste. Ganó Computadora 1 $" + pozo + " con " + jugadaCpu1.nombre + ".";
  } else {
    dineroCpu2 += pozo;
    mostrarMensajeGrande("Perdiste<br>Ganó Computadora 2");
    resultadoHTML.textContent = "Perdiste. Ganó Computadora 2 $" + pozo + " con " + jugadaCpu2.nombre + ".";
  }

  pozo = 0;
  apuestaActual = 0;
  partidaActiva = false;
  estadoCasaHTML.textContent = "Mano terminada";
  actualizarPantalla();
}

function pagarDeudaAutomatica() {
  if (deuda <= 0 || dinero <= 0) {
    return 0;
  }

  const pago = Math.min(dinero, deuda);
  dinero -= pago;
  deuda -= pago;

  if (deuda === 0) {
    prestamoUsado = false;
  }

  return pago;
}

function mostrarMensajeGrande(texto) {
  mensajeGrandeHTML.innerHTML = texto;
  mensajeGrandeHTML.classList.remove("visible");

  void mensajeGrandeHTML.offsetWidth;

  mensajeGrandeHTML.classList.add("visible");
}

function obtenerGanador(participantes) {
  let ganador = participantes[0];

  for (let participante of participantes) {
    if (participante.jugada.valor > ganador.jugada.valor) {
      ganador = participante;
    }
  }

  return ganador;
}

function mostrarComunitarias() {
  cartasComunitariasHTML.innerHTML = "";

  for (let i = 0; i < comunitarias.length; i++) {
    if (i < cartasVisibles) {
      crearCartaHTML(cartasComunitariasHTML, comunitarias[i]);
    } else {
      crearCartaOcultaHTML(cartasComunitariasHTML);
    }
  }
}

function mostrarCartas(contenedor, cartas) {
  contenedor.innerHTML = "";

  for (let carta of cartas) {
    crearCartaHTML(contenedor, carta);
  }
}

function mostrarCartasOcultas(contenedor, cantidad) {
  contenedor.innerHTML = "";

  for (let i = 0; i < cantidad; i++) {
    crearCartaOcultaHTML(contenedor);
  }
}

function crearCartaHTML(contenedor, carta) {
  const div = document.createElement("div");
  div.classList.add("carta");

  if (carta.palo === "♥" || carta.palo === "♦") {
    div.classList.add("roja");
  }

  div.textContent = carta.texto;
  contenedor.appendChild(div);
}

function crearCartaOcultaHTML(contenedor) {
  const div = document.createElement("div");
  div.classList.add("carta", "oculta");
  div.textContent = "?";
  contenedor.appendChild(div);
}

function actualizarPantalla() {
  dineroActualHTML.textContent = "Tu dinero: $" + dinero;
  apuestaActualHTML.textContent = "Apuesta: $" + apuestaActual;
  deudaActualHTML.textContent = "Deuda: $" + deuda;
  dineroCpu1HTML.textContent = "$" + dineroCpu1;
  dineroCpu2HTML.textContent = "$" + dineroCpu2;
  pozoHTML.textContent = pozo;

  btnRepartir.disabled = partidaActiva || repartiendo || dinero <= 0;
  btnFold.disabled = !partidaActiva;
  btnCheck.disabled = !partidaActiva;
  btnCall.disabled = !partidaActiva || dinero <= 0;
  btnRaise.disabled = !partidaActiva || dinero <= 0;
  btnAllIn.disabled = !partidaActiva || dinero <= 0;

  btnPrestamo.style.display =
    dinero <= 0 && !partidaActiva && !repartiendo && !prestamoUsado
      ? "inline-block"
      : "none";
}

function obtenerJugada(cartas) {
  const conteoValores = {};

  for (let carta of cartas) {
    if (conteoValores[carta.valor]) {
      conteoValores[carta.valor]++;
    } else {
      conteoValores[carta.valor] = 1;
    }
  }

  const repeticiones = Object.values(conteoValores);
  const cantidadPares = repeticiones.filter(cantidad => cantidad === 2).length;

  if (repeticiones.includes(4)) {
    return { nombre: "Póker", valor: 7 };
  }

  if (repeticiones.includes(3) && repeticiones.includes(2)) {
    return { nombre: "Full house", valor: 6 };
  }

  if (repeticiones.includes(3)) {
    return { nombre: "Trío", valor: 3 };
  }

  if (cantidadPares >= 2) {
    return { nombre: "Doble par", valor: 2 };
  }

  if (cantidadPares === 1) {
    return { nombre: "Par", valor: 1 };
  }

  return { nombre: "Carta alta", valor: 0 };
}