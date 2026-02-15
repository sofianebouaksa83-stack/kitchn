import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import mammoth from "npm:mammoth@1.6.0";
import pdfParse from "npm:pdf-parse@1.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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

async function parseRecipeWithOpenAI(text: string): Promise<ParsedRecipeFromAI> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiApiKey || openaiApiKey === 'votre_cle_openai_ici') {
    throw new Error('OPENAI_API_KEY not configured. Please add your OpenAI API key in Supabase Edge Function secrets.');
  }

  const systemPrompt = `Tu es un expert cuisinier français spécialisé dans la transformation de recettes en format structuré.

OBJECTIF: Transformer le texte d'une recette en JSON structuré avec sections.

FORMAT JSON À PRODUIRE (réponds UNIQUEMENT avec ce JSON, sans texte avant ou après):
{
  "title": "Nom de la recette",
  "servings": 4,
  "sections": [
    {
      "title": "Nom de la section (ex: Foie gras, Sauce lie de vin, etc.)",
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
1. Détecte les SECTIONS dans la recette (ex: "Foie gras", "Sauce lie de vin", etc.)
2. Si tu détectes des sections, crée un objet par section avec ses ingrédients et instructions
3. Si pas de sections, crée UNE SEULE section appelée "Préparation"
4. Pour les quantités et unités:
   - Convertis tout en format numérique (1/2 = 0.5, etc.)
   - Unités acceptées: g, kg, L, cl, ml, pièce, unité, cuillère, tasse, cs (cuillère à soupe), cc (cuillère à café), pincée, QS
   - Si AUCUNE quantité n'est spécifiée (ex: "sel", "poivre"), utilise quantity: 0 et unit: "QS"
   - Si c'est "une pincée", utilise quantity: 1 et unit: "pincée"
5. Le nombre de couverts (servings) doit être extrait du texte (cherche "pour X personnes" ou "X portions")
6. Instructions: garde les étapes de préparation textuelles pour chaque section`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transforme cette recette en JSON:\n\n${text}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}

async function extractTextFromFile(buffer: Uint8Array, fileName: string, mimeType: string): Promise<string> {
  const name = fileName.toLowerCase();

  console.log(`📄 Extracting text from file: ${fileName} (${mimeType})`);

  if (mimeType === "text/plain" || name.endsWith(".txt") || name.endsWith(".md")) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    console.log('🔄 Using mammoth to extract DOCX...');
    console.log(`📊 Buffer info: length=${buffer.length}, byteOffset=${buffer.byteOffset}, byteLength=${buffer.byteLength}`);

    // mammoth needs an ArrayBuffer, not a Uint8Array
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    console.log(`📦 Created ArrayBuffer: byteLength=${arrayBuffer.byteLength}`);

    // Use the correct mammoth API - pass as buffer option
    const { value } = await mammoth.extractRawText({ buffer });
    console.log(`✅ Extracted ${value.length} characters from DOCX`);
    return value;
  }

  if (mimeType === "application/msword" || name.endsWith(".doc")) {
    console.log('🔄 Using mammoth to extract DOC...');
    const { value } = await mammoth.extractRawText({ buffer });
    console.log(`✅ Extracted ${value.length} characters from DOC`);
    return value;
  }

  if (mimeType === "application/pdf" || name.endsWith(".pdf")) {
    console.log('🔄 Using pdf-parse to extract PDF...');
    const data = await pdfParse(buffer);
    console.log(`✅ Extracted ${data.text.length} characters from PDF`);
    return data.text;
  }

  throw new Error(`Format de fichier non supporté: ${mimeType || name}`);
}

async function parseMultipartFormData(request: Request): Promise<{ file: { buffer: Uint8Array, name: string, type: string } | null }> {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return { file: null };
  }

  const boundary = contentType.split("boundary=")[1];
  if (!boundary) {
    return { file: null };
  }

  const body = await request.arrayBuffer();
  const uint8Array = new Uint8Array(body);

  const boundaryBytes = new TextEncoder().encode(`--${boundary}`);
  const boundaryPositions: number[] = [];

  // Find all boundary positions
  for (let i = 0; i < uint8Array.length - boundaryBytes.length; i++) {
    let match = true;
    for (let j = 0; j < boundaryBytes.length; j++) {
      if (uint8Array[i + j] !== boundaryBytes[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      boundaryPositions.push(i);
      i += boundaryBytes.length - 1; // Skip past this boundary
    }
  }

  console.log(`📍 Found ${boundaryPositions.length} boundaries`);

  if (boundaryPositions.length < 2) {
    console.error('❌ Not enough boundaries found');
    return { file: null };
  }

  // Extract the first part (between first and second boundary)
  const firstBoundaryEnd = boundaryPositions[0] + boundaryBytes.length;
  const secondBoundaryStart = boundaryPositions[1];
  const partBytes = uint8Array.slice(firstBoundaryEnd, secondBoundaryStart);

  console.log(`📦 Part size: ${partBytes.length} bytes`);

  // Parse headers (they're always text at the start)
  const decoder = new TextDecoder();
  const headerText = decoder.decode(partBytes.slice(0, Math.min(500, partBytes.length)));

  let fileName = '';
  let contentTypeValue = 'application/octet-stream';

  const headerLines = headerText.split('\r\n');
  for (const line of headerLines) {
    if (line.includes('Content-Disposition')) {
      const match = line.match(/filename="([^"]+)"/);
      if (match) fileName = match[1];
    }
    if (line.includes('Content-Type:')) {
      const parts = line.split(':');
      if (parts[1]) contentTypeValue = parts[1].trim();
    }
  }

  console.log(`📄 File info: ${fileName}, ${contentTypeValue}`);

  // Find where headers end (after \r\n\r\n)
  const headerEndMarker = new TextEncoder().encode('\r\n\r\n');
  let headerEnd = -1;

  for (let i = 0; i < Math.min(1000, partBytes.length - headerEndMarker.length); i++) {
    let match = true;
    for (let j = 0; j < headerEndMarker.length; j++) {
      if (partBytes[i + j] !== headerEndMarker[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      headerEnd = i + headerEndMarker.length;
      break;
    }
  }

  if (headerEnd === -1) {
    console.error('❌ Could not find end of headers');
    return { file: null };
  }

  console.log(`📍 Headers end at byte ${headerEnd}`);

  // The file data is everything from headerEnd to the end, minus the trailing \r\n
  let fileEnd = partBytes.length;

  // Remove trailing \r\n if present (but keep binary data intact)
  if (fileEnd >= 2 && partBytes[fileEnd - 2] === 13 && partBytes[fileEnd - 1] === 10) {
    fileEnd -= 2;
  }

  const fileBuffer = partBytes.slice(headerEnd, fileEnd);

  console.log(`✅ Extracted file: ${fileName}, ${contentTypeValue}, ${fileBuffer.length} bytes`);

  return {
    file: {
      buffer: fileBuffer,
      name: fileName,
      type: contentTypeValue
    }
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('🔐 Checking authorization...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📦 Parsing multipart form data...');
    const { file } = await parseMultipartFormData(req);

    if (!file) {
      console.error('❌ No file found in request');
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ File received: ${file.name}, type: ${file.type}, size: ${file.buffer.length} bytes`);

    const text = await extractTextFromFile(file.buffer, file.name, file.type);

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aucun texte extrait du fichier. Vérifiez que le fichier contient du texte.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Text extracted: ${text.length} characters`);
    console.log('🤖 Parsing recipe with OpenAI...');
    const parsedRecipe = await parseRecipeWithOpenAI(text);

    if (!parsedRecipe.sections || parsedRecipe.sections.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aucune section trouvée dans la recette' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile?.restaurant_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Restaurant non trouvé pour cet utilisateur' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('💾 Creating recipe in database...');
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        restaurant_id: profile.restaurant_id,
        title: parsedRecipe.title,
        category: 'Autre',
        servings: parsedRecipe.servings || 4,
        notes: parsedRecipe.general_instructions || '',
        is_base_recipe: false
      })
      .select()
      .maybeSingle();

    if (recipeError || !recipeData) {
      console.error('Recipe creation error:', recipeError);
      return new Response(
        JSON.stringify({ success: false, error: recipeError?.message || 'Failed to create recipe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Recipe created: ${recipeData.id}`);

    for (let sectionIndex = 0; sectionIndex < parsedRecipe.sections.length; sectionIndex++) {
      const section = parsedRecipe.sections[sectionIndex];

      const { data: sectionData, error: sectionError } = await supabase
        .from('recipe_sections')
        .insert({
          recipe_id: recipeData.id,
          title: section.title,
          instructions: section.instructions,
          order_index: sectionIndex
        })
        .select()
        .maybeSingle();

      if (sectionError || !sectionData) {
        console.error('Section creation error:', sectionError);
        continue;
      }

      if (section.ingredients && section.ingredients.length > 0) {
        for (let ingredientIndex = 0; ingredientIndex < section.ingredients.length; ingredientIndex++) {
          const ingredient = section.ingredients[ingredientIndex];

          const { data: ingredientData, error: ingredientError } = await supabase
            .from('ingredients')
            .insert({
              recipe_id: recipeData.id,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              designation: ingredient.designation,
              order_index: ingredientIndex
            })
            .select()
            .maybeSingle();

          if (ingredientError || !ingredientData) {
            console.error('Ingredient creation error:', ingredientError);
            continue;
          }

          await supabase
            .from('section_ingredients')
            .insert({
              section_id: sectionData.id,
              ingredient_id: ingredientData.id,
              order_index: ingredientIndex
            });
        }
      }
    }

    console.log('✅ Recipe import completed successfully');
    return new Response(
      JSON.stringify({
        success: true,
        title: parsedRecipe.title,
        recipeId: recipeData.id,
        sectionsCount: parsedRecipe.sections.length
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Import error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Import failed'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});