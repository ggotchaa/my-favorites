import { Paper, Fade, Modal, Backdrop } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: 400,
  maxHeight: 600,
  p: 2,
};

export const TransitionsModal = ({
  open,
  handleClose,
  children,
  customStyle,
}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 400,
        },
      }}
      data-testid="modal-component"
    >
      <Fade in={open}>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ ...style, ...customStyle }}
          data-testid="modal-paper"
        >
          {children}
        </Paper>
      </Fade>
    </Modal>
  );
};
