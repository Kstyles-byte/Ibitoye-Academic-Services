import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Layout, Spacing } from '@/app/constants';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: 'none' | 'light' | 'medium' | 'strong';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card = ({
  children,
  style,
  elevation = 'medium',
  padding = 'medium',
}: CardProps) => {
  const getShadow = () => {
    if (elevation === 'none') return {};
    return Layout.shadows[elevation];
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return Spacing.sm;
      case 'large':
        return Spacing.lg;
      default:
        return Spacing.md;
    }
  };

  return (
    <View
      style={[
        styles.card,
        getShadow(),
        {
          padding: getPadding(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.card,
    overflow: 'hidden',
  },
});

export default Card; 