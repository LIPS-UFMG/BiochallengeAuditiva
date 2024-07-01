import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

const AlertsScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/5 - alertas.png')} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  }
});

export default AlertsScreen;
