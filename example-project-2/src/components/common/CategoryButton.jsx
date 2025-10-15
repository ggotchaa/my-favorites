import { ThemeProvider } from "@emotion/react";
import { Button, createTheme } from "@mui/material";

export const CategoryButton = ({
  children,
  variant,
  width,
  color,
  startIcon,
  ...rest
}) => {
  const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            width,
            height: "56px",
            padding: "12px 12px",
            justifyContent: "flex-start",
            fontSize: "16px",
            textTransform: "none",
            fontWeight: 400,
            color: "gray",
            borderColor: "gray",
            borderRadius: "4px",
            "&:hover": {
              borderColor: "gray",
              color: "gray",
              backgroundColor: "transparent",
            },
          },
        },
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Button
        startIcon={startIcon}
        variant={variant || "outlined"}
        color={color || "primary"}
        {...rest}
      >
        {children}
      </Button>
    </ThemeProvider>
  );
};
