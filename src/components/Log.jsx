import React, { useEffect, useState } from "react";

const TypingText = ({ text = "", speed }) => {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        setDisplayed("");

        let index = 0;
        const interval = setInterval(() => {
            index++;
            setDisplayed(text.slice(0, index));

            if (index >= text.length) {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return <>{displayed}</>;
};

const Log = ({
    value = [],
    className = "",
}) => {
    const commandsArray = Array.isArray(value) ? value : [];

    return (
        <div className={`log-card ${className}`}>
            <p className="text-info" style={{ fontWeight: "bold" }}>
                Generated Command
            </p>

            <div className="mt-4 space-y-3 p-3 rounded-lg bg-[#EBEBEB] border border-black">
                {commandsArray.length === 0 ? (
                    <span className="text-gray-500 italic text-sm">
                        No commands generated.
                    </span>
                ) : (
                    commandsArray.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-sm"
                        >
                            <span
                                style={{ fontWeight: "normal" }}
                                className="text-subinfo min-w-[130px] shrink-0 flex-auto w-fit"
                            >
                                • {item.label}
                            </span>

                            <code className="bg-white/60 px-2 py-1 rounded border border-gray-300 font-mono text-md text-green-600 break-all w-full">
                                <TypingText
                                    text={item.command}
                                    speed={30}
                                />
                                {/* <span className="animate-pulse hidden">|</span> */}
                            </code>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Log;