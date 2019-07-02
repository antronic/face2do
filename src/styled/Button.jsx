import styled from 'styled-components'

import { dangerRGB, primaryRGB } from './variables'

export const Button = styled('button')`
  -webkit-appearance: none;
  position: relative;
  border: 2px solid;
  border-color: rgb(${primaryRGB});
  display: inline-block;
  cursor: pointer;
  top: 0px;

  border-radius: 2px;

  padding: 8px 18px;
  font-size: 12pt;
  font-weight: 500;

  color: #fff;
  background: rgb(${primaryRGB});
  transition: all .25s ease;


  & + & {
    margin-left: 12px;
  }

  &:disabled {
    border-color: transparent;
    background: #dfdfdf;
    color: #555;
    &:hover {
      top: 0px;
      box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, .25);
    }
  }

  &:hover {
    top: -2px;
    box-shadow: 0px 2px 8px 2px rgba(${primaryRGB}, .35);
  }

  ${props => props.block && `width: 100%;`}

  ${
    (props) => {
      switch (props.kind) {
        case 'danger': {
          return `
          border-color: rgb(${dangerRGB});
          background: rgb(${dangerRGB});
          &:hover {
            box-shadow: 0px 2px 8px 2px rgba(${dangerRGB}, .35);
          }
          `
        }
        case 'secondary': {
          return `
            color: rgb(${primaryRGB});
            background: #fff;
            &:hover {
              color: #fff;
              background: rgb(${primaryRGB});
            }
          `
        }
        default:
          return ''
      }
    }
  }

  &:active {
    top: 0px;
    box-shadow: 0px 0px 0px 0px transparent;
    transition: all .075s ease;
  }
`

export default Button
