import axios from "axios";
import fs from "fs";

class BlogPublisher {
  constructor(baseUrl = "http://localhost:5000") {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  // Helper method to create text sections
  static createTextSection(content, alignment = "left") {
    return {
      type: "text",
      content,
      alignment,
    };
  }

  // Helper method to create image sections
  static createImageSection(imageUrl, caption = "", alignment = "center") {
    return {
      type: "image",
      imageUrl,
      caption,
      alignment,
    };
  }

  // Helper method to create quote sections
  static createQuoteSection(content, caption = "") {
    return {
      type: "quote",
      content,
      caption,
    };
  }

  // Helper method to create heading sections
  static createHeadingSection(content, level = 2) {
    return {
      type: "heading",
      content,
      level,
    };
  }

  // Helper method to create list sections
  static createListSection(items) {
    return {
      type: "list",
      items,
    };
  }

  // Authenticate with admin credentials
  async authenticate(email = "admin@example.com", password = "admin123") {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
        email,
        password,
      });

      this.token = response.data.token;
      console.log("Authentication successful");
      return true;
    } catch (error) {
      console.error(
        "Authentication failed:",
        error.response?.data || error.message,
      );
      return false;
    }
  }

  // Create a blog post
  async createBlogPost(blogData) {
    if (!this.token) {
      console.error("Not authenticated. Please call authenticate() first.");
      return false;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/admin/blog`,
        blogData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Blog post created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating blog post:",
        error.response?.data || error.message,
      );
      if (error.response?.data?.errors) {
        console.error(
          "Validation errors:",
          JSON.stringify(error.response.data.errors, null, 2),
        );
      }
      return false;
    }
  }

  // Save blog post to JSON file
  static saveBlogToFile(blogPost, filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(blogPost, null, 2));
      console.log(`Blog post saved to ${filePath}`);
    } catch (error) {
      console.error("Error saving blog post:", error.message);
    }
  }

  // Load blog post from JSON file
  static loadBlogFromFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading blog post:", error.message);
      return null;
    }
  }
}

// Romanian Gardening Blog Content
const romanianGardenBlog = {
  title: "Grădinăritul în România: Ghidul Complet pentru Proprietarii de Case",
  excerpt:
    "Descoperă secretele unei grădini prospere în clima României. Sfaturi practice pentru orice proprietar de casă.",
  featuredImageUrl:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
  tags: [
    "grădinărit",
    "România",
    "proprietari case",
    "plante autohtone",
    "sezon grădinărit",
  ],
  sections: [
    BlogPublisher.createTextSection(
      "Grădinăritul în România oferă oportunități unice datorită climatului temperat-continental și a solului fertil din multe regiuni. Fie că locuiești în București, Cluj-Napoca sau într-un orășel mai mic, poți crea o grădină frumoasă și productivă care să îți aducă satisfacție și să îți reducă costurile cu alimentele.",
    ),

    BlogPublisher.createHeadingSection("Înțelegerea Climatului Românesc", 2),

    BlogPublisher.createTextSection(
      "România beneficiază de un climat temperat-continental cu patru anotimpuri distincte. Iernile pot fi aspre, cu temperaturi care coboară sub -10°C, iar verile sunt calde, cu temperaturi care pot depăși 35°C. Această varietate climatică permite cultivarea unei game largi de plante, de la legume mediteraneene la soiuri rezistente la frig.",
    ),

    BlogPublisher.createImageSection(
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800",
      "Grădina românească tradițională cu legume de sezon",
    ),

    BlogPublisher.createHeadingSection(
      "Plantele Autohtone - Alegerile Înțelepte",
      2,
    ),

    BlogPublisher.createTextSection(
      "Plantele autohtone sunt adaptate perfect la condițiile climatice locale și necesită mai puțină îngrijire. Acestea sunt nu doar mai rezistente, ci și mai benefice pentru ecosistemul local, oferind hrană și adăpost pentru insectele și păsările native.",
    ),

    BlogPublisher.createListSection([
      "Mușcate românești (Pelargonium) - perfecte pentru balcoane și ferestre",
      "Tei (Tilia) - excelent pentru umbra curții",
      "Salcâm (Robinia pseudoacacia) - crește rapid și oferă flori parfumate",
      "Liliac (Syringa vulgaris) - înflorește spectaculos primăvara",
      "Măceș (Rosa canina) - fructe bogate în vitamina C",
      "Corniș (Cornus mas) - fructe comestibile și înflorire timpurie",
    ]),

    BlogPublisher.createHeadingSection("Grădina de Legume Românească", 2),

    BlogPublisher.createTextSection(
      "Tradițional, familiile românești cultivă legume pentru consumul propriu. Această practică nu doar că economisește bani, dar asigură și legume proaspete, fără pesticide. Solul românesc este ideal pentru majoritatea legumelor, iar clima permite două sau chiar trei culturi pe an pentru unele soiuri.",
    ),

    BlogPublisher.createQuoteSection(
      "În România, grădina de legume nu este doar o sursă de hrană, ci și o moștenire culturală transmisă din generație în generație.",
      "Tradiție românească",
    ),

    BlogPublisher.createHeadingSection(
      "Legumele Esențiale pentru Grădina Românească",
      3,
    ),

    BlogPublisher.createListSection([
      "Roșii - soiuri autohtone precum 'Buzău' sau 'Dacia'",
      "Castraveți - rezistenți la boli și productivi",
      "Ardei - atât dulci cât și iuți, pentru zacuscă",
      "Ceapă - indispensabilă în bucătăria românească",
      "Usturoi - plantat toamna pentru recolta următoare",
      "Cartofi - soiuri timpurii și târzii",
      "Varză - pentru murături și sarmale",
      "Fasole - boabe și păstăi, bogată în proteine",
    ]),

    BlogPublisher.createImageSection(
      "https://images.unsplash.com/photo-1592394062530-e9e83f6a944e?w=800",
      "Legume proaspete cultivate în grădina românească",
    ),

    BlogPublisher.createHeadingSection("Calendarul Grădinarului Român", 2),

    BlogPublisher.createTextSection(
      "Succesul în grădinărit depinde mult de respectarea calendarului natural. În România, anotimpurile sunt bine definite, iar fiecare perioadă are activitățile sale specifice.",
    ),

    BlogPublisher.createHeadingSection("Primăvara (Martie - Mai)", 3),

    BlogPublisher.createListSection([
      "Pregătirea pământului - săpat și fertilizat",
      "Semănatul în patul cald - roșii, ardei, vinete",
      "Plantarea cartofilor - după 15 martie în sud, aprilie în nord",
      "Tăierea pomilor fructiferi - înainte de înfrunzit",
      "Curățarea grădinii de frunze uscate și resturi",
    ]),

    BlogPublisher.createHeadingSection("Vara (Iunie - August)", 3),

    BlogPublisher.createListSection([
      "Udatul regulat - dimineața devreme sau seara",
      "Plivitul constant - pentru a elimina buruienile",
      "Recoltarea legumelor de vară",
      "Semănatul culturilor de toamnă",
      "Tratamentele preventive împotriva dăunătorilor",
    ]),

    BlogPublisher.createHeadingSection("Toamna (Septembrie - Noiembrie)", 3),

    BlogPublisher.createListSection([
      "Recoltarea și conservarea legumelor",
      "Plantarea usturoiului de toamnă",
      "Pregătirea grădinii pentru iarnă",
      "Semănatul plantelor perene",
      "Strângerea frunzelor pentru compost",
    ]),

    BlogPublisher.createHeadingSection(
      "Sfaturi Practice pentru Grădina Românească",
      2,
    ),

    BlogPublisher.createTextSection(
      "Grădinăritul de succes în România necesită adaptarea la condițiile locale specifice. Iată cele mai importante sfaturi care te vor ajuta să obții o grădină prosperă:",
    ),

    BlogPublisher.createHeadingSection("Îmbunătățirea Solului", 3),

    BlogPublisher.createTextSection(
      "Solul românesc variază de la câmpiile fertile ale Bărăganului la pământurile mai sărace din zone montane. Indiferent de tipul de sol, compostul este cea mai bună investiție pentru grădina ta.",
    ),

    BlogPublisher.createListSection([
      "Testează pH-ul solului - majoritatea legumelor preferă 6.0-7.0",
      "Adaugă compost organic - făcut din resturi vegetale",
      "Folosește îngrășăminte naturale - gunoi de grajd bine fermentat",
      "Practică rotația culturilor - pentru a preveni epuizarea solului",
      "Mulcește cu fân sau frunze - pentru a păstra umiditatea",
    ]),

    BlogPublisher.createImageSection(
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
      "Sol sănătos - baza unei grădini prospere",
    ),

    BlogPublisher.createHeadingSection("Economia de Apă", 3),

    BlogPublisher.createTextSection(
      "Verile românești pot fi secetoase, iar factura la apă poate crește considerabil. Iată cum să economisești apă și să îți păstrezi grădina verde:",
    ),

    BlogPublisher.createListSection([
      "Instalează un sistem de irigații picătură cu picătură",
      "Colectează apa de ploaie în recipiente speciale",
      "Udă dimineața devreme pentru a reduce evaporarea",
      "Grupează plantele după necesarul de apă",
      "Folosește mulci pentru a păstra umiditatea solului",
    ]),

    BlogPublisher.createHeadingSection("Combaterea Dăunătorilor Natural", 2),

    BlogPublisher.createTextSection(
      "În loc să folosești pesticide chimice, poți combate dăunătorii prin metode naturale, mai sigure pentru familia ta și pentru mediu.",
    ),

    BlogPublisher.createListSection([
      "Plantează menta și busuiocul - alungă insectele dăunătoare",
      "Încurajează gărgărițele - se hrănesc cu afide",
      "Folosește spray cu apă și săpun - împotriva insectelor mici",
      "Instalează capcane pentru melci și limacși",
      "Practică asocierea plantelor - unele se protejează reciproc",
    ]),

    BlogPublisher.createHeadingSection("Grădina Ornamentală Românească", 2),

    BlogPublisher.createTextSection(
      "Nu uita de aspectul estetic al grădinii! Florile și plantele ornamentale nu doar că înfrumusețează spațiul, dar atrag și polenizatorii, esențiali pentru grădina de legume.",
    ),

    BlogPublisher.createListSection([
      "Floarea-soarelui - simbolul grădinilor românești",
      "Crini și bujori - pentru eleganță și parfum",
      "Macese și garoafe - floră tradițională",
      "Vița de vie - pentru umbră și fructe",
      "Trandafiri pitici - pentru borduri colorate",
    ]),

    BlogPublisher.createQuoteSection(
      "O grădină frumoasă este oglinda sufletului celui care o îngrijește.",
      "Înțelepciune populară românească",
    ),

    BlogPublisher.createHeadingSection(
      "Beneficiile Grădinăritului pentru Familiile Românești",
      2,
    ),

    BlogPublisher.createTextSection(
      "Grădinăritul aduce beneficii multiple familiilor românești, de la economia de bani la îmbunătățirea sănătății și consolidarea legăturilor familiale.",
    ),

    BlogPublisher.createHeadingSection("Beneficii Economice", 3),

    BlogPublisher.createListSection([
      "Reducerea costurilor cu alimentele - până la 30% din cheltuielile cu legumele",
      "Economii la medicamente - prin consumul de legume proaspete",
      "Creșterea valorii proprietății - o grădină îngrijită adaugă valoare",
      "Reducerea facturii la energie - umbra pomilor scade costurile de răcire",
    ]),

    BlogPublisher.createHeadingSection("Beneficii pentru Sănătate", 3),

    BlogPublisher.createListSection([
      "Exercițiu fizic regulat - grădinăritul este o formă de sport",
      "Reducerea stresului - contactul cu natura are efecte calmante",
      "Alimentație mai sănătoasă - legume proaspete fără chimicale",
      "Îmbunătățirea calității aerului - plantele purifică atmosfera",
    ]),

    BlogPublisher.createImageSection(
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      "Familia română lucrând împreună în grădină",
    ),

    BlogPublisher.createHeadingSection("Concluzie", 2),

    BlogPublisher.createTextSection(
      "Grădinăritul în România este o activitate plină de satisfacții care combină tradițiile străvechi cu tehnicile moderne. Indiferent dacă ai o curte mare sau doar un balcon, poți cultiva propriile tale legume și flori. Începe cu proiecte mici, învață din experiență și bucură-te de roadele muncii tale. O grădină românească nu este doar o sursă de hrană, ci și un spațiu de liniște și armonie în mijlocul vieții agitate moderne.",
    ),

    BlogPublisher.createTextSection(
      "Începe astăzi să îți planifici grădina pentru sezonul următor. Fiecare pas făcut astăzi va aduce roade în luna și anii următori. Succes în grădinărit!",
    ),
  ],
};

// Main execution function
async function publishRomanianGardenBlog() {
  const publisher = new BlogPublisher();

  console.log("Starting Romanian Garden Blog Publishing...");

  // Save the blog post as JSON file for reference
  BlogPublisher.saveBlogToFile(romanianGardenBlog, "romanian-garden-blog.json");

  // Authenticate
  const authenticated = await publisher.authenticate();
  if (!authenticated) {
    console.error("Failed to authenticate. Please check your credentials.");
    return;
  }

  // Create the blog post
  const result = await publisher.createBlogPost(romanianGardenBlog);
  if (result) {
    console.log("Romanian Garden Blog published successfully!");
    console.log("Blog ID:", result.id);
  } else {
    console.error("Failed to publish the blog post.");
  }
}

// Execute the script
publishRomanianGardenBlog().catch(console.error);

export { BlogPublisher, romanianGardenBlog };
