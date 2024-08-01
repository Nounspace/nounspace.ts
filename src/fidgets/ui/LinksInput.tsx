import React, { forwardRef, useCallback } from "react";
import { Input } from "@/common/components/atoms/input";
import { Link } from "./Links";
import { FaPlus, FaTrash } from "react-icons/fa6";

export interface LinksInputProps {
  value: Link[];
  onChange?: (value: Link[]) => void;
}

const LinksInput = forwardRef<HTMLInputElement, LinksInputProps>(
  (props, ref) => {
    const { value = [], onChange } = props;

    const handleLinkChange = useCallback(
      (index: number, newLink: Link) => {
        const updatedLinks = [...value];
        updatedLinks[index] = newLink;
        onChange?.(updatedLinks);
      },
      [value, onChange],
    );

    const addNewLink = () => {
      onChange?.([...value, { text: "", url: "" }]);
    };
    const removeLink = (index: number) => {
      const updatedLinks = [...value];
      updatedLinks.splice(index, 1);
      onChange?.(updatedLinks);
    };

    return (
      <div>
        {value.map((link, index) => (
          <div key={index} style={{ marginBottom: "1em" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Input
                placeholder="Link text"
                value={link.text}
                onChange={(e) =>
                  handleLinkChange(index, { ...link, text: e.target.value })
                }
                style={{ height: "30px", marginRight: "2px" }}
              />
              <button type="button" onClick={() => removeLink(index)}>
                <FaTrash color="red" />
              </button>
            </div>
            <Input
              placeholder="Link URL"
              value={link.url}
              onChange={(e) =>
                handleLinkChange(index, { ...link, url: e.target.value })
              }
              style={{ height: "30px" }}
            />
            <Input
              placeholder="Avatar"
              value={link.avatar}
              onChange={(e) =>
                handleLinkChange(index, { ...link, avatar: e.target.value })
              }
              style={{ height: "30px" }}
            />
          </div>
        ))}
        <button type="button" onClick={addNewLink}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <FaPlus style={{ marginRight: "5px" }} /> more
          </div>
        </button>
      </div>
    );
  },
);

LinksInput.displayName = "LinksInput";

export default LinksInput;
