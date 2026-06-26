import { useReducer } from "react";
import CPUContext from "./CPUContext";
import { cpuReducer, initialState } from "./CPUReducer";

export default function cpuProvider({ children }) {

    const [cpu, dispatch] = useReducer(
        cpuReducer,
        initialState
    );

    return (
        <CPUContext.Provider value={{ cpu, dispatch }}>
            {children}
        </CPUContext.Provider>
    )

}