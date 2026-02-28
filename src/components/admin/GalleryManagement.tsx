import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Pencil, Upload, X, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STYLE_OPTIONS = ["tribal", "floral", "realism", "symbolic", "script", "geometric", "minimalist", "traditional"];

interface GalleryImage {
  id: string;
  title: string;
  alt_text: string;
  gallery_type: string;
  styles: string[];
  sort_order: number;
  image_path: string;
  created_at: string;
}

export default function GalleryManagement() {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [galleryType, setGalleryType] = useState("portfolio");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Error loading gallery", description: error.message, variant: "destructive" });
    } else {
      setImages(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("gallery-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const resetForm = () => {
    setTitle("");
    setAltText("");
    setGalleryType("portfolio");
    setSelectedStyles([]);
    setFile(null);
    setPreview(null);
    setEditingImage(null);
  };

  const openEditDialog = (image: GalleryImage) => {
    setEditingImage(image);
    setTitle(image.title);
    setAltText(image.alt_text);
    setGalleryType(image.gallery_type);
    setSelectedStyles(image.styles || []);
    setPreview(getPublicUrl(image.image_path));
    setFile(null);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (!editingImage && !file) {
      toast({ title: "Please select an image", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      let imagePath = editingImage?.image_path || "";

      if (file) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `${galleryType}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Delete old file if replacing
        if (editingImage?.image_path) {
          await supabase.storage.from("gallery-images").remove([editingImage.image_path]);
        }

        imagePath = filePath;
      }

      if (editingImage) {
        const { error } = await supabase
          .from("gallery_images")
          .update({
            title,
            alt_text: altText,
            gallery_type: galleryType,
            styles: selectedStyles,
            image_path: imagePath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingImage.id);

        if (error) throw error;
        toast({ title: "Image updated successfully" });
      } else {
        const maxOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;

        const { error } = await supabase.from("gallery_images").insert({
          title,
          alt_text: altText,
          gallery_type: galleryType,
          styles: selectedStyles,
          image_path: imagePath,
          sort_order: maxOrder,
        });

        if (error) throw error;
        toast({ title: "Image added successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchImages();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Operation failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm("Delete this image permanently?")) return;

    try {
      await supabase.storage.from("gallery-images").remove([image.image_path]);
      const { error } = await supabase.from("gallery_images").delete().eq("id", image.id);
      if (error) throw error;
      toast({ title: "Image deleted" });
      fetchImages();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const filteredImages =
    filterType === "all" ? images : images.filter((i) => i.gallery_type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gallery Management</h2>
          <p className="text-sm text-muted-foreground">{images.length} images total</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] glass-panel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" /> Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingImage ? "Edit Image" : "Add New Image"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Image Upload */}
                <div>
                  <Label>Image</Label>
                  {preview ? (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-border">
                      <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => { setFile(null); setPreview(editingImage ? getPublicUrl(editingImage.image_path) : null); }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                  <label className="mt-2 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {editingImage ? "Replace image" : "Choose image"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rose with butterflies" />
                </div>

                {/* Alt Text */}
                <div>
                  <Label htmlFor="alt">Alt Text (for accessibility)</Label>
                  <Input id="alt" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image" />
                </div>

                {/* Gallery Type */}
                <div>
                  <Label>Gallery Type</Label>
                  <Select value={galleryType} onValueChange={setGalleryType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio">Portfolio (Gallery page)</SelectItem>
                      <SelectItem value="studio">Studio (About page)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Styles (for portfolio) */}
                {galleryType === "portfolio" && (
                  <div>
                    <Label>Styles</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {STYLE_OPTIONS.map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleStyle(style)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                            selectedStyles.includes(style)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleSubmit} disabled={uploading} className="w-full">
                  {uploading ? "Uploading..." : editingImage ? "Save Changes" : "Add Image"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No images yet. Click "Add Image" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="group relative glass-panel rounded-xl overflow-hidden">
              <img
                src={getPublicUrl(image.image_path)}
                alt={image.alt_text || image.title}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <p className="text-xs font-medium text-foreground text-center px-2 line-clamp-2">{image.title}</p>
                <span className="text-[10px] text-primary capitalize">{image.gallery_type}</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditDialog(image)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(image)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {image.styles?.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-1.5 flex flex-wrap gap-1">
                  {image.styles.slice(0, 2).map((s) => (
                    <span key={s} className="text-[9px] bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded-full capitalize">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
