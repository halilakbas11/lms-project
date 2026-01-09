'use client';
import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Initial value setup
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            // Only set if completely empty or strictly different to prevent cursor jumps
            if (!editorRef.current.textContent?.trim() && !value) {
                editorRef.current.innerHTML = '';
            } else if (value && editorRef.current.innerHTML.replace(/<[^>]*>/g, '') !== value.replace(/<[^>]*>/g, '')) {
                editorRef.current.innerHTML = value;
            }
        }
    }, []); // Run once on mount for initial value

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
    };

    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${isFocused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
            }`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                <ToolbarButton
                    onClick={() => execCommand('bold')}
                    label="B"
                    active={document.queryCommandState('bold')}
                    className="font-bold"
                />
                <ToolbarButton
                    onClick={() => execCommand('italic')}
                    label="I"
                    active={document.queryCommandState('italic')}
                    className="italic"
                />
                <ToolbarButton
                    onClick={() => execCommand('underline')}
                    label="U"
                    active={document.queryCommandState('underline')}
                    className="underline"
                />

                <div className="w-px h-6 bg-gray-300 mx-2" />

                <ToolbarButton
                    onClick={() => execCommand('formatBlock', 'H3')}
                    label="H1"
                />
                <ToolbarButton
                    onClick={() => execCommand('formatBlock', 'H4')}
                    label="H2"
                />

                <div className="w-px h-6 bg-gray-300 mx-2" />

                <ToolbarButton
                    onClick={() => execCommand('insertOrderedList')}
                    label="1."
                />
                <ToolbarButton
                    onClick={() => execCommand('insertUnorderedList')}
                    label="•"
                />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                className="p-4 min-h-[200px] outline-none max-h-[500px] overflow-y-auto prose max-w-none"
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                // placeholder prop is not directly supported on div with contentEditable typicaly without css help, 
                // but we keep it passed for cleanliness or future impl
                data-placeholder={placeholder}
            />
            {(!value && placeholder) && (
                <div className="absolute pointer-events-none p-4 text-gray-400">
                    {placeholder}
                </div>
            )}
        </div>
    );
}

const ToolbarButton = ({ onClick, label, active = false, className = '' }: any) => (
    <button
        type="button"
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            } ${className}`}
        title={label}
    >
        {label}
    </button>
);
