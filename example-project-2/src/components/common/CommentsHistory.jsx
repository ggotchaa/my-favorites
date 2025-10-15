import { Avatar } from "@mui/material";
import dayjs from "dayjs";

export const CommentsHistory = ({ comments }) => {
  return (
    <>
      <h6 className="font-bold" data-testid="comments-history-title">
        Comments history
      </h6>
      <div className="overflow-y-scroll h-[400px] max-w-[400px]">
        {comments.map((comment, index) => {
          return (
            <div
              key={index}
              className="mt-3 mb-3 bg-[#0066B214] p-2 rounded-md"
              data-testid={`comment-${index}`}
            >
              <div className="flex gap-2 items-center">
                {comment.author ? (
                  <Avatar style={{ width: 30, height: 30 }}>
                    {comment.author.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <Avatar style={{ width: 30, height: 30 }} />
                )}
                <div>
                  <p
                    className="text-xs"
                    data-testid={`comment-author-${index}`}
                  >
                    {comment.author
                      ? comment.author.toLowerCase()
                      : "Author is unknown"}
                  </p>
                  <p className="text-xs" data-testid={`comment-time-${index}`}>
                    {comment.cdcTimeStamp
                      ? dayjs(comment.cdcTimeStamp).format(
                          "MMM D YYYY, HH:mm:ss"
                        )
                      : "Time is unknown"}
                  </p>
                </div>
              </div>
              <div
                className="bg-white text-sm rounded-md p-1 mt-2"
                data-testid={`comment-text-${index}`}
              >
                {comment.comment ? comment.comment : "No comment found"}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
