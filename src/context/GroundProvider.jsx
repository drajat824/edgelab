import { useReducer } from "react";
import GroundContext from "./GroundContext";
import { groundReducer } from "./GroundReducer";

export default function groundProvider({ children }) {

    const [boards, dispatch] = useReducer(
        groundReducer
    );

    return (
        <GroundContext.Provider value={{ boards, dispatch }}>
            {children}
        </GroundContext.Provider>
    )

}