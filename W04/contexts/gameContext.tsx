import calculateWinner from "@/utils/calculateWinner";
import { getEasyMove, getHardMove, getMediumMove } from "@/utils/getBestMove";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type Difficulty = "easy" | "medium" | "hard";

type Context = {
  xIsNext: boolean;
  xWins: number;
  oWins: number;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  currentSquares: (string | null)[];
  handlePlay: (nextSquares: (string | null)[]) => void;
  resetGame: () => void;
};

const GameContext = createContext<Context>({} as Context);

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [history, setHistory] = useState<(string | null)[][]>([
    Array(9).fill(null),
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  useEffect(() => {
    const startsWithX = Math.random() < 0.5;
    xIsNext !== startsWithX && handlePlay(currentSquares);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isBoardEmpty(squares: (string | null)[]): boolean {
    return squares.every((square) => square === null);
  }

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    if (isBoardEmpty(nextSquares)) {
      setCurrentMove(0);
    }

    const winner = calculateWinner(nextSquares);
    if (winner === "X") {
      setXWins(xWins + 1);
    } else if (winner === "O") {
      setOWins(oWins + 1);
    }
  }

  function resetGame() {
    handlePlay(Array(9).fill(null));
  }

  // Automatically play "O" if it's the system's turn and the game is ongoing
  useEffect(() => {
    if (!xIsNext && !calculateWinner(currentSquares)) {
      let bestMove: number;

      if (difficulty === "easy") {
        bestMove = getEasyMove(currentSquares);
      } else if (difficulty === "medium") {
        bestMove = getMediumMove(currentSquares);
      } else {
        bestMove = getHardMove(currentSquares);
      }

      const nextSquares = currentSquares.slice();
      nextSquares[bestMove] = "O";
      handlePlay(nextSquares);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMove, xIsNext, currentSquares]);

  return (
    <GameContext.Provider
      value={{
        xIsNext,
        xWins,
        oWins,
        currentSquares,
        handlePlay,
        resetGame,
        difficulty,
        setDifficulty,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useAuth must be used within a SignupProvider");
  }

  return context;
};
