import React from "react";

const Log = ({
    value = "",
    rows = 1,
    className = "",
}) => {

    return (
        <div className={`log-card ${className}`}>
            <p className="text-info" style={{fontWeight: "bold"}}>
                Generated Command
            </p>
            <div className="mt-4 relative">
                <textarea
                    disabled
                    value={value}
                    rows={rows}
                    className="w-full px-3 py-2 rounded-lg outline-none text-info bg-[#EBEBEB] cursor-not-allowed border border-black pr-12"
                />
            </div>
        </div>
    );
};

export default Log;