import React, { isValidElement } from "react";
import { List } from "react-virtualized";

export const ListboxComponent = React.forwardRef((props, ref) => {
  const { children, role, width, ...other } = props;
  const items = React.Children.toArray(children);
  const itemCount = items.length;
  const itemSize = 40;
  const listHeight = itemSize * itemCount;

  return (
    <div ref={ref} data-testid="listbox">
      <div {...other} style={{ overflowY: "hidden" }}>
        <List
          height={Math.min(listHeight, 250)}
          width={width}
          rowHeight={itemSize}
          overscanCount={5}
          rowCount={itemCount}
          rowRenderer={(listRowProps) => {
            if (isValidElement(items[listRowProps.index])) {
              return React.cloneElement(items[listRowProps.index], {
                style: listRowProps.style,
              });
            }
            return null;
          }}
          data-testid="virtualized-list"
          role={role}
        />
      </div>
    </div>
  );
});
