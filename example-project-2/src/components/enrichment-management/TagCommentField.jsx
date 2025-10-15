import React, { useState, useCallback } from "react";
import { TextField } from "@mui/material";
import { debounce } from "../../utils";

export const TagCommentField = React.memo(
  ({ name, initialComment, onCommentChange }) => {
    const [comment, setComment] = useState(initialComment || "");

    const debouncedOnChange = useCallback(
      debounce((value) => {
        onCommentChange(name, value);
      }, 500),
      [name, onCommentChange]
    );

    const handleChange = (e) => {
      const newValue = e.target.value;
      setComment(newValue);
      debouncedOnChange(newValue);
    };

    return (
      <TextField
        size="small"
        value={comment}
        onChange={handleChange}
        placeholder="New comment"
        style={{ width: 450 }}
        data-testid={`tag-comment-field-${name}`}
      />
    );
  }
);

TagCommentField.displayName = "TagCommentField";
