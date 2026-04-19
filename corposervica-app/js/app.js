// 🔹 AUTOCOMPLETAR CI
function setOperadorCI() {
    let select = document.getElementById("operador");
    let ci = select.options[select.selectedIndex].getAttribute("data-ci");
    document.getElementById("ci_operador").value = ci || "";
}

function setOdsCI() {
    let select = document.getElementById("ods");
    let ci = select.options[select.selectedIndex].getAttribute("data-ci");
    document.getElementById("ci_ods").value = ci || "";
}

// 🔹 ENVÍO
async function handleSubmit() {
    let municipio = document.getElementById("municipio").value;
    let parroquia = document.getElementById("parroquia").value;
    let asunto = document.getElementById("asunto").value;
    let marca = document.getElementById("marca").value;
    let modelo = document.getElementById("modelo").value;
    let placa = document.getElementById("placa").value;
    let tipo = document.getElementById("tipo").value;
    let operador = document.getElementById("operador").value;
    let ods = document.getElementById("ods").value;
    if (placa.length < 5) {
        alert("⚠️ Placa inválida");
        return;
    }
    // 🔴 VALIDACIÓN
    if (!municipio || !parroquia || !asunto || !marca || !modelo || !placa || !tipo || !operador || !ods) {
        alert("⚠️ Completa todos los campos obligatorios");
        return;
    }
    let ahora = new Date();

    let fecha = ahora.toLocaleDateString("es-VE", {
        timeZone: "America/Caracas"
    });

    let hora = ahora.toLocaleTimeString("es-VE", {
        timeZone: "America/Caracas",
        hour: "2-digit",
        minute: "2-digit"
    });

    let data = {
        fecha,
        hora,
        cliente: document.getElementById("cliente").value,
        municipio: document.getElementById("municipio").value,
        parroquia: document.getElementById("parroquia").value,
        asunto: document.getElementById("asunto").value,
        marca: document.getElementById("marca").value,
        modelo: document.getElementById("modelo").value,
        color: document.getElementById("color").value,
        placa: document.getElementById("placa").value,
        tipo: document.getElementById("tipo").value,
        area: document.getElementById("area").value,
        autoriza: document.getElementById("autoriza").value,
        operador: document.getElementById("operador").value,
        ci_operador: document.getElementById("ci_operador").value,
        ods: document.getElementById("ods").value,
        ci_ods: document.getElementById("ci_ods").value
    };

    try {

        await fetch(WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

    } catch (error) {

        console.log("Sin conexión, guardando local...");

        // 🔴 Guardar en localStorage
        let pendientes = JSON.parse(localStorage.getItem("reportes_pendientes")) || [];

        pendientes.push(data);

        localStorage.setItem("reportes_pendientes", JSON.stringify(pendientes));

        alert("📴 Sin internet. Reporte guardado localmente");
    }

    let mensaje = `
CORPOSERVICA PORTUGUESA

FECHA: ${data.fecha}
HORA: ${data.hora}
CLIENTE: ${data.cliente}

MUNICIPIO: ${data.municipio}
PARROQUIA: ${data.parroquia}

ASUNTO:
${data.asunto}

DATOS DEL VEHÍCULO:
Marca: ${data.marca}
Modelo: ${data.modelo}
Color: ${data.color}
Placa: ${data.placa}
Tipo: ${data.tipo}
Área: ${data.area}

AUTORIZADO POR: ${data.autoriza}

Guardia: ${data.operador} CI:${data.ci_operador}
ODS: ${data.ods} CI:${data.ci_ods}
`;

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`);

    document.getElementById("formReporte").reset();
}

function cargarParroquias() {

    let municipio = document.getElementById("municipio").value;
    let parroquiaSelect = document.getElementById("parroquia");

    // limpiar opciones
    parroquiaSelect.innerHTML = '<option value="">Seleccionar</option>';

    if (!municipio || !DATA_UBICACION[municipio]) return;

    let parroquias = DATA_UBICACION[municipio];

    parroquias.forEach(p => {
        let option = document.createElement("option");
        option.value = p;
        option.textContent = p;
        parroquiaSelect.appendChild(option);
    });
}

function cargarMunicipios() {
    let select = document.getElementById("municipio");

    Object.keys(DATA_UBICACION).forEach(m => {
        let option = document.createElement("option");
        option.value = m;
        option.textContent = m;
        select.appendChild(option);
    });
}

function cargarModelos() {

    let marca = document.getElementById("marca").value;
    let modeloSelect = document.getElementById("modelo");
    let tipoSelect = document.getElementById("tipo");

    modeloSelect.innerHTML = '<option value="">Seleccionar</option>';
    tipoSelect.innerHTML = '<option value="">Seleccionar</option>'; // limpia tipo

    if (!marca || !DATA_VEHICULOS[marca]) return;

    let modelos = Object.keys(DATA_VEHICULOS[marca]);

    modelos.forEach(m => {
        let option = document.createElement("option");
        option.value = m;
        option.textContent = m;
        modeloSelect.appendChild(option);
    });
}

function cargarMarcas() {
    let select = document.getElementById("marca");

    Object.keys(DATA_VEHICULOS).forEach(marca => {
        let option = document.createElement("option");
        option.value = marca;
        option.textContent = marca;
        select.appendChild(option);
    });
}

function cargarTipos() {

    let marca = document.getElementById("marca").value;
    let modelo = document.getElementById("modelo").value;
    let tipoSelect = document.getElementById("tipo");

    tipoSelect.innerHTML = '<option value="">Seleccionar</option>';

    if (!marca || !modelo || !DATA_VEHICULOS[marca] || !DATA_VEHICULOS[marca][modelo]) return;

    let tipos = DATA_VEHICULOS[marca][modelo];

    tipos.forEach(t => {
        let option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        tipoSelect.appendChild(option);
    });
}

async function reenviarPendientes() {

    let pendientes = JSON.parse(localStorage.getItem("reportes_pendientes")) || [];

    if (pendientes.length === 0) return;

    console.log("Reintentando enviar pendientes...");

    let enviados = [];

    for (let reporte of pendientes) {

        try {
            await fetch(WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reporte)
            });

            enviados.push(reporte);

        } catch (error) {
            console.log("Aún sin conexión...");
            break;
        }
    }

    // eliminar los que sí se enviaron
    let restantes = pendientes.filter(p => !enviados.includes(p));

    localStorage.setItem("reportes_pendientes", JSON.stringify(restantes));
}

window.addEventListener("online", reenviarPendientes);
cargarMunicipios();
cargarMarcas();
