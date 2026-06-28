import { useRef } from "react";

export default function ScriptEditor({
    title = "Python Script Editor",
    value,
    onChange,
    onSave,
    disabled,
    placeholder = `# Example
if cpu_temp > 70:
    set_min_frequency()
`,
}) {
    const textareaRef = useRef(null);

    const lineCount = Math.max(value.split("\n").length, 1);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">

                <div>
                    <h2 className="font-semibold text-lg text-gray-800">
                        {title}
                    </h2>

                    <p className="text-sm text-gray-500">
                        Write your userspace governor logic.
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

            </div>

            {/* Editor */}
            <div className="flex h-[500px] font-mono">

                {/* Line Number */}
                <div className="bg-slate-900 text-slate-500 px-4 py-4 text-right select-none">

                    {Array.from({ length: lineCount }).map((_, i) => (
                        <div
                            key={i}
                            className="leading-7"
                        >
                            {i + 1}
                        </div>
                    ))}

                </div>

                {/* Textarea */}
                <textarea
                    disabled={disabled}
                    ref={textareaRef}
                    spellCheck={false}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === "Tab") {
                            e.preventDefault();

                            const start = e.target.selectionStart;
                            const end = e.target.selectionEnd;

                            const newValue =
                                value.substring(0, start) +
                                "    " + // 4 spasi
                                value.substring(end);

                            onChange(newValue);

                            // kembalikan posisi cursor
                            requestAnimationFrame(() => {
                                e.target.selectionStart = e.target.selectionEnd = start + 4;
                            });
                        }
                    }}
                    className="
                        flex-1
                        resize-none
                        bg-slate-900
                        text-slate-100
                        px-4
                        py-4
                        leading-7
                        outline-none
                        caret-cyan-400
                        placeholder:text-slate-500
                        disabled:cursor-not-allowed
                    "
                />

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-5 py-4 border-t bg-gray-50">

                <button
                    onClick={onSave}
                    disabled={disabled}
                    className="
                        px-5 py-2
                        rounded-xl
                        bg-blue-500 
                        hover:bg-blue-700
                        text-white
                        font-medium
                        transition
                        cursor-pointer
                        disabled:cursor-not-allowed
                        disabled:bg-gray-500
                    "
                >
                    Save Script
                </button>

            </div>

        </div>
    );
}