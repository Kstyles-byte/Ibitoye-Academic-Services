import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { Colors, Spacing } from '@/app/constants';

interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padded?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
}

export const Container = ({
  children,
  style,
  scrollable = false,
  padded = true,
  backgroundColor = Colors.light,
}: ContainerProps) => {
  const containerStyles = [
    styles.container,
    {
      padding: padded ? Spacing.md : 0,
      backgroundColor,
    },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={containerStyles}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default Container; 