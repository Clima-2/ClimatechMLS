# ClimaTech — Monolito

Estructura monolítica: Express sirve la API en `/api/*` y el frontend React compilado como archivos estáticos.

## Estructura

```
climatech/
├── src/                    # Backend (Node.js / Express)
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── index.js            # Punto de entrada
├── client/                 # Frontend (React / Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   └── schema.sql
├── package.json            # Dependencias del backend + scripts
└── .env.example
```

## Desarrollo local

```bash
# Instalar dependencias de backend y frontend
npm run install:all

# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend (con hot-reload)
cd client && npm run dev
```

## Deploy en Railway

1. **Servicio DB**: crea un servicio MySQL en Railway y copia la variable `DATABASE_URL` o las variables individuales.
2. **Servicio App**: apunta al repositorio (o sube el zip). Railway detecta el `package.json` raíz.
3. El script `postinstall` del `package.json` raíz instala las dependencias del cliente y genera el build de React automáticamente.
4. Railway ejecuta `npm start` → Express sirve tanto la API como el frontend compilado en el mismo puerto.

### Variables de entorno en Railway

| Variable      | Descripción                        |
|---------------|------------------------------------|
| `DB_HOST`     | Host del servicio MySQL             |
| `DB_PORT`     | Puerto (por defecto 3306)          |
| `DB_NAME`     | Nombre de la base de datos         |
| `DB_USER`     | Usuario                            |
| `DB_PASSWORD` | Contraseña                         |
| `JWT_SECRET`  | Secreto para firmar tokens JWT     |
| `NODE_ENV`    | `production`                       |
| `PORT`        | Railway lo inyecta automáticamente |
