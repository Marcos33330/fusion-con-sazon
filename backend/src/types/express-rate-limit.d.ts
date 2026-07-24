// Algunas versiones publicadas de "express-rate-limit" solo exponen un
// archivo .d.cts y no un .d.ts plano, lo que rompe la resolución de tipos
// con moduleResolution "node" clásico. Esta declaración ambient evita el
// error sin afectar el comportamiento en tiempo de ejecución.
declare module "express-rate-limit";
