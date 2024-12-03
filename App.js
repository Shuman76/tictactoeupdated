import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
} from 'react-native'; 
import { Audio } from 'expo-av';
import WinnerScreen from './WinnerScreen';

const Stack = createStackNavigator();

const WelcomeScreen = ({ navigation }) => {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [startSound, setStartSound] = useState();

  const playStartSound = async () => {
    const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/start.mp3'));
    setStartSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return startSound ? () => startSound.unloadAsync() : undefined;
  }, [startSound]);

  const handleStartGame = () => {
    if (player1 && player2) {
      playStartSound();
      navigation.navigate('GameScreen', { player1, player2 });
    } else {
      alert('Please enter names for both players');
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://img.freepik.com/premium-psd/forest-with-waterfall-path-with-waterfall-background_1300443-45095.jpg?semt=ais_hybrid' }}
      style={styles.background}
    >
      <Text style={styles.welcomeText}>Enter Name</Text>
      <TextInput
        placeholder="Player 1"
        value={player1}
        onChangeText={setPlayer1}
        style={styles.input}
      />
      <TextInput
        placeholder="Player 2"
        value={player2}
        onChangeText={setPlayer2}
        style={styles.input}
      />
      <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const GameScreen = ({ route, navigation }) => {
  const { player1, player2 } = route.params;
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ [player1]: 0, [player2]: 0 });
  const [winningLine, setWinningLine] = useState(null);
  const [clickSound, setClickSound] = useState();
  const [winnerSound, setWinnerSound] = useState();
  const [drawSound, setDrawSound] = useState();

  const playClickSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/sounds/clicked.mp3')
    );
    setClickSound(sound);
    await sound.playAsync();
  };

  const playWinnerSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/sounds/winner.mp3')
    );
    setWinnerSound(sound);
    await sound.playAsync();
  };

  const playDrawSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/sounds/draw.mp3')
    );
    setDrawSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return () => {
      clickSound && clickSound.unloadAsync();
      winnerSound && winnerSound.unloadAsync();
      drawSound && drawSound.unloadAsync();
    };
  }, [clickSound, winnerSound, drawSound]);

  useEffect(() => {
    if (winningLine) {
      playWinnerSound();
      const timer = setTimeout(() => {
        const winningPlayer = isXNext ? player2 : player1;
        navigation.navigate('WinnerScreen', { message: `${winningPlayer} Wins!` });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [winningLine]);

  const handlePress = (index) => {
    if (board[index] || winningLine) return;

    playClickSound();
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const line = calculateWinner(newBoard);
    if (line) {
      const winningPlayer = isXNext ? player1 : player2;
      setWinningLine(line);
      setScore((prevScore) => ({
        ...prevScore,
        [winningPlayer]: prevScore[winningPlayer] + 1,
      }));
    } else if (!newBoard.includes(null)) {
      playDrawSound();
      navigation.navigate('WinnerScreen', { message: "It's a Draw!" });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine(null);
  };

  const renderSquare = (index) => {
    const value = board[index];
    return (
      <TouchableOpacity style={styles.square} onPress={() => handlePress(index)}>
        <Text style={[styles.squareText, value === 'X' ? styles.xText : styles.oText]}>{value}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://img.freepik.com/premium-psd/forest-with-waterfall-path-with-waterfall-background_1300443-45095.jpg?semt=ais_hybrid' }}
      style={styles.background}
    >
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBoard}>
          <Text style={styles.playerName}>{player1}</Text>
          <Text style={styles.scoreText}>{score[player1]}</Text>
        </View>
        <View style={styles.scoreBoard}>
          <Text style={styles.playerName}>{player2}</Text>
          <Text style={styles.scoreText}>{score[player2]}</Text>
        </View>
      </View>
      <Text style={styles.turnText}>Your Turn: {isXNext ? player1 : player2}</Text>
      <View style={styles.board}>
        {winningLine && <View style={[styles.winningLine, getWinningLineStyle(winningLine)]} />}
        {Array.from({ length: 9 }, (_, index) => renderSquare(index))}
      </View>
      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>Reset Game</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return line;
    }
  }
  return null;
};

const getWinningLineStyle = (line) => {
  switch (JSON.stringify(line)) {
    case JSON.stringify([0, 1, 2]):
      return { top: '16.66%', left: '0%', width: '100%', height: 5 };
    case JSON.stringify([3, 4, 5]):
      return { top: '50%', left: '0%', width: '100%', height: 5 };
    case JSON.stringify([6, 7, 8]):
      return { top: '83.33%', left: '0%', width: '100%', height: 5 };
    case JSON.stringify([0, 3, 6]):
      return { top: '0%', left: '16.66%', height: '100%', width: 5 };
    case JSON.stringify([1, 4, 7]):
      return { top: '0%', left: '50%', height: '100%', width: 5 };
    case JSON.stringify([2, 5, 8]):
      return { top: '0%', left: '83.33%', height: '100%', width: 5 };
    case JSON.stringify([0, 4, 8]):
      return { top: '0%', left: '0%', width: '140%', height: 5, transform: [{ rotate: '45deg' }] };
    case JSON.stringify([2, 4, 6]):
      return { top: '0%', left: '0%', width: '140%', height: 5, transform: [{ rotate: '-45deg' }] };
    default:
      return {};
  }
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="WinnerScreen" component={WinnerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    color: '#FFD700',
    fontSize: 18,
  },
  welcomeText: {
    fontSize: 36,
    color: '#FFD700',
    marginBottom: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  startButton: {
    padding: 10,
    backgroundColor: '#FF5722',
    borderRadius: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '50%',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    marginVertical: 15,
  },
  scoreText: {
    fontSize: 18,
    color: 'white',
  },
  turnText: {
    fontSize: 22,
    color: '#FF5722',
    marginVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'relative',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 15,
  },
  square: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  squareText: {
    fontSize: 70,
    fontWeight: 'bold',
  },
  xText: {
    color: '#5BC0EB',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  oText: {
    color: 'orange',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF5722',
    borderRadius: 10,
  },
  resetButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  winningLine: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    height: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

export default App;
