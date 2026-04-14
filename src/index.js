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
  res.json({ ok: true, status: 'healthy' });
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
const startServer = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${MAX_RETRIES} — conectando a la base de datos...`);
      await sequelize.authenticate();
      console.log('✅ Conexión a base de datos establecida');
      await sequelize.sync({ force: false });
      console.log('✅ Modelos sincronizados');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
        console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      });
      return; // éxito — salir del loop
    } catch (error) {
      console.error(`❌ Error en intento ${attempt}:`, error.message);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Reintentando en ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error('❌ No se pudo conectar a la base de datos después de', MAX_RETRIES, 'intentos.');
        console.error('Stack:', error.stack);
        process.exit(1);
      }
    }
  }
};

startServer();
