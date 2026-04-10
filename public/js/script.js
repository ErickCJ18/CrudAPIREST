const JSON_URL = '/usuarios';
const name_bar = document.getElementById('nombre');
const email_bar = document.getElementById('email');
const edad_bar = document.getElementById('edad');
const add_button = document.getElementById('addit');
const cancel_button = document.getElementById('cancelit');
const activo_bar = document.getElementById('activo');
let editandoId = null;
let usuariosTodos = [];

// Boton de agregar usuario
add_button.addEventListener('click', function()
{
    if(document.getElementById('nombre').value.length < 3)
    {
        alert('ALERTA: Este nombre no es valido.');
        return;
    }
    
    if(document.getElementById('email').value.length < 3)
    {
        alert('ALERTA: Este correo no es valido.');
        return;
    }

    const edad = parseInt(edad_bar.value);
    const activo = activo_bar.checked;

    if(isNaN(edad) || edad < 0)
    {
        alert('ALERTA: La edad no es valida.');
        return;
    }

    if (editandoId) {
        updateUsuario(editandoId, document.getElementById('nombre').value, document.getElementById('email').value, edad, activo);
    } else {
        addUsuario(document.getElementById('nombre').value, document.getElementById('email').value, edad, activo);
    }
    
});

document.addEventListener('DOMContentLoaded', function()
{
    fetchData();
});

async function fetchData()
{
    try
    {
        const response = await fetch(JSON_URL)

        if(!response.ok)
            {
                throw new Error("ERROR ON THE DATA WOOOO");
            }

        const data = await response.json();
        usuariosTodos = data.usuarios;
        createUser(usuariosTodos);
        console.log(JSON.stringify(data));
    }
    catch(error)
    {
        console.error("Comandante, hubo un error:", error);
    }
}

function filtrarUsuarios()
{
    const texto = document.getElementById('busqueda').value.toLowerCase();

    const filtrados = usuariosTodos.filter(usuario =>
        usuario.nombre.toLowerCase().includes(texto)
    );

    createUser(filtrados);
}

async function updateUsuario(id, nombre, email, edad)
{
    try
    {
        const res = await fetch(`${JSON_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, edad, activo })
    });
        const data = await res.json();
        console.log(JSON.stringify(data));

        document.getElementById('nombre').value = '';
        document.getElementById('email').value = '';
        document.getElementById('edad').value = '';

        cancelarEdicion();
        fetchData();
    }
    catch (error)
    {
        console.error(error);
    }
}

async function addUsuario(nombre, email, edad, activo)
{
    try
    {
        const res = await fetch(JSON_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, edad, activo })
    });
        const data = await res.json();
        console.log(JSON.stringify(data));
        alert('AGREGADO UN USUARIO');
        document.getElementById('nombre').value = '';
        document.getElementById('email').value = '';
        document.getElementById('edad').value = '';
        document.getElementById('activo').checked = false;
        fetchData();
    }
    catch (error)
    {
        console.error(error);
    }
}

// Esto genera los usuarios en la lista
function createUser(userData)
{
    const tabla = document.getElementById("tabla");
    tabla.innerHTML = "";

    userData.forEach(usuario => {

        const fila = document.createElement("tr");

        const tdActivo = document.createElement("td");
        tdActivo.textContent = usuario.activo ? "✔️" : "❌";

        const tdNombre = document.createElement("td");
        tdNombre.textContent = usuario.nombre;

        const tdEmail = document.createElement("td");
        tdEmail.textContent = usuario.email;

        const tdEdad = document.createElement("td");
        tdEdad.textContent = usuario.edad;

        const tdAcciones = document.createElement("td");

        // Botón Editar
        const btnEdit = document.createElement("button");
        btnEdit.className = "button is-warning is-small";
        btnEdit.textContent = "Editar";
        btnEdit.onclick = () => editUsuario(usuario);

        // Botón Eliminar
        const btnDelete = document.createElement("button");
        btnDelete.className = "button is-danger is-small ml-2";
        btnDelete.textContent = "Eliminar";
        btnDelete.onclick = () => deleteUsuario(usuario.id);

        // Botón Activar/Desactivar
        const btnActivate = document.createElement("button");
        btnActivate.className = "button is-primary is-small ml-2";
        btnActivate.textContent = "Toggle";
        btnActivate.onclick = () => toggleUsuario(usuario);

        // Agregar botones
        tdAcciones.appendChild(btnEdit);
        tdAcciones.appendChild(btnDelete);
        tdAcciones.appendChild(btnActivate);

        // Ensamblar fila
        fila.appendChild(tdNombre);
        fila.appendChild(tdEmail);
        fila.appendChild(tdEdad);
        fila.appendChild(tdAcciones);
        fila.appendChild(tdActivo);

        // Se agrega a la tabla
        tabla.appendChild(fila);
    });
}

// 
async function toggleUsuario(usuario)
{
    try
    {
        const nuevoEstado = !usuario.activo;

        await fetch(`${JSON_URL}/${usuario.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: usuario.nombre,
                email: usuario.email,
                edad: usuario.edad,
                activo: nuevoEstado
            })
        });

        fetchData();
    }
    catch (error)
    {
        console.error(error);
    }
}

// Habilita la edicion de un usuario
function editUsuario(usuario)
{
    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('email').value = usuario.email;
    document.getElementById('edad').value = usuario.edad;
    add_button.textContent = 'Guardar';

    editandoId = usuario.id;
    activo_bar.checked = usuario.activo;

    cancel_button.classList.remove("is-hidden");
    cancel_button.disabled = false;
    cancel_button.onclick = () => deleteUsuario(usuario.id);
}

// Limpia las barras de texto y regresa los botones a la normalidad
function cancelarEdicion()
{
    // Limpiar inputs
    document.getElementById('nombre').value = '';
    document.getElementById('email').value = '';
    document.getElementById('edad').value = '';

    editandoId = null;
    activo_bar.checked = false;
    
    // Restaurar botón
    const btn = document.getElementById('addit');
    btn.textContent = "Agregar";
    btn.classList.remove("is-success");
    btn.classList.add("is-primary");

    // Eliminar botón cancelar
    cancel_button.classList.add("is-hidden");
    cancel_button.disabled = true;
}

// Borra un usuario
async function deleteUsuario(id)
{
    const confirmar = confirm("¿Estas seguro de que quieres eliminar este usuario?");
    if (!confirmar) return;

    try
    {
        const res = await fetch(`${JSON_URL}/${id}`, {
            method: 'DELETE'
    });
        const data = await res.json();
        console.log(JSON.stringify(data));
        fetchData();
    }
    catch (error)
    {
        console.error(error);
    }
}