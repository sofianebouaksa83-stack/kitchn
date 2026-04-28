import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import mammoth from "npm:mammoth@1.6.0";
import pdfParse from "npm:pdf-parse@1.1.1";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, x-client-info, Apikey, apikey",
};

interface IngredientData {
  quantity: number;
  unit: string;
  designation: string;
}

interface RecipeSectionData {
  title: string;
  ingredients: IngredientData[];
  instructions: string;
}

interface ParsedRecipeFromAI {
  title: string;
  servings: number;
  sections: RecipeSectionData[];
  general_instructions?: string;
}

type ConsumeQuotaRow = {
  allowed: boolean;
  plan: "free" | "premium";
  period_key: string;
  import_count: number;
  limit_count: number;
  remaining: number;
  message: string;
};

type UploadedFile = {
  buffer: Uint8Array;
  name: string;
  type: string;
};

type OpenAIContentPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail?: "low" | "high" | "auto" }
  | { type: "input_file"; filename: string; file_data: string };

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function guessMimeType(fileName: string, mimeType?: string): string {
  if (mimeType && mimeType !== "application/octet-stream") {
    return mimeType;
  }

  const name = fileName.toLowerCase();

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".svg")) return "image/svg+xml";

  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".txt")) return "text/plain";
  if (name.endsWith(".md")) return "text/markdown";
  if (name.endsWith(".csv")) return "text/csv";
  if (name.endsWith(".json")) return "application/json";
  if (name.endsWith(".html") || name.endsWith(".htm")) return "text/html";
  if (name.endsWith(".xml")) return "application/xml";

  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (name.endsWith(".doc")) {
    return "application/msword";
  }

  if (name.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (name.endsWith(".xls")) {
    return "application/vnd.ms-excel";
  }

  return "application/octet-stream";
}

function isTextLike(mimeType: string, fileName: string): boolean {
  const name = fileName.toLowerCase();

  return (
    mimeType.startsWith("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("javascript") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv") ||
    name.endsWith(".json") ||
    name.endsWith(".html") ||
    name.endsWith(".htm") ||
    name.endsWith(".xml") ||
    name.endsWith(".svg")
  );
}

function isVisionImage(mimeType: string, fileName: string): boolean {
  const name = fileName.toLowerCase();

  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/gif" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  );
}

function normalizeIngredientQuantity(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(",", ".").trim();

    const simpleFraction = cleaned.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (simpleFraction) {
      const numerator = Number(simpleFraction[1]);
      const denominator = Number(simpleFraction[2]);

      if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }

    const mixedFraction = cleaned.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (mixedFraction) {
      const whole = Number(mixedFraction[1]);
      const numerator = Number(mixedFraction[2]);
      const denominator = Number(mixedFraction[3]);

      if (
        Number.isFinite(whole) &&
        Number.isFinite(numerator) &&
        Number.isFinite(denominator) &&
        denominator !== 0
      ) {
        return whole + numerator / denominator;
      }
    }

    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function normalizeIngredientUnit(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "QS";
  }

  return value.trim();
}

function normalizeIngredientDesignation(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeInstructions(value: unknown): string {
  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function normalizeServings(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) {
      const parsed = Number(match[0]);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }

  return 4;
}

function sanitizeParsedRecipe(raw: any): ParsedRecipeFromAI {
  const title =
    typeof raw?.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : "Recette importée";

  const servings = normalizeServings(raw?.servings);

  const generalInstructions = normalizeInstructions(
    raw?.general_instructions ?? raw?.instructions ?? raw?.steps
  );

  const rawSections = Array.isArray(raw?.sections) ? raw.sections : [];

  const normalizeIngredients = (ingredients: any[]): IngredientData[] => {
    return ingredients
      .map((ingredient) => ({
        quantity: normalizeIngredientQuantity(ingredient?.quantity),
        unit: normalizeIngredientUnit(ingredient?.unit),
        designation: normalizeIngredientDesignation(
          ingredient?.designation ?? ingredient?.name ?? ingredient?.ingredient
        ),
      }))
      .filter((ingredient) => ingredient.designation.length > 0);
  };

  const sections: RecipeSectionData[] =
    rawSections.length > 0
      ? rawSections.map((section: any, sectionIndex: number) => ({
          title:
            typeof section?.title === "string" && section.title.trim()
              ? section.title.trim()
              : `Section ${sectionIndex + 1}`,
          instructions: normalizeInstructions(
            section?.instructions ?? section?.steps ?? section?.method
          ),
          ingredients: Array.isArray(section?.ingredients)
            ? normalizeIngredients(section.ingredients)
            : [],
        }))
      : [
          {
            title: "Préparation",
            instructions: generalInstructions,
            ingredients: Array.isArray(raw?.ingredients)
              ? normalizeIngredients(raw.ingredients)
              : [],
          },
        ];

  return {
    title,
    servings,
    sections,
    general_instructions: generalInstructions,
  };
}

async function getUploadedFile(request: Request): Promise<UploadedFile | null> {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return null;
  }

  const formData = await request.formData();
  const entry =
    formData.get("file") ||
    Array.from(formData.values()).find((value) => value instanceof File);

  if (!(entry instanceof File)) {
    return null;
  }

  const buffer = new Uint8Array(await entry.arrayBuffer());
  const name = entry.name || "fichier";
  const type = guessMimeType(name, entry.type);

  return {
    buffer,
    name,
    type,
  };
}

async function tryExtractTextFromFile(
  buffer: Uint8Array,
  fileName: string,
  mimeType: string
): Promise<string | null> {
  const name = fileName.toLowerCase();

  try {
    console.log(`📄 Extracting text from file: ${fileName} (${mimeType})`);

    if (isTextLike(mimeType, fileName)) {
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(buffer);
    }

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".docx")
    ) {
      console.log("🔄 Using mammoth to extract DOCX...");

      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );

      const { value } = await mammoth.extractRawText({ arrayBuffer });

      console.log(`✅ Extracted ${value.length} characters from DOCX`);
      return value;
    }

    if (mimeType === "application/pdf" || name.endsWith(".pdf")) {
      console.log("🔄 Using pdf-parse to extract PDF...");

      const data = await pdfParse(buffer);

      console.log(`✅ Extracted ${data.text.length} characters from PDF`);
      return data.text;
    }

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel" ||
      name.endsWith(".xlsx") ||
      name.endsWith(".xls")
    ) {
      console.log("🔄 Using XLSX to extract spreadsheet...");

      const workbook = XLSX.read(buffer, { type: "array" });
      const chunks: string[] = [];

      for (const sheetName of workbook.SheetNames.slice(0, 10)) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);

        if (csv.trim()) {
          chunks.push(`--- Feuille: ${sheetName} ---\n${csv}`);
        }
      }

      const text = chunks.join("\n\n");

      console.log(`✅ Extracted ${text.length} characters from spreadsheet`);
      return text || null;
    }

    return null;
  } catch (error) {
    console.warn("⚠️ Text extraction failed, fallback to OpenAI file input:", error);
    return null;
  }
}

function getRecipePrompt(): string {
  return `Tu es un expert cuisinier français spécialisé dans la transformation de recettes en format structuré.

OBJECTIF:
Analyse le fichier envoyé et transforme son contenu en JSON structuré pour l'application Kitch'n.

Le fichier peut être:
- une photo de recette
- une capture d'écran
- un PDF
- un document Word
- un tableau Excel ou CSV
- un fichier texte
- ou n'importe quel autre fichier contenant une recette ou une fiche technique.

FORMAT JSON À PRODUIRE:
Réponds UNIQUEMENT avec ce JSON, sans markdown, sans texte avant ou après.

{
  "title": "Nom de la recette",
  "servings": 4,
  "sections": [
    {
      "title": "Nom de la section",
      "ingredients": [
        {
          "quantity": 0.5,
          "unit": "kg",
          "designation": "foie gras cru"
        }
      ],
      "instructions": "Instructions de préparation pour cette section"
    }
  ],
  "general_instructions": "Instructions générales si présentes"
}

RÈGLES IMPORTANTES:
1. Détecte les sections dans la recette.
2. Si tu détectes des sections, crée un objet par section.
3. Si tu ne détectes pas de sections, crée une seule section appelée "Préparation".
4. Pour les quantités:
   - Convertis tout en nombre.
   - 1/2 devient 0.5.
   - Si aucune quantité n'est indiquée, mets quantity: 0 et unit: "QS".
   - Pour "une pincée", mets quantity: 1 et unit: "pincée".
5. Les unités doivent rester courtes: g, kg, L, cl, ml, pièce, unité, cs, cc, pincée, QS.
6. Si le nombre de portions est absent, mets servings: 4.
7. Si le fichier n'est pas une recette claire, fais de ton mieux pour extraire une fiche recette exploitable.
8. Ne renvoie jamais de tableau vide si tu vois des ingrédients dans le fichier.`;
}

async function buildOpenAIContentFromFile(
  file: UploadedFile
): Promise<OpenAIContentPart[]> {
  const prompt = getRecipePrompt();
  const extractedText = await tryExtractTextFromFile(
    file.buffer,
    file.name,
    file.type
  );

  const content: OpenAIContentPart[] = [
    {
      type: "input_text",
      text: prompt,
    },
  ];

  if (extractedText && extractedText.trim().length > 0) {
    content.push({
      type: "input_text",
      text: `
Nom du fichier: ${file.name}
Type du fichier: ${file.type}

Contenu extrait:
${extractedText.slice(0, 120000)}
`,
    });

    return content;
  }

  const base64 = arrayBufferToBase64(file.buffer);
  const dataUrl = `data:${file.type};base64,${base64}`;

  if (isVisionImage(file.type, file.name)) {
    content.push({
      type: "input_image",
      image_url: dataUrl,
      detail: "high",
    });

    return content;
  }

  content.push({
    type: "input_file",
    filename: file.name,
    file_data: dataUrl,
  });

  return content;
}

function extractOutputText(openaiResult: any): string {
  if (typeof openaiResult?.output_text === "string") {
    return openaiResult.output_text.trim();
  }

  const texts: string[] = [];

  if (Array.isArray(openaiResult?.output)) {
    for (const item of openaiResult.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string") {
            texts.push(content.text);
          }
        }
      }
    }
  }

  return texts.join("\n").trim();
}

function parseJsonFromAI(text: string): any {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("La réponse IA n'est pas un JSON valide");
  }
}

async function parseRecipeWithOpenAIFile(
  file: UploadedFile
): Promise<ParsedRecipeFromAI> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiApiKey || openaiApiKey === "votre_cle_openai_ici") {
    throw new Error(
      "OPENAI_API_KEY not configured. Please add your OpenAI API key in Supabase Edge Function secrets."
    );
  }

  const content = await buildOpenAIContentFromFile(file);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content,
        },
      ],
      temperature: 0.2,
    }),
  });

  const openaiResult = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("❌ OpenAI error:", openaiResult);

    throw new Error(
      openaiResult?.error?.message ||
        "Erreur OpenAI pendant l'analyse du fichier"
    );
  }

  const outputText = extractOutputText(openaiResult);

  if (!outputText) {
    console.error("❌ Empty OpenAI response:", openaiResult);
    throw new Error("L'IA n'a pas retourné de recette exploitable");
  }

  const parsed = parseJsonFromAI(outputText);
  return sanitizeParsedRecipe(parsed);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("🔐 Checking authorization...");

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        { success: false, error: "Missing authorization header" },
        401
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse(
        {
          success: false,
          error: "Supabase environment variables are missing",
        },
        500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ success: false, error: "Unauthorized" }, 401);
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    // =========================================================
    // PARSE REQUEST
    // =========================================================
    console.log("📦 Parsing multipart form data...");

    const file = await getUploadedFile(req);

    if (!file) {
      console.error("❌ No file found in request");

      return jsonResponse(
        {
          success: false,
          error: "No file provided",
        },
        400
      );
    }

    console.log(
      `✅ File received: ${file.name}, type: ${file.type}, size: ${file.buffer.length} bytes`
    );

    // =========================================================
    // QUOTA CHECK - vraie sécurité backend
    // =========================================================
    console.log("📊 Checking AI import quota...");

    const { data: quotaData, error: quotaError } = await supabase.rpc(
      "consume_ai_import_quota"
    );

    if (quotaError) {
      console.error("❌ Quota error:", quotaError);

      return jsonResponse(
        {
          success: false,
          error: quotaError.message || "Erreur quota IA",
        },
        400
      );
    }

    const quotaRow = (Array.isArray(quotaData) ? quotaData[0] : quotaData) as
      | ConsumeQuotaRow
      | null;

    if (!quotaRow?.allowed) {
      console.error("⛔ AI import limit reached:", quotaRow);

      return jsonResponse(
        {
          success: false,
          code: "AI_IMPORT_LIMIT_REACHED",
          error: quotaRow?.message || "Limite atteinte, passez à Premium",
          remaining: quotaRow?.remaining ?? 0,
          plan: quotaRow?.plan ?? "free",
        },
        403
      );
    }

    console.log(
      `✅ Quota ok: plan=${quotaRow.plan}, used=${quotaRow.import_count}, remaining=${quotaRow.remaining}`
    );

    // =========================================================
    // OPENAI PARSING
    // =========================================================
    console.log("🤖 Parsing recipe with OpenAI...");

    const parsedRecipe = await parseRecipeWithOpenAIFile(file);

    if (!parsedRecipe.sections || parsedRecipe.sections.length === 0) {
      return jsonResponse(
        {
          success: false,
          error: "Aucune section trouvée dans la recette",
        },
        400
      );
    }

    // =========================================================
    // GET PROFILE / RESTAURANT
    // =========================================================
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("restaurant_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.restaurant_id) {
      return jsonResponse(
        {
          success: false,
          error: "Restaurant non trouvé pour cet utilisateur",
        },
        400
      );
    }

    // =========================================================
    // CREATE RECIPE
    // =========================================================
    console.log("💾 Creating recipe in database...");

    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        restaurant_id: profile.restaurant_id,
        title: parsedRecipe.title,
        category: "Autre",
        servings: parsedRecipe.servings || 4,
        notes: parsedRecipe.general_instructions || "",
        is_base_recipe: false,
      })
      .select()
      .maybeSingle();

    if (recipeError || !recipeData) {
      console.error("❌ Recipe creation error:", recipeError);

      return jsonResponse(
        {
          success: false,
          error: recipeError?.message || "Failed to create recipe",
        },
        400
      );
    }

    console.log(`✅ Recipe created: ${recipeData.id}`);

    // =========================================================
    // CREATE SECTIONS + INGREDIENTS + LINKS
    // =========================================================
    for (
      let sectionIndex = 0;
      sectionIndex < parsedRecipe.sections.length;
      sectionIndex++
    ) {
      const section = parsedRecipe.sections[sectionIndex];

      const { data: sectionData, error: sectionError } = await supabase
        .from("recipe_sections")
        .insert({
          recipe_id: recipeData.id,
          title: section.title,
          instructions: section.instructions,
          order_index: sectionIndex,
        })
        .select()
        .maybeSingle();

      if (sectionError || !sectionData) {
        console.error("❌ Section creation error:", sectionError);
        continue;
      }

      if (section.ingredients && section.ingredients.length > 0) {
        for (
          let ingredientIndex = 0;
          ingredientIndex < section.ingredients.length;
          ingredientIndex++
        ) {
          const ingredient = section.ingredients[ingredientIndex];

          const { data: ingredientData, error: ingredientError } = await supabase
            .from("ingredients")
            .insert({
              recipe_id: recipeData.id,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              designation: ingredient.designation,
              order_index: ingredientIndex,
            })
            .select()
            .maybeSingle();

          if (ingredientError || !ingredientData) {
            console.error("❌ Ingredient creation error:", ingredientError);
            continue;
          }

          const { error: sectionIngredientError } = await supabase
            .from("section_ingredients")
            .insert({
              section_id: sectionData.id,
              ingredient_id: ingredientData.id,
              order_index: ingredientIndex,
            });

          if (sectionIngredientError) {
            console.error(
              "❌ Section ingredient link error:",
              sectionIngredientError
            );
          }
        }
      }
    }

    console.log("✅ Recipe import completed successfully");

    return jsonResponse({
      success: true,
      title: parsedRecipe.title,
      recipeId: recipeData.id,
      sectionsCount: parsedRecipe.sections.length,
      quota: {
        plan: quotaRow.plan,
        remaining: quotaRow.remaining,
        import_count: quotaRow.import_count,
        limit_count: quotaRow.limit_count,
      },
    });
  } catch (error) {
    console.error("❌ Import error:", error);

    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      },
      500
    );
  }
});