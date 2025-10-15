export const NoPermission = () => {
  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-full mt-40 gap-2"
      data-testid="no-permission"
    >
      <h1
        className="text-sm text-black/[0.5]"
        data-testid="no-permission-title"
      >
        Permission denied.
      </h1>
      <p
        className="text-xs text-black/[0.5]"
        data-testid="no-permission-message"
      >
        Sorry, you do not have permission to view this page or page does not
        exist.
      </p>
    </div>
  );
};
