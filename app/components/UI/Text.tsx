import React, { ReactNode } from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { Typography, Colors } from '@/app/constants';

interface TextProps extends RNTextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'small';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  color?: string;
  style?: TextStyle;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text = ({
  children,
  variant = 'body',
  weight = 'regular',
  color = Colors.dark,
  style,
  align = 'auto',
  ...rest
}: TextProps) => {
  const getFontSize = () => {
    return Typography.fontSize[variant];
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'regular':
        return '400';
      case 'medium':
        return '500';
      case 'semiBold':
        return '600';
      case 'bold':
        return '700';
      default:
        return '400';
    }
  };

  return (
    <RNText
      style={[
        styles.text,
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          color,
          textAlign: align,
        } as TextStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: Typography.fontFamily.primary,
  },
});

export default Text; 