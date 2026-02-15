import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DriveFileMetadata {
  name: string;
  mimeType: string;
  id: string;
}

const GOOGLE_MIME_TYPES: Record<string, string> = {
  'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const GOOGLE_EXPORT_FORMATS: Record<string, string> = {
  'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { fileId, accessToken } = await req.json();

    if (!fileId || !accessToken) {
      console.error('❌ Missing fileId or accessToken');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'fileId and accessToken are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`📥 Downloading Google Drive file: ${fileId}`);

    // Step 1: Get file metadata
    console.log('🔍 Fetching file metadata...');
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType,id`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('❌ Metadata fetch error:', errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to get file metadata: ${metadataResponse.statusText}`
        }),
        {
          status: metadataResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const metadata: DriveFileMetadata = await metadataResponse.json();
    console.log('✅ Metadata received:', metadata);

    let fileName = metadata.name || 'document';
    let mimeType = metadata.mimeType || 'application/octet-stream';
    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    // Step 2: Check if it's a Google Workspace file (needs export)
    const isGoogleWorkspaceFile = mimeType.startsWith('application/vnd.google-apps.');

    if (isGoogleWorkspaceFile) {
      console.log('📄 Google Workspace file detected, using export endpoint');

      const exportMimeType = GOOGLE_EXPORT_FORMATS[mimeType];
      if (!exportMimeType) {
        console.error('❌ Unsupported Google Workspace file type:', mimeType);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unsupported Google Workspace file type: ${mimeType}`
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
      mimeType = exportMimeType;

      // Update filename extension
      if (mimeType.includes('wordprocessingml')) {
        fileName = fileName.replace(/\.[^.]*$/, '') + '.docx';
      } else if (mimeType.includes('spreadsheetml')) {
        fileName = fileName.replace(/\.[^.]*$/, '') + '.xlsx';
      } else if (mimeType.includes('presentationml')) {
        fileName = fileName.replace(/\.[^.]*$/, '') + '.pptx';
      }
    }

    // Step 3: Download the file
    console.log(`⬇️ Downloading from: ${downloadUrl}`);
    const driveResponse = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      console.error('❌ Google Drive API error:', errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to download file from Google Drive: ${driveResponse.statusText}`
        }),
        {
          status: driveResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 4: Convert to byte array
    const fileArrayBuffer = await driveResponse.arrayBuffer();
    const fileData = Array.from(new Uint8Array(fileArrayBuffer));

    console.log(`✅ File downloaded successfully: ${fileName} (${fileData.length} bytes)`);

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        mimeType,
        fileData,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Download error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
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
