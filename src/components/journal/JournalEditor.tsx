"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useCallback } from "react";
import { saveJournalEntry } from "@/server/actions/journal";
import { Loader2, Save, Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2, Heading3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

interface JournalEditorProps {
    date: string; // YYYY-MM-DD
    initialContent?: Record<string, unknown>;
}

const MenuBar = ({ editor }: { editor: Editor }) => {
    const [, forceUpdate] = useState({});

    useEffect(() => {
        if (!editor) return;

        const updateHandler = () => {
            forceUpdate({});
        };

        editor.on('selectionUpdate', updateHandler);
        editor.on('transaction', updateHandler);

        return () => {
            editor.off('selectionUpdate', updateHandler);
            editor.off('transaction', updateHandler);
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    const buttonClass = (isActive: boolean) =>
        `p-2 rounded hover:bg-zinc-100 transition-colors ${
            isActive ? "bg-zinc-200 text-zinc-900" : "text-zinc-600"
        }`;

    return (
        <div className="border border-zinc-200 rounded-lg p-2 mb-4 flex flex-wrap gap-1 bg-white sticky top-0 z-10">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive("bold"))}
                title="Bold (Cmd+B)">
                <Bold className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive("italic"))}
                title="Italic (Cmd+I)">
                <Italic className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive("strike"))}
                title="Strikethrough">
                <Strikethrough className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={buttonClass(editor.isActive("code"))}
                title="Code">
                <Code className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 1 }))}
                title="Heading 1">
                <Heading1 className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 2 }))}
                title="Heading 2">
                <Heading2 className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 3 }))}
                title="Heading 3">
                <Heading3 className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive("bulletList"))}
                title="Bullet List">
                <List className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive("orderedList"))}
                title="Numbered List">
                <ListOrdered className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive("blockquote"))}
                title="Blockquote">
                <Quote className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={`${buttonClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Undo (Cmd+Z)">
                <Undo className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={`${buttonClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Redo (Cmd+Shift+Z)">
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
};

export function JournalEditor({ date, initialContent }: JournalEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Write something...",
            }),
        ],
        content: initialContent || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-zinc prose-base max-w-none focus:outline-none min-h-[calc(100vh-300px)] text-[16px] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            },
            
        },
        onUpdate: () => {
            setHasUnsavedChanges(true);
        },
    });

    const handleSave = useCallback(async () => {
        if (!editor || !hasUnsavedChanges) return;

        setIsSaving(true);
        try {
            const content = editor.getJSON();
            const result = await saveJournalEntry(date, content);
            
            if (result.success) {
                setHasUnsavedChanges(false);
                toast.success("Entry saved");
            } else {
                toast.error(result.error || "Failed to save entry");
            }
        } catch {
            toast.error("Failed to save entry");
        } finally {
            setIsSaving(false);
        }
    }, [editor, hasUnsavedChanges, date]);

    // Keyboard shortcut for save (Cmd/Ctrl + S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                if (editor && hasUnsavedChanges) {
                    handleSave();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [editor, hasUnsavedChanges, handleSave]);

    if (!editor) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <style>{`
                .tiptap p {
                    font-size: 1.1rem !important;
                    line-height: 1.6;
                }
            `}</style>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-zinc-800">
                    {dayjs(date).format("dddd, MMMM D, YYYY")}
                </h1>
                <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
            <MenuBar editor={editor} />
           
            <EditorContent editor={editor} />
            
        </div>
    );
}
