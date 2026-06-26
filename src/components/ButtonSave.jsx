export default function ButtonSave({
    activeGovernor,
    currentGovernor,
    onClick,
    children = "SAVE",
    className = "",
    disabled
}) {

    return (
        <button
            className={`px-4 py-2 rounded-lg cursor-pointer transition shadow-md bg-[var(--primary)] hover:bg-[#2c6b2e] text-white w-full lg:w-32 disabled:bg-[#EBEBEB] disabled:cursor-not-allowed disabled:text-gray-500 ${className}`}
            disabled={disabled}
            onClick={onClick}
        >
            <p className="text-info">{children}</p>
        </button>
    );
}