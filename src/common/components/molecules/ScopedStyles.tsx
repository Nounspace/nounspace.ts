import styled from "@emotion/styled";
import { css } from "@emotion/react";

type StyleProviderProps = {
  /**
   * A string or array of CSS style strings.
   */
  cssStyles?: string | string[];
};

/**
 * A wrapper component that applies and scopes user-provided CSS within itself.
 *
 * @todo Sanitize styles
 */
const StyleProvider = styled.div<StyleProviderProps>(
  (props) => css`
    ${props.cssStyles}
  `,
);

export default StyleProvider;
