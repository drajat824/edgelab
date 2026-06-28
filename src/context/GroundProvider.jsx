import { useReducer } from "react";
import GroundContext from "./GroundContext";
import { groundReducer, initialState } from "./GroundReducer";

export default function groundProvider({ children }) {

    const [boards, dispatch] = useReducer(
        groundReducer,
        initialState
    );

    return (
        <GroundContext.Provider value={{ boards, dispatch }}>
            {children}
        </GroundContext.Provider>
    )

}