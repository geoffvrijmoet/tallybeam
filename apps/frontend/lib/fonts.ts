import { Font } from '@react-pdf/renderer';
import path from 'path';

let fontsRegistered = false;

export function registerFonts() {
  // Prevent registering fonts multiple times in hot-reloading environments
  if (fontsRegistered) {
      console.log("Fonts already registered.");
      return;
  }

  try {
    // Use local Inter variable font file
    const fontDir = path.join(process.cwd(), 'public', 'fonts');
    const interVariableFontPath = path.join(fontDir, 'Inter-VariableFont_opsz,wght.ttf');

    console.log(`Attempting to register font: Inter Regular from ${interVariableFontPath}`);
    Font.register({
      family: 'Inter', // Base family name
      src: interVariableFontPath,
      fontWeight: 'normal'
    });

    console.log(`Attempting to register font: Inter Bold from ${interVariableFontPath}`);
    Font.register({
      family: 'Inter-Bold', // Specific name for bold variant
      src: interVariableFontPath,
      fontWeight: 'bold'
    });
    
    // Note: Variable fonts contain multiple weights in one file
    // Both registrations above use the same source file but with different fontWeight values
    // This allows us to use both 'Inter' and 'Inter-Bold' in our StyleSheet
    // Alternative approach would be to register once and use fontWeight style property

    fontsRegistered = true;
    console.log("Fonts registered successfully.");

  } catch (error) {
      console.error("Error registering fonts:", error);
      // Decide how to handle font registration errors
      // For critical PDFs, you might want to throw the error
      // For less critical ones, logging might suffice
  }
} 