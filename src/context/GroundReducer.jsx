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