



const equipos = [
    "PLUMA JLG 400",
    "PLUMA JLG 300",
    "TIJERA HAULOTTE"
];
const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

// Cargar reservas desde localStorage
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

// Si hay reservas, generar calendario
if (reservas.length > 0) {
    const fechas = reservas.map(r => r.fecha);
    const minFecha = fechas.reduce((a, b) => a < b ? a : b);
    const maxFecha = fechas.reduce((a, b) => a > b ? a : b);
    generarCalendario(minFecha, maxFecha);
}

// Captura del formulario
document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const sector = document.getElementById("sector").value.trim();
    const equipo = document.getElementById("medioElevacion").value;
    const fechaInicio = document.getElementById("fecha-inicio").value;
    const fechaFin = document.getElementById("fecha-fin").value;

    if (!usuario || !equipo || !fechaInicio || !fechaFin) {
        alert("Completa todos los campos antes de ingresar.");
        return;
    }

    if (!esMedioDisponible(equipo, fechaInicio, fechaFin)) {
        alert(`❌ El medio "${equipo}" ya está reservado en ese rango de fechas`);
        return;
    }


    let actual = new Date(fechaInicio + "T00:00:00");
    const fin = new Date(fechaFin + "T00:00:00");

    while (actual <= fin) {
        const fechaISO = actual.toISOString().split("T")[0];

        // Evitar duplicados
        const existe = reservas.find(r => r.equipo === equipo && r.fecha === fechaISO);
        if (!existe) {
            reservas.push({
                usuario,
                sector,
                equipo,
                fecha: fechaISO
            });
        }

        actual.setDate(actual.getDate() + 1);
    }

    // Guardar en localStorage
    localStorage.setItem("reservas", JSON.stringify(reservas));

    generarCalendario(fechaInicio, fechaFin);
    this.reset();
});

// Borrar reservas
document.getElementById("borrarDatos").addEventListener("click", function () {
    if (confirm("¿Seguro que quieres borrar todas las reservas?")) {
        reservas = [];
        localStorage.removeItem("reservas");
        document.getElementById("tablaDias").innerHTML = "";
        document.getElementById("filaEquipos").innerHTML = "<th>DÍA</th>";
    }
});

// Función para generar calendario con filas = días, columnas = equipos
function generarCalendario(fechaInicio, fechaFin) {
    const filaEquipos = document.getElementById("filaEquipos");
    const tablaDias = document.getElementById("tablaDias");

    filaEquipos.innerHTML = "<th>DÍA</th>";
    tablaDias.innerHTML = "";

    // Generar columnas de equipos
    equipos.forEach(equipo => {
        const th = document.createElement("th");
        th.textContent = equipo;
        filaEquipos.appendChild(th);
    });

    // Generar filas de días
    let actual = new Date(fechaInicio + "T00:00:00");
    const fin = new Date(fechaFin + "T00:00:00");

    while (actual <= fin) {
        const fechaISO = actual.toISOString().split("T")[0];
        const diaTexto = diasSemana[actual.getDay()];
        const textoDia = `${diaTexto} ${actual.getDate()}/${actual.getMonth() + 1}`;

        const tr = document.createElement("tr");

        // primera columna = fecha
        const tdDia = document.createElement("td");
        tdDia.textContent = textoDia;
        tdDia.classList.add("col-fija");
        tr.appendChild(tdDia);

        // columnas por cada equipo
        equipos.forEach(equipo => {
            const td = document.createElement("td");
            const reserva = reservas.find(r => r.equipo === equipo && r.fecha === fechaISO);

            /* Agregado */
            if (reserva) {
                td.classList.add("reservado");

                const nombre = document.createElement("div");
                nombre.textContent = reserva.usuario;

                const btnBorrar = document.createElement("button");
                btnBorrar.textContent = "❌";
                btnBorrar.classList.add("btn-borrar");
                btnBorrar.title = "Eliminar reserva";

                btnBorrar.addEventListener("click", () => {
                    borrarReserva(reserva.equipo, reserva.fecha);
                });

                td.appendChild(nombre);
                td.appendChild(btnBorrar);
            }

            /* Fin agregado */

            /*  if (reserva) {
                 td.textContent = reserva.usuario;
                 td.classList.add("reservado");
             } */
            tr.appendChild(td);
        });

        tablaDias.appendChild(tr);
        actual.setDate(actual.getDate() + 1);
    }
}



function esMedioDisponible(medio, fechaInicio, fechaFin) {

    console.log("▶ Verificando disponibilidad:", medio, fechaInicio, fechaFin);

    let reservasExistentes = JSON.parse(localStorage.getItem("reservas")) || [];

    let actual = new Date(fechaInicio + "T00:00:00");
    const fin = new Date(fechaFin + "T00:00:00");

    while (actual <= fin) {

        const fechaISO = actual.toISOString().split("T")[0];

        const existe = reservasExistentes.find(r =>
            r.equipo.trim().toUpperCase() === medio.trim().toUpperCase() &&
            r.fecha === fechaISO
        );

        if (existe) {
            console.warn("❌ Medio NO disponible:", medio, fechaISO);
            return false;
        }

        actual.setDate(actual.getDate() + 1);
    }

    return true;
}

function borrarReserva(equipo, fecha) {
    if (!confirm(`¿Eliminar la reserva del ${equipo} para el día ${fecha}?`)) {
        return;
    }

    reservas = reservas.filter(r =>
        !(r.equipo === equipo && r.fecha === fecha)
    );

    localStorage.setItem("reservas", JSON.stringify(reservas));

    // Recalcular rango del calendario
    if (reservas.length > 0) {
        const fechas = reservas.map(r => r.fecha);
        const minFecha = fechas.reduce((a, b) => a < b ? a : b);
        const maxFecha = fechas.reduce((a, b) => a > b ? a : b);
        generarCalendario(minFecha, maxFecha);
    } else {
        document.getElementById("tablaDias").innerHTML = "";
        document.getElementById("filaEquipos").innerHTML = "<th>DÍA</th>";
    }
}




