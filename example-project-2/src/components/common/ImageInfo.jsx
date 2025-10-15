import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";

import { getFormattedDate } from "../../utils";
import { StatusAlert } from "./StatusAlert";

export const ImageInfo = ({ selectedImageInfo }) => {
  const image = selectedImageInfo?.image;
  const user = selectedImageInfo?.user;
  return (
    <List
      dense
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        padding: 0,
        overflow: "auto",
        maxHeight: 550,
        maxWidth: 400,
      }}
      data-testid="image-info-list"
    >
      <ListItem data-testid="image-uploaded-date">
        <ListItemAvatar>
          <Avatar>
            <DateRangeOutlinedIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          data-testid="image-uploaded-date-text"
          primary="Uploaded date"
          secondary={getFormattedDate(image?.createdDate)}
        />
      </ListItem>
      <ListItem data-testid="image-uploaded-by">
        <ListItemAvatar>
          <Avatar>
            <BadgeOutlinedIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          data-testid="image-uploaded-by-text"
          primary="Uploaded by"
          secondary={
            user ? (
              <span>{`${user?.firstName} ${user?.lastName}`}</span>
            ) : (
              <StatusAlert
                component="span"
                value="User is unknown"
                severity="warning"
              />
            )
          }
        />
      </ListItem>
      <ListItem data-testid="image-operational-status">
        <ListItemAvatar>
          <Avatar>
            <BuildCircleIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          data-testid="image-operational-status-text"
          primary="Operational status"
          secondary={
            image?.equipmentOperationalStatus || (
              <StatusAlert
                component="span"
                value="Unknown operational status"
                severity="warning"
              />
            )
          }
        />
      </ListItem>
      <ListItem data-testid="image-comment">
        <ListItemAvatar>
          <Avatar>
            <MessageOutlinedIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          data-testid="image-comment-text"
          primary="Comment"
          secondary={
            image?.comment || (
              <StatusAlert
                component="span"
                value="No comments"
                severity="warning"
              />
            )
          }
        />
      </ListItem>
    </List>
  );
};
