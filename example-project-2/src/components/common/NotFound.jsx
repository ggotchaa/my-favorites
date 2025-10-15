export const NotFound = ({ imageUrl, text }) => {
  return (
    <div
      className="flex w-full flex-col gap-2 justify-center items-center min-h-[300px]"
      data-testid="not-found-component"
    >
      <img src={imageUrl} alt="icon" data-testid="not-found-image" />
      <span
        className="text-center text-base not-italic font-normal leading-5 text-black/[0.54]"
        data-testid="not-found-text"
      >
        {text}
      </span>
    </div>
  );
};
