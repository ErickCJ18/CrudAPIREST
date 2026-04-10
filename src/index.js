import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Server
const app = express();
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path
const publicDirectoryPath = path.join(__dirname, '../public')
console.log(publicDirectoryPath);

// Definir el Path para el contenido estatico
app.use(express.static(publicDirectoryPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, 'home.html'));
});

// Definicion de metodos y funcionalidades para el request.http
const leerData = () => {
    try
    {
        const data = fs.readFileSync("./db.json");
        return JSON.parse(data);
    }
    catch (error)
    {
        console.log(error);
    }
};

const escribirData = (data) => {
    try
    {
        fs.writeFileSync("./db.json", JSON.stringify(data));
    }
    catch (error)
    {
        console.log(error);
    }
};

app.get("/usuarios", (req, res) => {
    const data = leerData();
    res.status(200).json(data);
});

app.get("/usuarios/:id", (req, res) => {
    const data = leerData();
    const id = parseInt(req.params.id);
    const user = data.usuarios.find((user) => user.id === id);
    
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(user);
});

app.post("/usuarios", (req, res) => {
    const data = leerData();
    const { nombre, email, edad, activo } = req.body;

    if (!nombre || !email || edad == null) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    const newUser = {
        id: data.usuarios.length + 1, 
        nombre,
        email,
        edad,
        activo: activo ?? false
    };

    data.usuarios.push(newUser);
    escribirData(data);

    console.log(req.body);
    res.status(201).json(newUser)
});

app.put("/usuarios/:id", (req, res) => {
    const data = leerData();
    const { nombre, email, edad, activo } = req.body;
    const id = parseInt(req.params.id);

    const userIndex = data.usuarios.findIndex((user) => user.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!nombre || !email || edad == null) {
        return res.status(400).json({ error: "Datos inválidos" });
    }

    data.usuarios[userIndex] = {
        ...data.usuarios[userIndex],
        nombre,
        email,
        edad,
        activo  
    };

    escribirData(data);

    res.status(200).json({ message: "Usuario actualizado" });
});

app.delete("/usuarios/:id", (req, res) => {
    const data = leerData();
    const id = parseInt(req.params.id);
    
    const userIndex = data.usuarios.findIndex((user) => user.id === id);

    if (userIndex === -1)
    {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    data.usuarios.splice(userIndex, 1);
    escribirData(data);
    res.status(200).json({ message: "Usuario eliminado" });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
