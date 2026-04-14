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
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
