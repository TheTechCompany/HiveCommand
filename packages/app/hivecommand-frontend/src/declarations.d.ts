import { PaletteOptions } from '@mui/material'

declare module "*.html" {
  const rawHtmlFile: string;
  export = rawHtmlFile;
}

declare module "*.bmp" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}


declare module '@mui/material/styles' {
  // interface Theme {
  //   status: {
  //     danger: React.CSSProperties['color'];
  //   };
  // }

  interface Palette {
    navigation: Palette['primary'];
  }
  interface PaletteOptions {
    navigation: PaletteOptions['primary'];
  }

  // interface PaletteColor {
  //   darker?: string;
  // }
  // interface SimplePaletteColorOptions {
  //   darker?: string;
  // }
  // interface ThemeOptions {
  //   status: {
  //     danger: React.CSSProperties['color'];
  //   };
  // }
}