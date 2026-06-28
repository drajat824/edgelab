import { useContext } from "react";
import GroundContext from "../context/GroundContext";

export default function useGround(){
    return useContext(GroundContext);
}