import { ThemeProvider } from "@emotion/react";
import { Button, createTheme } from "@mui/material";

export const CustomButton = ({ children, variant, color, ...rest }) => {
  const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            height: "56px",
            padding: "14px 20px",
            borderRadius: "4px",
            backgroundColor: "#0066B2",
          },
        },
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Button
        variant={variant || "contained"}
        color={color || "primary"}
        {...rest}
      >
        {children}
      </Button>
    </ThemeProvider>
  );
};
