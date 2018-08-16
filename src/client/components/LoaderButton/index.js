// @flow
import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import './index.css';

type Props = {
  isLoading: boolean,
  text: ?React.Node,
  loadingText: ?React.Node,
  className: string,
  disabled: boolean,
};

export default ({
  isLoading,
  text,
  loadingText,
  className = '',
  disabled = false,
  ...props
}: Props) => (
  <Button
    className={`LoaderButton ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && <Glyphicon glyph="refresh" className="spinning" />}
    {!isLoading ? text : loadingText}
  </Button>
);
