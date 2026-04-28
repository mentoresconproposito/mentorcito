# Mentorcito — Guía de despliegue en Vercel

## Estructura del proyecto
```
mentorcito/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx
    └── MentorAgent.jsx
```

---

## Paso 1 — Conseguir la API Key de Anthropic

1. Entrá a https://console.anthropic.com
2. Creá una cuenta o iniciá sesión
3. Andá a **API Keys** → **Create Key**
4. Copiá la key (empieza con `sk-ant-...`). Guardala en un lugar seguro.

---

## Paso 2 — Subir el proyecto a GitHub

1. Creá una cuenta en https://github.com (si no tenés)
2. Hacé click en **New repository**
3. Nombre: `mentorcito` → **Create repository**
4. En tu computadora, instalá **GitHub Desktop**: https://desktop.github.com
5. Abrí GitHub Desktop → **Add existing repository** → seleccioná la carpeta `mentorcito`
6. Click **Publish repository** → elegí el repo que creaste → **Publish**

---

## Paso 3 — Desplegar en Vercel

1. Entrá a https://vercel.com y creá una cuenta (podés usar tu cuenta de GitHub)
2. Click en **Add New Project**
3. Seleccioná tu repositorio `mentorcito` de la lista
4. En **Framework Preset** seleccioná **Vite**
5. Expandí **Environment Variables** y agregá:
   - **Name:** `VITE_ANTHROPIC_API_KEY`
   - **Value:** tu API key (`sk-ant-...`)
6. Click **Deploy**
7. En 2-3 minutos tenés tu URL pública, por ejemplo: `https://mentorcito.vercel.app`

---

## Paso 4 — Actualizar el proyecto (cuando hagas cambios)

1. Modificá los archivos en tu computadora
2. Abrí GitHub Desktop → escribí un mensaje de commit → **Commit to main**
3. Click **Push origin**
4. Vercel detecta el cambio y re-despliega automáticamente en ~1 minuto

---

## Dominio personalizado (opcional)

Si querés usar `autodiagnostico.mentoresconproposito.com`:
1. En Vercel, andá a tu proyecto → **Settings** → **Domains**
2. Agregá el dominio deseado
3. Seguí las instrucciones para configurar el DNS en tu proveedor de dominio
