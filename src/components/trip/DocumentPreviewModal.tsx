import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PreviewDocument = {
  title: string;
  fileName: string;
  url: string;
};

type Props = {
  doc: PreviewDocument | null;
  onClose: () => void;
};

function isImageFile(fileName: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(fileName);
}

function isPdfFile(fileName: string): boolean {
  return /\.pdf$/i.test(fileName);
}

/** Modal in-app para visualizar documentos e comprovantes sem usar window.open(). */
export function DocumentPreviewModal({ doc, onClose }: Props) {
  const fileName = doc?.fileName ?? "";
  const isImage = isImageFile(fileName);
  const isPdf = isPdfFile(fileName);

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl max-h-[90dvh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-display pr-6 truncate">
            <FileText className="size-5 shrink-0 text-primary" />
            <span className="truncate">{doc?.title || "Documento"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground truncate">
            {fileName}
          </DialogDescription>
        </DialogHeader>

        {doc && (
          <div className="flex-1 min-h-0 overflow-auto rounded-xl border bg-muted/30 flex items-center justify-center p-2">
            {isImage ? (
              <img
                src={doc.url}
                alt={doc.title}
                referrerPolicy="no-referrer"
                className="max-h-[65dvh] max-w-full rounded-lg object-contain"
              />
            ) : isPdf ? (
              <iframe
                src={doc.url}
                title={doc.title}
                className="w-full h-[65dvh] rounded-lg border-0 bg-white"
              />
            ) : (
              <div className="py-12 px-4 text-center space-y-3">
                <FileText className="size-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Pré-visualização indisponível para este formato ({fileName}).
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="shrink-0 flex-row justify-end gap-2 pt-2">
          {doc && (
            <>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={doc.url} download={doc.fileName} target="_blank" rel="noreferrer">
                  <Download className="size-4" />
                  Baixar
                </a>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <a href={doc.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Abrir em nova aba
                </a>
              </Button>
            </>
          )}
          <Button type="button" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
