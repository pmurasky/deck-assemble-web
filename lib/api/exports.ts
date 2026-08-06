export type DeckExportFormat = 'txt' | 'csv' | 'json' | 'mtgo' | 'arena' | 'cod';

export const DECK_EXPORT_FORMATS: DeckExportFormat[] = ['txt', 'csv', 'json', 'mtgo', 'arena', 'cod'];

export function getDeckExportUrl(deckId: number, format: DeckExportFormat): string {
  return `/api/v1/decks/${deckId}/export?format=${encodeURIComponent(format)}`;
}

export function getCollectionExportUrl(collectionId: number): string {
  return `/api/v1/collections/${collectionId}/export`;
}

export function triggerAttachmentDownload(url: string, fileName?: string): void {
  if (typeof window === 'undefined') return;
  const link = document.createElement('a');
  link.href = url;
  if (fileName) link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
