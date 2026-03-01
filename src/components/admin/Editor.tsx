"use client";

import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useCallback } from "react";

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

const COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="mx-1 h-6 w-px bg-neutral-300 dark:bg-neutral-600" />
  );
}

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const MAX_WIDTH = 1600;
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width <= MAX_WIDTH) {
    bitmap.close();
    return file;
  }

  const ratio = MAX_WIDTH / width;
  width = MAX_WIDTH;
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      "image/webp",
      0.8
    );
  });

  if (blob && blob.size < file.size) {
    const ext = "webp";
    const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
    return new File([blob], name, { type: `image/${ext}` });
  }

  // WebP not smaller or not supported — try JPEG fallback
  const jpegBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
  });

  if (jpegBlob && jpegBlob.size < file.size) {
    const name = file.name.replace(/\.[^.]+$/, ".jpg");
    return new File([jpegBlob], name, { type: "image/jpeg" });
  }

  return file;
}

async function uploadImageFile(file: File): Promise<string | null> {
  const compressed = await compressImage(file);
  const formData = new FormData();
  formData.append("file", compressed);
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Upload failed");
      return null;
    }
    const { url } = await res.json();
    return url;
  } catch {
    alert("Upload failed");
    return null;
  }
}

const PLACEHOLDER_TEXT = "[Uploading image...]";

function removePlaceholder(editor: TiptapEditor) {
  const { state } = editor;
  let placeholderPos = -1;
  state.doc.descendants((node, pos) => {
    if (placeholderPos === -1 && node.isText && node.text === PLACEHOLDER_TEXT) {
      placeholderPos = pos;
    }
  });
  if (placeholderPos !== -1) {
    const node = state.doc.nodeAt(placeholderPos);
    if (node) {
      const tr = state.tr.delete(placeholderPos, placeholderPos + node.nodeSize);
      editor.view.dispatch(tr);
    }
  }
}

async function uploadWithPlaceholder(editor: TiptapEditor, file: File) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: "paragraph",
      content: [{ type: "text", text: PLACEHOLDER_TEXT }],
    })
    .run();

  const url = await uploadImageFile(file);
  removePlaceholder(editor);

  if (url) {
    editor.chain().focus().setImage({ src: url }).run();
  }
}

function getImagesFromFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter((f) => f.type.startsWith("image/"));
}

export default function Editor({ content, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      Color,
      TextStyle,
      Underline,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.files;
        if (!items || items.length === 0) return false;
        const images = getImagesFromFiles(items);
        if (images.length === 0) return false;

        event.preventDefault();
        images.forEach((file) => {
          if (editor) uploadWithPlaceholder(editor, file);
        });
        return true;
      },
      handleDrop: (_view, event) => {
        const items = event.dataTransfer?.files;
        if (!items || items.length === 0) return false;
        const images = getImagesFromFiles(items);
        if (images.length === 0) return false;

        event.preventDefault();
        images.forEach((file) => {
          if (editor) uploadWithPlaceholder(editor, file);
        });
        return true;
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      await uploadWithPlaceholder(editor, file);

      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-neutral-300 dark:border-neutral-700">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-neutral-300 bg-neutral-50 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-800/50">
        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          &bull; List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          1. List
        </ToolbarButton>

        <Divider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          &ldquo; Quote
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          {"</>"}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          Code
        </ToolbarButton>

        <Divider />

        {/* Color picker */}
        <div className="flex items-center gap-0.5">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => editor.chain().focus().setColor(color).run()}
              title={color}
              className="h-5 w-5 rounded border border-neutral-300 dark:border-neutral-600"
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetColor().run()}
            title="Remove color"
            className="ml-0.5 rounded px-1.5 py-0.5 text-xs text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            &times;
          </button>
        </div>

        <Divider />

        {/* Image upload */}
        <ToolbarButton onClick={handleImageUpload} title="Upload Image">
          Image
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFileSelected}
          className="hidden"
        />

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          Redo
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <div className="rounded-b-lg bg-white dark:bg-neutral-800">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
