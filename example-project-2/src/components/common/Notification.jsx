import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Notification = () => {
  return (
    <ToastContainer
      toastClassName="toast-container"
      position="top-right"
      autoClose={4000}
      hideProgressBar
      newestOnTop
      rtl={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover={false}
      theme="colored"
      transition={Slide}
      data-testid="toast-container"
    />
  );
};
