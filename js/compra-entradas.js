const almacenamientoPedido = "charcada-pedido";
const categorias = [
	{ id: "cat-1", nombre: "Categoría 1", precio: 190 },
	{ id: "cat-2", nombre: "Categoría 2", precio: 124 },
	{ id: "cat-3", nombre: "Categoría 3", precio: 103 },
	{ id: "cat-4", nombre: "Categoría 4", precio: 87 },
	{ id: "cat-5", nombre: "Categoría 5", precio: 53 }
];
const formatoEuro = new Intl.NumberFormat("es-ES", {
	style: "currency",
	currency: "EUR"
});

const formularioCompra = document.querySelector("#formulario-compra");

if (formularioCompra) {
	const cantidades = categorias.map(({ id }) => formularioCompra.elements.namedItem(id));
	const total = document.querySelector("#total-compra");
	const resumenCantidad = document.querySelector("#resumen-cantidad");
	const errorCantidades = document.querySelector("#error-cantidades");

	const leerEntradas = () => categorias.map((categoria, index) => ({
		...categoria,
		cantidad: Number(cantidades[index].value)
	}));

	const actualizarTotal = () => {
		const entradas = leerEntradas();
		const cantidadTotal = entradas.reduce((suma, entrada) => suma + entrada.cantidad, 0);
		const precioTotal = entradas.reduce((suma, entrada) => suma + entrada.cantidad * entrada.precio, 0);

		total.value = formatoEuro.format(precioTotal);
		resumenCantidad.textContent = `${cantidadTotal} ${cantidadTotal === 1 ? "entrada seleccionada" : "entradas seleccionadas"}`;
		errorCantidades.hidden = true;
	};

	for (const cantidad of cantidades) {
		cantidad.addEventListener("input", actualizarTotal);
	}

	formularioCompra.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!formularioCompra.reportValidity()) return;

		const entradas = leerEntradas();
		if (entradas.every(({ cantidad }) => cantidad === 0)) {
			errorCantidades.hidden = false;
			cantidades[0].focus();
			return;
		}

		const pedido = {
			entradas: entradas.filter((entrada) => entrada.cantidad > 0),
			total: entradas.reduce((suma, entrada) => suma + entrada.cantidad * entrada.precio, 0)
		};

		try {
			sessionStorage.setItem(almacenamientoPedido, JSON.stringify(pedido));
		} catch (error) {
			console.error("No se pudo guardar el pedido temporal en esta pestaña.", error);
			errorCantidades.textContent = "No se pudo continuar en esta pestaña. Comprueba la configuración de almacenamiento del navegador.";
			errorCantidades.hidden = false;
			return;
		}

		window.location.href = "venta_entradas.html";
	});

	actualizarTotal();
}

const contenidoVenta = document.querySelector("#contenido-venta");

if (contenidoVenta) {
	const pedidoNoDisponible = document.querySelector("#pedido-no-disponible");
	let pedido;

	try {
		pedido = JSON.parse(sessionStorage.getItem(almacenamientoPedido));
	} catch (error) {
		console.error("No se pudo leer el pedido temporal.", error);
	}

	if (!pedido || !Array.isArray(pedido.entradas) || pedido.entradas.length === 0) {
		pedidoNoDisponible.hidden = false;
	} else {
		contenidoVenta.hidden = false;
		document.querySelector("#total-pedido").textContent = formatoEuro.format(pedido.total);

		const listaPedido = document.querySelector("#lista-pedido");
		for (const entrada of pedido.entradas) {
			const linea = document.createElement("li");
			const detalle = document.createElement("span");
			const subtotal = document.createElement("strong");
			detalle.textContent = `${entrada.nombre} × ${entrada.cantidad}`;
			subtotal.textContent = formatoEuro.format(entrada.precio * entrada.cantidad);
			linea.append(detalle, subtotal);
			listaPedido.append(linea);
		}
	}

	const formularioPago = document.querySelector("#formulario-pago");
	formularioPago.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!pedido || !Array.isArray(pedido.entradas) || pedido.entradas.length === 0) return;

		document.querySelector("#resultado-pago").textContent =
			"Compra realizada correctamente. Gracias por su compra.";
		document.querySelector("#resultado-pago").hidden = false;
		document.querySelector("#boton-pago").disabled = true;
	});
}
