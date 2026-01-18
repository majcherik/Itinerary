import React from 'react';
import styled from 'styled-components';

interface AnimatedDeleteButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const AnimatedDeleteButton: React.FC<AnimatedDeleteButtonProps> = ({ onClick, className }) => {
  return (
    <StyledWrapper className={className}>
      <button className="btn" onClick={onClick} type="button" aria-label="Delete">
        <svg viewBox="0 0 15 17.5" height="14" width={12} xmlns="http://www.w3.org/2000/svg" className="icon">
          <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .btn {
    background-color: transparent;
    position: relative;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn::after {
    content: 'delete';
    position: absolute;
    top: -130%;
    left: 50%;
    transform: translateX(-50%);
    width: fit-content;
    height: fit-content;
    background-color: rgb(168, 7, 7);
    padding: 3px 6px;
    border-radius: 4px;
    transition: .2s linear;
    transition-delay: .2s;
    color: white;
    text-transform: uppercase;
    font-size: 9px;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .icon {
    transform: scale(1.2);
    transition: .2s linear;
    fill: currentColor;
  }

  .btn:hover > .icon {
    transform: scale(1.5);
  }

  .btn:hover > .icon path {
    fill: rgb(168, 7, 7);
  }

  .btn:hover::after {
    visibility: visible;
    opacity: 1;
    top: -160%;
  }
`;

export default AnimatedDeleteButton;
