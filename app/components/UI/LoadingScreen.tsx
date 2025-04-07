import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { Colors } from '../../constants';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light,
  },
  message: {
    marginTop: 16,
    color: Colors.muted,
  }
}); 