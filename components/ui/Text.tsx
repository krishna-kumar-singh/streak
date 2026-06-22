import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'label' | 'muted';

interface TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  style?: any;
  weight?: '400' | '500' | '600' | '700';
  color?: string;
  center?: boolean;
}

export function Text({
  variant = 'body',
  children,
  style,
  weight,
  color,
  center = false,
}: TextProps) {
  const variantStyles: Record<TextVariant, any> = {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodySm: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    label: { fontSize: 12, fontWeight: '500', lineHeight: 18 },
    muted: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: color || (variant === 'muted' ? '#94A3B8' : '#FFFFFF') },
        weight && { fontWeight: weight },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
