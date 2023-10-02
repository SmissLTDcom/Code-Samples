import classNames from 'classnames';
import { FC, useState } from 'react';

import styles from './Rating.module.scss';

interface Props {
  name: string;
  value: number;
  icon: Element;
  emptyIcon: Element;
  onChange: (value: number) => void;
  disabled: boolean;
}

export const Rating: FC<Props> = ({ value, name, icon, emptyIcon, onChange, disabled }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const availableRatingPoints = [1, 2, 3, 4, 5];

  const handleMouseEnter = (point: number) => {
    setHoveredRating(point);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (point: number) => {
    onChange(point);
  };

  return (
    <span className={classNames(styles.rating, { [styles.ratingDisabled]: disabled })}>
      {availableRatingPoints.map((point) => {
        return (
          <span key={point}>
            <input type="radio" id={`${name}-${point}`} name={name} value={point} className={styles.ratingInput} />
            <label
              htmlFor={`${name}-${point}`}
              className={styles.ratingLabel}
              onMouseEnter={() => handleMouseEnter(point)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(point)}
            >
              <span className={styles.ratingIcon}>
                {hoveredRating === 0 ? (point <= value ? icon : emptyIcon) : hoveredRating >= point ? icon : emptyIcon}
              </span>
            </label>
          </span>
        );
      })}
    </span>
  );
};
