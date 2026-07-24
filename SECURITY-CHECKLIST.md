# Checklist de seguridad

Lo que ya está resuelto en el código, y lo que tenés que revisar vos antes de
considerar el sitio listo para producción (internet).

## ✅ Ya implementado

- [x] Contraseña del admin con **hash bcrypt** (nunca se guarda en texto plano)
- [x] Sesión de admin en **cookie httpOnly + SameSite=Strict** (no accesible
      desde JavaScript del navegador, mitiga robo de sesión vía XSS y CSRF básico)
- [x] **JWT con expiración** (8 horas por defecto)
- [x] **Validación de todo input** con Zod (auth, contenido, media, testimonios, contacto)
- [x] **Rate limiting**: login (10 intentos / 15 min), subidas (30 / 10 min), general (120 / min)
- [x] **Helmet** (cabeceras de seguridad HTTP)
- [x] **CORS restringido** solo al dominio del frontend configurado
- [x] Sin registro público de administradores (un solo admin, creado por script)
- [x] Mensajes de error de login genéricos (no revelan si el email existe)
- [x] Validación de tipo y tamaño de archivo en las subidas (solo imágenes/videos, máx. 50MB)
- [x] Errores internos no exponen detalles/stack trace en producción (`NODE_ENV=production`)
- [x] Variables sensibles (secretos, API keys) fuera del código, en `.env` (no versionado)

## ⚠️ Antes de pasar a producción, revisá vos

- [ ] **Cambiá la contraseña del admin** por una fuerte y única (no reutilizada
      de otro sitio); considerá usar un gestor de contraseñas.
- [ ] **Generá un `JWT_SECRET` nuevo y distinto** al que uses en desarrollo
      (no reutilices el mismo entre entornos).
- [ ] Servir el sitio con **HTTPS** (certificado válido) — sin esto, la cookie
      `secure` no se puede usar de forma segura y las credenciales viajan
      expuestas.
- [ ] Poné `NODE_ENV=production` en el backend desplegado.
- [ ] Restringí `FRONTEND_URL` (CORS) al dominio real de producción, no a
      `localhost`.
- [ ] Configurá **backups automáticos** de la base de datos de producción.
- [ ] Revisá los límites de tu plan gratuito de Cloudinary (ancho de banda y
      almacenamiento) si esperás mucho tráfico o videos pesados.
- [ ] Considerá agregar **2FA** (verificación en dos pasos) para el login del
      admin si el sitio maneja información sensible.
- [ ] Mantené las dependencias actualizadas (`npm audit` periódicamente) y
      aplicá parches de seguridad.
- [ ] Si algún día agregás formularios de contacto o pagos, sumá protección
      anti-spam (captcha) y cumplí con la normativa de datos personales
      aplicable en Uruguay.
- [ ] Guardá una copia segura (fuera del repositorio) de las credenciales de
      Cloudinary y del `JWT_SECRET` de producción.

## Nota legal

No soy abogado — si el sitio va a procesar pagos, datos personales sensibles
o vas a operar formalmente, consultá a un profesional sobre la normativa de
protección de datos y comercio electrónico aplicable.
