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
  bsStyle: ?string,
};

export default ({
  isLoading,
  text,
  loadingText,
  className = '',
  disabled = false,
  bsStyle = 'default',
  ...props
}: Props) => (
  <Button
    className={`LoaderButton ${className}`}
    disabled={disabled || isLoading}
    bsStyle={bsStyle}
    {...props}
  >
    {isLoading && <Glyphicon glyph="refresh" className="spinning" />}
    {!isLoading ? text : loadingText}
  </Button>
);
