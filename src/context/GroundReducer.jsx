export const initialState = [
    {
        board_id: "board-1",
        board_name: "Board 1",
        ground_truth: [
            "Hearts_2",
            "Club_3",
            "Hearts_4",
            "Club_5",
            "Club_6",
            "Spades_7",
            "Club_8",
            "Spades_9",
            "Club_10",
            "Hearts_J",
            "Club_Q",
            "Hearts_K",
            "Hearts_J",
            "Club_Q",
            "Hearts_K",
        ]
    },
    {
        board_id: "board-2",
        board_name: "Board 2",
        ground_truth: [
            "Spades_2",
            "Diamond_3",
            "Spades_4",
            "Diamond_5",
            "Spades_6",
            "Diamond_7",
            "Spades_8",
            "Diamond_9",
            "Spades_10",
            "Diamond_J",
            "Spades_Q",
            "Diamond_K",
            "Diamond_J",
            "Spades_Q",
            "Diamond_K",
        ]
    },

]

export function groundReducer(state, action) {
    switch (action.type) {

        case "SAVE_BOARD": {
            const targetBoard = action.payload;
            const isExisting = state.some((b) => b.board_id === targetBoard.board_id);

            if (isExisting) {
                return state.map((board) =>
                    board.board_id === targetBoard.board_id ? targetBoard : board
                );
            }
            return [...state, targetBoard];
        }

        case "DELETE_BOARD": {
            return state.filter((board) => board.board_id !== action.payload);
        }

        // 3. Sinkronisasi massal (misal saat pertama kali fetch semua data dari database/Raspi)
        case "SET_BOARDS": {
            return action.payload; // Payload berupa array of boards baru
        }

        default:
            return state;
    }
}