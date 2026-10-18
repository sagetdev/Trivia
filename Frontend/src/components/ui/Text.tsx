import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors, fonts, FontWeight } from '../../theme';

interface Props extends TextProps {
  size?: number;
  weight?: FontWeight;
  color?: string;
  lineHeight?: number;
  align?: TextStyle['textAlign'];
  letterSpacing?: number;
}

export function Text({
  size = 16,
  weight = 'regular',
  color = colors.text,
  lineHeight,
  align,
  letterSpacing,
  style,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: fonts[weight],
          fontSize: size,
          color,
          lineHeight,
          textAlign: align,
          letterSpacing,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}
