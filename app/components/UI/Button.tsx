import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Layout } from '@/app/constants';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...rest
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.muted;
    if (variant === 'outline') return 'transparent';
    return Colors[variant];
  };

  const getBorderColor = () => {
    if (disabled) return Colors.muted;
    if (variant === 'outline') return Colors.primary;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return Colors.light;
    if (variant === 'outline') return Colors.primary;
    return Colors.white;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md };
      case 'large':
        return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl };
      default:
        return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.small;
      case 'large':
        return Typography.fontSize.body * 1.2;
      default:
        return Typography.fontSize.body;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          width: fullWidth ? '100%' : undefined,
          ...getPadding(),
        } as ViewStyle,
        style,
      ]}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? Colors.primary : Colors.white}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
            } as TextStyle,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontFamily: Typography.fontFamily.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Button; 