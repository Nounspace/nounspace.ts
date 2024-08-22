import React, { forwardRef, useCallback, useState, useEffect } from "react";
import { FaPlus, FaImage, FaLink } from "react-icons/fa";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/atoms/avatar";
import styled from "styled-components";
import { FaPencil } from "react-icons/fa6";
import CSSInput from "@/common/components/molecules/CSSInput";
import { Link } from "@/fidgets/ui/Links";
export interface LinksInputProps {
  value: Link[];
  onChange?: (value: Link[]) => void;
}

const Box = styled.div`
  width: 100%;
`;

const TextFieldRoot = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  background: white;
  border: ${({ isActive }) =>
    isActive ? "2px solid lightblue" : "1px solid lightgray"};
  padding: 5px;
  border-radius: 4px;
  width: 100%;
`;

const TextFieldSlot = styled.div`
  display: flex;
  align-items: center;
`;

const TextFieldInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  padding: 0 5px;
`;

const LinkContainer = styled.div`
  margin-bottom: 1em;
`;

const Title = styled.p`
  font-size: 0.875rem;
  color: black;
  font-weight: bold;
`;

const SubTitle = styled.p`
  font-size: 0.875rem;
  color: gray;
`;

const AddLinkButton = styled.button`
  display: flex;
  align-items: center;
  margin-top: 10px;
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const LinksInput = forwardRef<HTMLInputElement, LinksInputProps>(
  (props, ref) => {
    const { value = [], onChange } = props;

    const [linkStates, setLinkStates] = useState<
      {
        isAvatarInputDisplayed: boolean;
        confirmed: boolean;
        isActive: boolean;
      }[]
    >([]);
    const defaultLinkState = {
      isAvatarInputDisplayed: false,
      confirmed: false,
      isActive: false,
    };

    useEffect(() => {
      if (value.length === 0) {
        const defaultLink = {
          text: "Nouns",
          url: "https://nouns.wtf",
          avatar: "/images/nouns.svg",
          description: "Funds ideas",
        };
        onChange?.([defaultLink]);
        setLinkStates([defaultLinkState]);
      } else if (linkStates.length !== value.length) {
        setLinkStates(value.map(() => defaultLinkState));
      }
    }, [value, onChange, linkStates.length]);

    const handleLinkChange = useCallback(
      (index: number, newLink: Link) => {
        const updatedLinks = [...value];
        updatedLinks[index] = newLink;
        onChange?.(updatedLinks);

        const updatedLinkStates = [...linkStates];
        if (newLink.url !== "") {
          updatedLinkStates[index].isAvatarInputDisplayed = true;
        } else {
          updatedLinkStates[index].isAvatarInputDisplayed = false;
        }
        setLinkStates(updatedLinkStates);
      },
      [value, onChange, linkStates],
    );

    const addNewLink = () => {
      onChange?.([
        ...value,
        {
          //placeholder values
          text: "New Link",
          url: "https://",
          avatar: "/images/chainEmoji.png",
          description: "Description",
        },
      ]);
      setLinkStates([
        ...linkStates,
        { isAvatarInputDisplayed: false, confirmed: false, isActive: false },
      ]);
      collapseAllLinkInputs();
    };

    const removeLink = (index: number) => {
      const updatedLinks = [...value];
      updatedLinks.splice(index, 1);
      onChange?.(updatedLinks);

      const updatedLinkStates = [...linkStates];
      updatedLinkStates.splice(index, 1);
      setLinkStates(updatedLinkStates);
    };

    const collapseAllLinkInputs = () => {
      const updatedLinkStates = linkStates.map((state) => ({
        ...state,
        isAvatarInputDisplayed: false,
        isActive: false,
      }));
      setLinkStates(updatedLinkStates);
    };

    const handleFocus = (index: number) => {
      const updatedLinkStates = linkStates.map((state, i) => ({
        ...state,
        isAvatarInputDisplayed: i === index,
        isActive: i === index,
      }));
      setLinkStates(updatedLinkStates);
    };

    const handleBlur = (index: number) => {
      const updatedLinkStates = linkStates.map((state, i) => ({
        ...state,
        isActive: i === index ? false : state.isActive,
      }));
      setLinkStates(updatedLinkStates);
    };

    return (
      <Box>
        {value.map((link, index) => (
          <LinkContainer key={index}>
            <Title>{link.text || `Link ${index + 1}`}</Title>
            <SubTitle>URL {index + 1}</SubTitle>
            <TextFieldRoot isActive={linkStates[index]?.isActive}>
              <TextFieldSlot>
                <FaLink color="lightgray" size={14} />
              </TextFieldSlot>
              <TextFieldInput
                placeholder="Link URL"
                value={link.url}
                onChange={(e: any) =>
                  handleLinkChange(index, { ...link, url: e.target.value })
                }
                onFocus={() => handleFocus(index)}
                onBlur={() => handleBlur(index)}
                isActive={linkStates[index]?.isActive}
              />
              <TextFieldSlot>
                <p
                  style={{
                    color: "lightgray",
                    cursor: "pointer",
                    marginRight: "2px",
                  }}
                  onClick={() => removeLink(index)}
                >
                  {" "}
                  x{" "}
                </p>
              </TextFieldSlot>
            </TextFieldRoot>
            {linkStates[index] && linkStates[index].isAvatarInputDisplayed && (
              <>
                <SubTitle>Title</SubTitle>
                <TextFieldRoot isActive={linkStates[index]?.isActive}>
                  <TextFieldSlot>
                    <FaPencil color="lightgray" size={14} />
                  </TextFieldSlot>
                  <TextFieldInput
                    placeholder="Link text"
                    value={link.text}
                    onChange={(e: any) =>
                      handleLinkChange(index, { ...link, text: e.target.value })
                    }
                    onFocus={() => handleFocus(index)}
                    onBlur={() => handleBlur(index)}
                  />
                </TextFieldRoot>
                <SubTitle>Avatar</SubTitle>
                <TextFieldRoot isActive={linkStates[index]?.isActive}>
                  <TextFieldSlot>
                    {link.avatar ? (
                      <Avatar style={{ width: "24px", height: "24px" }}>
                        <AvatarImage src={link.avatar} alt={"choose image"} />
                        <AvatarFallback>
                          <span className="sr-only">{link.text}</span>
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <FaImage color="lightgray" size={14} />
                    )}
                  </TextFieldSlot>
                  <TextFieldInput
                    placeholder="Avatar URL"
                    value={link.avatar}
                    onChange={(e: any) =>
                      handleLinkChange(index, {
                        ...link,
                        avatar: e.target.value,
                      })
                    }
                    onFocus={() => handleFocus(index)}
                    onBlur={() => handleBlur(index)}
                  />
                </TextFieldRoot>
                <SubTitle>Description</SubTitle>
                <CSSInput
                  value={link.description || ""}
                  onChange={(description) =>
                    handleLinkChange(index, { ...link, description })
                  }
                />
              </>
            )}
          </LinkContainer>
        ))}
        <AddLinkButton type="button" onClick={addNewLink}>
          <FaPlus style={{ marginRight: "5px" }} /> Add link
        </AddLinkButton>
      </Box>
    );
  },
);

LinksInput.displayName = "LinksInput";

export default LinksInput;
