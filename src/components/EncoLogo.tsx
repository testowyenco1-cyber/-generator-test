/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoUrl from '../assets/images/enco_logo_header.png';

interface EncoLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function EncoLogo({ className = "h-9", style }: EncoLogoProps) {
  return (
    <img
      src={logoUrl}
      alt="ENCO Logo"
      className={`${className} object-contain transition-all`}
      style={style}
      referrerPolicy="no-referrer"
    />
  );
}
