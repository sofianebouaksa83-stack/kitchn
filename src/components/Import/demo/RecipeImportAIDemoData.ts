export type FakeLibraryFile = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
  folder?: string;
};

export type FakeFolder = {
  id: string;
  name: string;
  files: FakeLibraryFile[];
};

export const MAX_MB = 10;

export const FAKE_LIBRARY_FILES: FakeLibraryFile[] = [
  {
    id: "lib-1",
    name: "fiche-technique-saumon-gravlax.pdf",
    sizeLabel: "1.2 MB",
    type: "PDF",
    folder: "Recettes froides",
  },
  {
    id: "lib-2",
    name: "dessert-citron-restaurant.docx",
    sizeLabel: "860 KB",
    type: "Word",
    folder: "Desserts",
  },
  {
    id: "lib-3",
    name: "base-sauce-vin-rouge.txt",
    sizeLabel: "72 KB",
    type: "Texte",
    folder: "Sauces",
  },
  {
    id: "lib-4",
    name: "risotto-truffe-noire.pdf",
    sizeLabel: "2.4 MB",
    type: "PDF",
    folder: "Plats chauds",
  },
  {
    id: "lib-5",
    name: "volaille-morilles.docx",
    sizeLabel: "1.1 MB",
    type: "Word",
    folder: "Signature",
  },
];

export const FAKE_FOLDERS: FakeFolder[] = [
  {
    id: "folder-1",
    name: "Recettes froides",
    files: [
      {
        id: "f1",
        name: "tartare-bar-agrumes.pdf",
        sizeLabel: "1.4 MB",
        type: "PDF",
        folder: "Recettes froides",
      },
      {
        id: "f2",
        name: "saumon-gravlax-maison.docx",
        sizeLabel: "930 KB",
        type: "Word",
        folder: "Recettes froides",
      },
    ],
  },
  {
    id: "folder-2",
    name: "Plats chauds",
    files: [
      {
        id: "f3",
        name: "risotto-truffe-noire.pdf",
        sizeLabel: "2.4 MB",
        type: "PDF",
        folder: "Plats chauds",
      },
      {
        id: "f4",
        name: "jus-volaille-reduit.txt",
        sizeLabel: "61 KB",
        type: "Texte",
        folder: "Plats chauds",
      },
      {
        id: "f5",
        name: "pigeon-confit-wagyu.docx",
        sizeLabel: "1.7 MB",
        type: "Word",
        folder: "Plats chauds",
      },
    ],
  },
  {
    id: "folder-3",
    name: "Desserts",
    files: [
      {
        id: "f6",
        name: "dessert-citron-restaurant.docx",
        sizeLabel: "860 KB",
        type: "Word",
        folder: "Desserts",
      },
      {
        id: "f7",
        name: "ganache-montee-vanille.txt",
        sizeLabel: "49 KB",
        type: "Texte",
        folder: "Desserts",
      },
    ],
  },
  {
    id: "folder-4",
    name: "Sauces",
    files: [
      {
        id: "f8",
        name: "base-sauce-vin-rouge.txt",
        sizeLabel: "72 KB",
        type: "Texte",
        folder: "Sauces",
      },
      {
        id: "f9",
        name: "beurre-blanc-premium.pdf",
        sizeLabel: "540 KB",
        type: "PDF",
        folder: "Sauces",
      },
    ],
  },
];

export function createFakeFile(fake: FakeLibraryFile) {
  const content = `Démo Kitch’n

Nom: ${fake.name}
Type: ${fake.type}
Dossier: ${fake.folder || "Sans dossier"}

Ingrédients
- Produit 1
- Produit 2
- Produit 3

Étapes
1. Préparer
2. Cuire
3. Dresser
`;

  return new File([content], fake.name, {
    type:
      fake.type === "PDF"
        ? "application/pdf"
        : fake.type === "Word"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "text/plain",
    lastModified: Date.now(),
  });
}
