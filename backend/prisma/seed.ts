import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const CDN = "https://fusionconsazon.uy/wp-content/uploads";

async function main() {
  // --- Admin único -----------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME?.trim() || "Administrador";

  // El admin es opcional a propósito: el sitio público (textos, fotos,
  // testimonios, contacto) funciona sin él. Solo hace falta para entrar al
  // panel, así que quien clone el repo puede ver la página andando sin
  // inventarse credenciales ni una cuenta de Cloudinary.
  if (!adminEmail || !adminPassword) {
    console.warn("⚠️  Sin ADMIN_EMAIL / ADMIN_PASSWORD: no se creó usuario administrador.");
    console.warn("   El sitio público carga igual. Para entrar al panel, completá esos");
    console.warn("   valores en backend/.env y volvé a correr `npm run seed`.");
  } else if (adminPassword.length < 8) {
    console.error("❌ ADMIN_PASSWORD debe tener al menos 8 caracteres: no se creó el admin.");
    console.error("   El resto del contenido se cargó igual.");
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash, name: adminName },
      create: { email: adminEmail, passwordHash, name: adminName },
    });
    console.log(`✅ Admin listo: ${adminEmail}`);
  }

  // --- Bloques de texto (contenido real del sitio actual) --------------
  const contentBlocks = [
    {
      key: "home_hero",
      title: null,
      body: "Convertimos cada celebración en una experiencia para recordar.",
    },
    {
      key: "home_nosotros_preview",
      title: "Nosotros",
      body:
        "Somos una pareja que desde que nos conocimos hemos tenido pasión por la comida y los postres, " +
        "los sabores que se pueden fusionar y lograr un producto con ese sabor a hogar. Desde hace 20 años " +
        "cada uno se especializó de manera empírica a desarrollar alimentos tanto salados como dulces " +
        "comercializándolo solo hacia la familia y amigos.",
    },
    {
      key: "nosotros_page",
      title: "Nosotros",
      body:
        "Somos una pareja que comparte la misma pasión: cocinar, crear y celebrar con sabor. Desde que nos " +
        "conocimos, supimos que la cocina era nuestro espacio de conexión, donde fusionábamos ingredientes, " +
        "culturas y emociones para dar vida a platos inolvidables.\n\n" +
        "Por más de 20 años, nos dedicamos a perfeccionar nuestras recetas, experimentando con sabores y " +
        "texturas, siempre con el objetivo de llevar a la mesa ese toque casero y especial que se siente en " +
        "cada bocado. Lo que comenzó como una pasión entre familia y amigos, poco a poco se convirtió en lo " +
        "que hoy es Fusión con Sazón: un lugar donde cada plato es una experiencia y cada evento es un " +
        "motivo para celebrar.",
    },
    {
      key: "nosotros_dream",
      title: "Dejarlo todo para seguir nuestro sueño",
      body:
        "Cuando decidimos emigrar a Uruguay, muchos nos preguntaban por qué no hacíamos de la gastronomía " +
        "nuestra profesión. La respuesta era simple: era el momento de seguir nuestra pasión. Llegamos hace " +
        "7 años y, después de recorrer caminos y adaptarnos a nuevos desafíos, supimos que este era nuestro " +
        "propósito: llevar el verdadero sabor de casa a cada celebración.\n\n" +
        "Hoy, en Fusión con Sazón, no solo cocinamos, sino que creamos experiencias. Nos apasiona hacer que " +
        "cada evento tenga ese toque único, ese sabor inolvidable que deja huella en cada reunión, " +
        "cumpleaños o encuentro especial.",
    },
    {
      key: "nosotros_why",
      title: "¿Por qué 'Fusión con Sazón'?",
      body:
        "Porque nuestro amor por la cocina no tiene fronteras. Fusionamos culturas, tradiciones y sabores " +
        "para dar vida a platos que despiertan emociones. Desde un bocado dulce hasta una picada llena de " +
        "sabor, todo lo que hacemos lleva nuestra esencia, dedicación y amor por la gastronomía.\n\n" +
        "Si algo hemos aprendido en este camino es que la comida no solo alimenta el cuerpo, también une, " +
        "emociona y crea recuerdos. Y eso es exactamente lo que queremos compartir contigo en cada plato.",
    },
    {
      key: "home_entregas",
      title: "ENTREGAS",
      // Nota: este es el texto placeholder que el sitio original nunca terminó
      // de reemplazar ("Lorem fistrum" es un generador de lorem ipsum en español).
      // Reemplazalo desde el panel admin con la info real de entregas/delivery.
      body:
        "Lorem fistrum por la gloria de mi madre esse jarl aliqua llevame al sircoo. De la pradera ullamco " +
        "qué dise usteer está la cosa muy malar, lorem fistrum por la gloria de mi madre esse jarl aliqua " +
        "llevame al sircoo. De la pradera ullamco qué dise usteer está la cosa muy malar.",
    },
    {
      key: "tortas_combos_title",
      title: "¡Deleitate con nuestros Combos!",
      body: "Consultá por nuestros combos de tortas y postres para tu evento o reunión familiar.",
    },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: { title: block.title, body: block.body },
      create: block,
    });
  }
  console.log(`✅ ${contentBlocks.length} bloques de contenido cargados`);

  // --- Datos de contacto -------------------------------------------------
  await prisma.contactInfo.upsert({
    where: { id: "contact-info-singleton" },
    update: {},
    create: {
      id: "contact-info-singleton",
      phone: "+598 91 842 491",
      whatsapp: "+598 91 842 491",
      address: "Montevideo - La Unión",
      facebookUrl: "https://www.facebook.com/FusionconSazonUruguay",
      instagramUrl: "https://www.instagram.com/fusionconsazon/",
    },
  });
  console.log("✅ Datos de contacto cargados");

  // --- Testimonios de ejemplo (el sitio original no tenía texto propio, ---
  // --- usaba un link a reseñas de Google) ---------------------------------
  const testimonials = [
    { author: "Cliente satisfecho", text: "Excelente atención y el sabor de las tortas es increíble. Recomendados 100%.", order: 0 },
    { author: "Cliente de catering", text: "Contratamos el catering para un evento familiar y todos quedaron encantados.", order: 1 },
  ];
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({ data: testimonials });
  console.log(`✅ ${testimonials.length} testimonios de ejemplo cargados (editalos desde el panel admin)`);

  // --- Media: se precarga con las URLs reales del sitio actual como -------
  // --- punto de partida. El admin puede reemplazar cada foto/video desde --
  // --- el panel; al reemplazar, ahí sí queda subido a Cloudinary. ---------
  await prisma.mediaItem.deleteMany();

  const media: {
    page: "HOME" | "NOSOTROS" | "TORTAS" | "CATERING" | "EVENTOS_FOTOS" | "EVENTOS_VIDEOS";
    type: "IMAGE" | "VIDEO";
    url: string;
    category?: string;
    order: number;
  }[] = [
    // Nosotros
    { page: "NOSOTROS", type: "IMAGE", url: "/nosotros.webp", order: 0 },
    { page: "NOSOTROS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0003_Grupo-5-576x1024.jpg`, order: 1 },
    { page: "NOSOTROS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0013_Grupo-24-576x1024.jpg`, order: 2 },

    // Tortas y Postres
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0031_Grupo-58.jpg`, order: 0 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS.jpg`, order: 1 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0000_Grupo-1.jpg`, order: 2 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0001_Grupo-3.jpg`, order: 3 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0002_Grupo-4.jpg`, order: 4 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0003_Grupo-5.jpg`, order: 5 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0004_Grupo-6.jpg`, order: 6 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0005_Grupo-7.jpg`, order: 7 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/WhatsApp-Image-2025-01-16-at-5.16.17-PM-3.jpeg`, category: "Combos", order: 8 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/WhatsApp-Image-2025-01-16-at-5.16.17-PM-2.jpeg`, category: "Combos", order: 9 },
    { page: "TORTAS", type: "IMAGE", url: `${CDN}/2025/01/WhatsApp-Image-2025-01-16-at-5.16.18-PM.jpeg`, category: "Combos", order: 10 },

    // Catering: asigno categorías de referencia repartidas entre las 3 (el
    // sitio original no expone esta info en el HTML plano). Corregilas desde
    // el panel admin > Fotos y videos > Catering, con el selector de categoría
    // de cada item, según qué plato es cada foto realmente.
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2025/02/6-1.webp`, category: "Comida Venezolana", order: 0 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2025/02/8-1.webp`, category: "Comida Venezolana", order: 1 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2025/02/7-1.webp`, category: "Comida Venezolana", order: 2 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2024/09/CATERING-17.jpg`, category: "Comida Venezolana", order: 3 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2025/02/9-1.webp`, category: "Comida Uruguaya", order: 4 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2025/02/3-1.webp`, category: "Comida Uruguaya", order: 5 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2024/09/CATERING-10.jpg`, category: "Comida Uruguaya", order: 6 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2025/02/4-1.webp`, category: "Comida Internacional", order: 7 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2025/02/5-1.webp`, category: "Comida Internacional", order: 8 },
    { page: "CATERING", type: "IMAGE", url: `${CDN}/2024/09/CATERING-05.jpg`, category: "Comida Internacional", order: 9 },

    // Eventos - fotos
    { page: "EVENTOS_FOTOS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0006_Capa-1-copia-18_7_11zon.webp`, order: 0 },
    { page: "EVENTOS_FOTOS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0003_Capa-1-copia-15_4_11zon.webp`, order: 1 },
    { page: "EVENTOS_FOTOS", type: "IMAGE", url: `${CDN}/2025/01/FOTOS_0002_Capa-1-copia-14_3_11zon.webp`, order: 2 },
    { page: "EVENTOS_FOTOS", type: "IMAGE", url: `${CDN}/2025/02/EVENTOS_0019_Capa-1-copia-40.webp`, order: 3 },
    { page: "EVENTOS_FOTOS", type: "IMAGE", url: `${CDN}/2025/02/EVENTOS_0018_Capa-1-copia-39.webp`, order: 4 },
    { page: "EVENTOS_FOTOS", type: "IMAGE", url: `${CDN}/2025/02/EVENTOS_0017_Capa-1-copia-38.webp`, order: 5 },

    // Eventos - videos
    { page: "EVENTOS_VIDEOS", type: "VIDEO", url: `${CDN}/2025/01/Img-4642-20.mp4`, order: 0 },
    { page: "EVENTOS_VIDEOS", type: "VIDEO", url: `${CDN}/2025/01/Document-5186453479874364626-18.mp4`, order: 1 },
    { page: "EVENTOS_VIDEOS", type: "VIDEO", url: `${CDN}/2025/01/Document-5186453479874364625-17.mp4`, order: 2 },
    { page: "EVENTOS_VIDEOS", type: "VIDEO", url: `${CDN}/2025/01/Document-5186453479874364624-14.mp4`, order: 3 },
  ];

  await prisma.mediaItem.createMany({
    data: media.map((m) => ({ ...m, cloudinaryPublicId: "" })),
  });
  console.log(`✅ ${media.length} fotos/videos de referencia cargados (reemplazalos desde el panel admin)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
