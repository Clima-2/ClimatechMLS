require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ========================
// MIDDLEWARES GLOBALES
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// HEALTH CHECK
// ========================
app.get('/health', (req, res) => {
  res.json({ ok: true, db: dbReady, status: dbReady ? 'ready' : 'starting' });
});

// ========================
// RUTAS API
// ========================
app.use('/api', routes);

// ========================
// SERVIR FRONTEND (React build)
// ========================
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));

// Catch-all: devuelve index.html para que React Router maneje las rutas
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

// ========================
// MANEJO DE ERRORES GLOBALES
// ========================
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// ========================
// INICIAR SERVIDOR
// ========================

// Estado de la DB — Railway usa /health para saber si el proceso responde
let dbReady = false;

const connectDB = async () => {
  const MAX_RETRIES = 10;
  const RETRY_DELAY_MS = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 [DB] Intento ${attempt}/${MAX_RETRIES} — conectando...`);
      await sequelize.authenticate();
      console.log('✅ [DB] Conexion establecida');
      await sequelize.sync({ force: false });
      console.log('✅ [DB] Modelos sincronizados');
      dbReady = true;
      return;
    } catch (error) {
      console.error(`❌ [DB] Error en intento ${attempt}:`, error.message);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ [DB] Reintentando en ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error('❌ [DB] Sin conexion tras', MAX_RETRIES, 'intentos.');
      }
    }
  }
};

// 1 — Levantar HTTP primero para que Railway no mate el proceso
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor HTTP corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// 2 — Conectar DB en segundo plano
connectDB();
