import { useContext } from "react";
import CPUContext from "../context/CPUContext";

export default function useCPU(){
    return useContext(CPUContext);
}