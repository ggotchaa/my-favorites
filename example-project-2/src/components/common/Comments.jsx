import { Badge, IconButton, TextField } from "@mui/material";
import { ONLY_JDE_EQUIPMENT_CHARS } from "../../constants/jde-data";
import MoreCommentsIcon from "@mui/icons-material/Chat";

import { useState } from "react";
import { TransitionsModal } from "./Modal";
import { CommentsHistory } from "./CommentsHistory";

export const Comments = ({ row, editMode, loading, onCommentChange }) => {
  const COMMENTS_COUNT = row.comments.length;
  const [isCommentHistoryOpen, setIsCommentHistoryOpen] = useState(false);
  const [commentValue] = useState(
    () => row.comments.find((comment) => comment.current)?.comment || ""
  );
  const [newCommentValue, setNewCommentValue] = useState("");

  if (ONLY_JDE_EQUIPMENT_CHARS.includes(row.jdeAttrName)) return null;

  const handleCommentChange = (event) => {
    const newValue = event.target.value;
    setNewCommentValue(newValue);
    onCommentChange(newValue);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <span className="text-sm leading-4 text-black/[0.87] font-roboto">
          {editMode ? (
            <TextField
              className="w-full"
              size="small"
              variant="outlined"
              value={newCommentValue}
              placeholder={!newCommentValue && "New comment"}
              disabled={!editMode || loading}
              onChange={handleCommentChange}
              style={{ width: 300 }}
              data-testid="comment-input"
            />
          ) : (
            <TextField
              className="w-full"
              size="small"
              variant="outlined"
              value={commentValue}
              placeholder={!commentValue && "No comment"}
              disabled={!editMode || loading}
              style={{ width: 300 }}
              data-testid="comment-display"
            />
          )}
        </span>
        <IconButton
          disabled={!COMMENTS_COUNT}
          aria-label="comments"
          data-testid="comments-history-button"
          onClick={() => setIsCommentHistoryOpen(true)}
        >
          <Badge badgeContent={COMMENTS_COUNT}>
            <MoreCommentsIcon />
          </Badge>
        </IconButton>
      </div>
      <TransitionsModal
        open={isCommentHistoryOpen}
        handleClose={() => setIsCommentHistoryOpen(false)}
      >
        <CommentsHistory comments={row.comments} />
      </TransitionsModal>
    </>
  );
};
