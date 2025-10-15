export const Container = ({ children }) => {
  return (
    <div
      className="h-auto p-0 m-0 min-h-lvh bg-[#FAFAFA]"
      data-testid="container"
    >
      {children}
    </div>
  );
};
