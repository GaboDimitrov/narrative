import pdf from 'pdf-parse';

export interface ParsedPDF {
  text: string;
  numPages: number;
  info: {
    title?: string;
    author?: string;
    creationDate?: string;
  };
}

export async function parsePDF(file: File): Promise<ParsedPDF> {
  const buffer = await file.arrayBuffer();
  const data = await pdf(Buffer.from(buffer));
  
  return {
    text: data.text,
    numPages: data.numpages,
    info: {
      title: data.info?.Title,
      author: data.info?.Author,
      creationDate: data.info?.CreationDate,
    },
  };
}

export async function parsePDFFromBuffer(buffer: Buffer): Promise<ParsedPDF> {
  const data = await pdf(buffer);
  
  return {
    text: data.text,
    numPages: data.numpages,
    info: {
      title: data.info?.Title,
      author: data.info?.Author,
      creationDate: data.info?.CreationDate,
    },
  };
}
