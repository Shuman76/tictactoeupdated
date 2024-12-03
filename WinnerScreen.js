// WinnerScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';

const WinnerScreen = ({ route, navigation }) => {
  const { message } = route.params;

  const handlePlayAgain = () => {
    navigation.navigate('WelcomeScreen'); // Redirect to WelcomeScreen to start a new game
  };

  const isWin = !message.includes("Draw"); // Check if it's a win, not a draw

  return (
    <ImageBackground 
      source={{ uri: 'https://img.freepik.com/premium-psd/forest-with-waterfall-path-with-waterfall-background_1300443-45095.jpg?semt=ais_hybrid' }}
      style={styles.background}
    >
      <View style={styles.container}>
        {isWin && (
          <Image 
            source={require('./winner.png')} 
            style={styles.winnerImage}
          />
        )}
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
          <Text style={styles.playAgainButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
  winnerImage: {
    width: 250,  // Adjusted size for the winner image
    height: 250, // Adjusted size for the winner image
    marginBottom: 20,
    resizeMode: 'contain',
  },
  message: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playAgainButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FF5722',
    borderRadius: 10,
  },
  playAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WinnerScreen;
