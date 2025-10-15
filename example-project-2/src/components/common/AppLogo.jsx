export const AppLogo = () => {
  return (
    <div className="flex items-center gap-[16px]" data-testid="app-logo">
      <img
        className="flex w-12 h-12 justify-center items-center"
        src={"/TCO.png"}
        alt="app logo"
        data-testid="app-logo-image"
      />
      <h6
        className="text-white text-xl not-italic font-bold leading-6"
        data-testid="app-title"
      >
        TCO Digital Core Asset Management
      </h6>
    </div>
  );
};
