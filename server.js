const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const tls = require('tls');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Configuración de certificados para múltiples dominios (SNI)
const domains = ['google.676706767.xyz', 'google.topdev.vip'];
const certs = {};

domains.forEach(domain => {
    const lePath = `/etc/letsencrypt/live/${domain}/`;
    try {
        if (fs.existsSync(path.join(lePath, 'privkey.pem'))) {
            certs[domain] = {
                key: fs.readFileSync(path.join(lePath, 'privkey.pem')),
                cert: fs.readFileSync(path.join(lePath, 'fullchain.pem'))
            };
            console.log(`Certificados cargados para: ${domain}`);
        }
    } catch (err) {
        console.error(`Error cargando certificados para ${domain}:`, err.message);
    }
});

const options = {
    SNICallback: (domain, cb) => {
        if (certs[domain]) {
            cb(null, tls.createSecureContext(certs[domain]));
        } else {
            // Fallback al primer dominio si no se encuentra el solicitado
            cb(null, tls.createSecureContext(certs['google.676706767.xyz']));
        }
    },
    // Certificado por defecto (para clientes sin SNI)
    key: certs['google.676706767.xyz']?.key,
    cert: certs['google.676706767.xyz']?.cert
};

app.use(cors());
app.use(express.json());

// Inicializar data.json si no existe
if (!fs.existsSync(DATA_FILE) || fs.readFileSync(DATA_FILE, 'utf8').trim() === '') {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ likes: {}, userLikes: {}, logs: [], verified: [], reports: [] }, null, 2));
}

function readData() {
    try {
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(content);
        if (!data.verified) data.verified = [];
        if (!data.likes) data.likes = {};
        if (!data.userLikes) data.userLikes = {};
        if (!data.logs) data.logs = [];
        if (!data.reports) data.reports = [];
        return data;
    } catch {
        return { likes: {}, userLikes: {}, logs: [], verified: [], reports: [] };
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generar ID de usuario unico
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// API: GET juegos disponibles
app.get('/api/games', (req, res) => {
    const filesDir = path.join(__dirname, 'files');
    if (!fs.existsSync(filesDir)) {
        return res.json([]);
    }
    const data = readData();
    const htmlFiles = fs.readdirSync(filesDir)
        .filter(f => f.endsWith('.html') && f !== 'games-index.html')
        .map(f => {
            const name = f.replace('.html', '');
            return {
                name: name,
                file: f,
                quality: data.verified.includes(name) ? 'verified' : 'untested'
            };
        });
    res.json(htmlFiles);
});

// API: POST verificar/desverificar juego
app.post('/api/verify', (req, res) => {
    const { game, status } = req.body; // status: true/false
    if (!game) return res.status(400).json({ error: 'Game required' });
    
    const data = readData();
    if (status) {
        if (!data.verified.includes(game)) data.verified.push(game);
    } else {
        data.verified = data.verified.filter(g => g !== game);
    }
    writeData(data);
    res.json({ success: true, verified: data.verified });
});

// API: GET archivo en base64 (para el sandbox)
app.get('/api/file/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'files', filename);
    
    if (fs.existsSync(filePath) && filePath.startsWith(path.join(__dirname, 'files'))) {
        const content = fs.readFileSync(filePath); // Leer como Buffer
        const base64Content = content.toString('base64');
        res.send(base64Content);
    } else {
        res.status(404).send('Not found');
    }
});

// API: GET usuario (generar o obtener userId)
app.get('/api/user', (req, res) => {
    const { userId } = req.query;
    if (userId) {
        // Verificar si usuario existe
        const data = readData();
        const userExists = data.userLikes && data.userLikes[userId];
        res.json({ userId, exists: !!userExists });
    } else {
        // Generar nuevo userId
        const newUserId = generateUserId();
        res.json({ userId: newUserId });
    }
});

// API: GET likes de un usuario especifico
app.get('/api/user/likes/:userId', (req, res) => {
    const { userId } = req.params;
    const data = readData();
    const userGameLikes = data.userLikes[userId] || [];
    res.json(userGameLikes);
});

// API: POST like a un juego
app.post('/api/like', (req, res) => {
    const { game, action, userId } = req.body;
    if (!game) return res.status(400).json({ error: 'Game required' });
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    
    const data = readData();
    
    // Inicializar userLikes si no existe
    if (!data.userLikes) {
        data.userLikes = {};
    }
    
    // Inicializar array de likes para el usuario si no existe
    if (!data.userLikes[userId]) {
        data.userLikes[userId] = [];
    }
    
    const userGames = data.userLikes[userId];
    const hasLiked = userGames.includes(game);
    
    if (action === 'unlike') {
        // Solo permitir unlike si el usuario ya dio like
        if (hasLiked) {
            const index = userGames.indexOf(game);
            userGames.splice(index, 1);
            if (data.likes[game] && data.likes[game] > 0) {
                data.likes[game] -= 1;
            }
        }
    } else {
        // Solo permitir like si el usuario no lo ha dado ya
        if (!hasLiked) {
            userGames.push(game);
            data.likes[game] = (data.likes[game] || 0) + 1;
        }
    }
    
    writeData(data);
    
    res.json({ 
        success: true, 
        likes: data.likes[game] || 0,
        isLiked: action === 'like' ? true : !hasLiked
    });
});

// API: GET likes (total por juego)
app.get('/api/likes', (req, res) => {
    const data = readData();
    res.json(data.likes);
});

// API: POST log de actividad
app.post('/api/log', (req, res) => {
    const { type, message, game } = req.body;
    const data = readData();
    data.logs.push({
        type,
        message,
        game,
        timestamp: new Date().toISOString()
    });
    if (data.logs.length > 500) data.logs = data.logs.slice(-500);
    writeData(data);
    res.json({ success: true });
});

// API: POST reportar juego
app.post('/api/report', (req, res) => {
    const { game, reason, userId } = req.body;
    if (!game) return res.status(400).json({ error: 'Game required' });
    
    const data = readData();
    data.reports.push({
        id: Date.now().toString(),
        game,
        reason: reason || 'No funciona',
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        resolved: false
    });
    writeData(data);
    
    // Log del reporte
    data.logs.push({
        type: 'report',
        message: `Juego reportado: ${reason}`,
        game,
        timestamp: new Date().toISOString()
    });
    writeData(data);
    
    res.json({ success: true, reportId: data.reports[data.reports.length - 1].id });
});

// API: DELETE eliminar reporte
app.delete('/api/report/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const initialLength = data.reports.length;
    data.reports = data.reports.filter(r => r.id !== id);
    
    if (data.reports.length === initialLength) {
        return res.status(404).json({ error: 'Report not found' });
    }
    
    writeData(data);
    res.json({ success: true });
});

// Rutas principales

// 1. Raiz: Redireccion a Google (Falso Negativo) - Inmediata y sin excepciones
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. /files: Plataforma de juegos ofuscada
app.get('/files', (req, res) => {
    const { acceso } = req.query;
    // Acceso RESTRICTED - solo con flag acceso=MPL
    if (acceso !== 'MPL') {
        // Redirigir a Google de forma inmediata
        return res.redirect('https://google.com');
    }
    res.sendFile(path.join(__dirname, 'games.html'));
});

// 3. /admin: Dashboard
app.get('/admin', (req, res) => {
    const { acceso } = req.query;
    if (acceso !== 'TTT') {
        return res.redirect('https://google.com');
    }
    
    const data = readData();
    const totalLikes = Object.values(data.likes).reduce((a, b) => a + b, 0);
    const totalGames = Object.keys(data.likes).length;
    const totalUsers = data.userLikes ? Object.keys(data.userLikes).length : 0;
    
    // Obtener todos los juegos para el control panel
    const filesDir = path.join(__dirname, 'files');
    const allFiles = fs.existsSync(filesDir) ? 
        fs.readdirSync(filesDir)
            .filter(f => f.endsWith('.html') && f !== 'games-index.html')
            .map(f => ({ name: f.replace('.html', ''), file: f })) : [];
    
    // Calcular estadisticas adicionales
    const activeUsers = Object.entries(data.userLikes || {}).map(([userId, likedGames]) => ({
        userId,
        count: likedGames.length
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    const topGames = Object.entries(data.likes || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Dashboard</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    background: #f8f9fa; 
                    color: #333; 
                    padding: 40px 20px; 
                    max-width: 1200px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                h1 { 
                    font-size: 24px; 
                    font-weight: 600; 
                    margin-bottom: 30px; 
                    color: #111;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 10px;
                }
                h2 {
                    font-size: 18px;
                    font-weight: 500;
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #444;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .card { 
                    background: #fff; 
                    border: 1px solid #eaeaea; 
                    border-radius: 8px; 
                    padding: 20px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: #1a73e8;
                    margin: 10px 0;
                }
                .stat-label {
                    font-size: 14px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                }
                th, td { 
                    border-bottom: 1px solid #eee; 
                    padding: 12px 8px; 
                    text-align: left; 
                }
                th {
                    font-weight: 500;
                    color: #666;
                    font-size: 14px;
                }
                .log-container {
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid #eee;
                    border-radius: 4px;
                    padding: 10px;
                    background: #fafafa;
                }
                .log-entry { 
                    margin-bottom: 8px; 
                    font-size: 13px; 
                    font-family: monospace;
                    padding: 6px;
                    border-bottom: 1px solid #eee;
                }
                .log-entry:last-child { border-bottom: none; }
                .log-time { color: #888; margin-right: 10px; }
                .log-type { font-weight: bold; color: #1a73e8; margin-right: 10px; }
                .badge { display: inline-block; font-size: 11px; padding: 2px 5px; border-radius: 3px; background: #e3f2fd; color: #1976d2; }
                button { background: #1a73e8; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
                button.alt { background: #f8f9fa; color: #333; border: 1px solid #dadce0; }
            </style>
        </head>
        <body>
            <h1>Dashboard de Administracion</h1>
            
            <div class="grid">
                <div class="card">
                    <div class="stat-label">Total Likes</div>
                    <div class="stat-value">${totalLikes}</div>
                </div>
                <div class="card">
                    <div class="stat-label">Juegos con Likes</div>
                    <div class="stat-value">${totalGames}</div>
                </div>
                <div class="card">
                    <div class="stat-label">Usuarios Activos</div>
                    <div class="stat-value">${totalUsers}</div>
                </div>
                <div class="card">
                    <div class="stat-label">Total Eventos (Logs)</div>
                    <div class="stat-value">${data.logs.length}</div>
                </div>
                <div class="card">
                    <div class="stat-label">Reportes Pendientes</div>
                    <div class="stat-value">${data.reports.filter(r => !r.resolved).length}</div>
                </div>
            </div>
            
            <div class="grid">
                <div class="card" style="grid-column: span 2;">
                    <h2>Control de Auditoria (Juegos)</h2>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table>
                            <tr><th>Nombre</th><th>Estado</th><th>Accion</th></tr>
                            ${allFiles.map(file => {
                                const isVerified = data.verified.includes(file.name);
                                return `
                                    <tr>
                                        <td>${file.name}</td>
                                        <td><span class="badge" style="background: ${isVerified ? '#e6f4ea' : '#fef7e0'}; color: ${isVerified ? '#137333' : '#b06000'}">${isVerified ? 'Verificado' : 'Pendiente'}</span></td>
                                        <td>
                                            <button class="${isVerified ? 'alt' : ''}" onclick="toggleVerify('${file.name}', ${!isVerified})">
                                                ${isVerified ? 'Marcar Pendiente' : 'Marcar Verificado'}
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </table>
                    </div>
                </div>
                
                <div class="card">
                    <h2>Usuarios Mas Activos</h2>
                    <table>
                        <tr><th>Usuario</th><th>Likes</th></tr>
                        ${activeUsers.map((user) => 
                            `<tr><td><span class="badge">${user.userId.substring(0, 15)}...</span></td><td><strong>${user.count}</strong></td></tr>`
                        ).join('') || '<tr><td colspan="2">Sin datos</td></tr>'}
                    </table>
                </div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h2>Top 5 Juegos</h2>
                    <table>
                        <tr><th>Juego</th><th>Likes</th></tr>
                        ${topGames.map(([game, count]) => 
                            `<tr><td>${game}</td><td><strong>${count}</strong></td></tr>`
                        ).join('') || '<tr><td colspan="2">Sin datos</td></tr>'}
                    </table>
                </div>
                
                <div class="card" style="grid-column: span 2;">
                    <h2>Logs Recientes</h2>
                    <div class="log-container">
                        ${data.logs.slice(-100).reverse().map(log => `
                            <div class="log-entry">
                                <span class="log-time">[${new Date(log.timestamp).toLocaleString()}]</span>
                                <span class="log-type">${log.type.toUpperCase()}</span>
                                ${log.message} ${log.game ? '<strong>(' + log.game + ')</strong>' : ''}
                            </div>
                        `).join('') || '<p>No hay logs registrados</p>'}
                    </div>
                </div>
            </div>
            
            <div class="grid">
                <div class="card" style="grid-column: span 3;">
                    <h2>Reportes de Juegos</h2>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table>
                            <tr><th>Juego</th><th>Razon</th><th>Usuario</th><th>Fecha</th><th>Accion</th></tr>
                            ${data.reports.slice().reverse().map(report => `
                                <tr style="${report.resolved === true ? 'opacity: 0.6;' : ''}">
                                    <td><strong>${report.game || 'N/A'}</strong></td>
                                    <td>${report.reason || 'No especificado'}</td>
                                    <td><span class="badge">${(report.userId || 'anonymous').substring(0, 15)}...</span></td>
                                    <td>${new Date(report.timestamp).toLocaleString()}</td>
                                    <td>
                                        <button class="" style="background: #d93025;" onclick="deleteReport('${report.id}')">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5">No hay reportes</td></tr>'}
                        </table>
                    </div>
                </div>
            </div>

            <script>
                async function toggleVerify(game, status) {
                    const res = await fetch('/api/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ game, status })
                    });
                    if (res.ok) window.location.reload();
                }
                
                async function deleteReport(reportId) {
                    if (!confirm('¿Estas seguro de que quieres eliminar este reporte?')) return;
                    const res = await fetch('/api/report/' + reportId, {
                        method: 'DELETE'
                    });
                    if (res.ok) window.location.reload();
                }
            </script>
        </body>
        </html>
    `);
});

// Servir archivos estaticos de la carpeta files directamente (por si acaso, aunque usaremos base64)
app.use('/static', express.static('files'));

if (options.key && options.cert) {
    https.createServer(options, app).listen(PORT, () => {
        console.log(`HTTPS Server running on port ${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`HTTP Server running on port ${PORT} (SSL certificates not found)`);
    });
}
